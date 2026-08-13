"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Mic, Square, RotateCcw } from "lucide-react";
import styles from "./page.module.css";
import {
  ReadingSentence,
  pickNextSentence,
  sentenceImage,
} from "./sentences";
import { displayWords, useSpeechRecognition } from "@/lib/speech";
import { playWordChime, playSentenceComplete } from "./wordChime";
import {
  audioService,
  celebrationService,
  currencyService,
  challengeService,
} from "@/services";

const HIGH_SCORE_KEY = "readingSentences_highScore";
const LISTEN_MS = 60000;
/** How many sentences to keep out of the bag before they can come round again. */
const RECENT_MEMORY = 12;

type Phase = "ready" | "listening" | "success" | "retry" | "gameover";

export default function ReadingSentencesGame() {
  const [isMounted, setIsMounted] = useState(false);
  const [streak, setStreak] = useState(0);
  const [highScore, setHighScore] = useState(0);
  // Only ever read inside the setState updater below, never during render.
  const [, setRecent] = useState<string[]>([]);
  const [sentence, setSentence] = useState<ReadingSentence | null>(null);
  const [phase, setPhase] = useState<Phase>("ready");
  const [matchedWords, setMatchedWords] = useState<boolean[]>([]);
  const [lastHeard, setLastHeard] = useState("");
  /** A missing illustration must never cost her the reward for reading it. */
  const [imageBroken, setImageBroken] = useState(false);

  const sentenceRef = useRef<ReadingSentence | null>(null);
  sentenceRef.current = sentence;
  const streakRef = useRef(0);
  streakRef.current = streak;
  const highScoreRef = useRef(0);
  highScoreRef.current = highScore;

  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem(HIGH_SCORE_KEY);
    if (saved) setHighScore(parseInt(saved) || 0);
    setSentence(pickNextSentence(0, []));
  }, []);

  const advance = useCallback(
    (current: ReadingSentence | null, nextStreak: number) => {
      setRecent((previous) => {
        const nextRecent = current
          ? [current.id, ...previous].slice(0, RECENT_MEMORY)
          : previous;
        setSentence(pickNextSentence(nextStreak, nextRecent));
        return nextRecent;
      });
      setPhase("ready");
      setMatchedWords([]);
      setLastHeard("");
      setImageBroken(false);
    },
    []
  );

  const handleSuccess = useCallback(() => {
    const current = sentenceRef.current;
    if (!current) return;
    playSentenceComplete(displayWords(current.text).length);
    audioService.playSuccess();
    challengeService.recordProgress("reading-sentences");

    const newStreak = streakRef.current + 1;
    setStreak(newStreak);
    // A coin only for a new best, so it stays worth something.
    if (newStreak > highScoreRef.current) {
      setHighScore(newStreak);
      localStorage.setItem(HIGH_SCORE_KEY, newStreak.toString());
      currencyService.addCoins(1);
      celebrationService.quickBurst();
    } else {
      celebrationService.celebrate();
    }

    setMatchedWords(displayWords(current.text).map(() => true));
    setPhase("success");
    setTimeout(() => advance(current, newStreak), 3500);
  }, [advance]);

  const handleFailure = useCallback(() => {
    audioService.playFailure();
    setPhase((p) => (p === "retry" ? "gameover" : "retry"));
  }, []);

  const speech = useSpeechRecognition({
    language: "en",
    timeoutMs: LISTEN_MS,
    onProgress: (matched) => setMatchedWords(matched),
    onResult: (result, transcript) => {
      setMatchedWords(result.matched);
      if (result.passed) {
        handleSuccess();
      } else {
        setLastHeard(transcript);
        handleFailure();
      }
    },
  });

  const listen = useCallback(() => {
    const current = sentenceRef.current;
    if (!current) return;
    setMatchedWords([]);
    setLastHeard("");
    setPhase("listening");
    speech.start({ text: current.text, alternates: current.alternates });
  }, [speech]);

  const handleMicTap = useCallback(() => {
    if (phase === "listening") {
      speech.stop();
      return;
    }
    listen();
  }, [phase, speech, listen]);

  const handlePlayAgain = useCallback(() => {
    setStreak(0);
    setRecent([]);
    setSentence(pickNextSentence(0, []));
    setMatchedWords([]);
    setLastHeard("");
    setPhase("ready");
  }, []);

  /**
   * Dev-only escape hatch: speech recognition cannot be driven headlessly, so
   * "s" wins the round when the app is served by `next dev`. It is not rendered
   * anywhere, and the whole block is dead code in a production build.
   */
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "s" && phase !== "success") handleSuccess();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, handleSuccess]);

  const words = useMemo(
    () => (sentence ? displayWords(sentence.text) : []),
    [sentence]
  );

  /**
   * Sound the words that have just landed.
   *
   * The recogniser often confirms two or three at once, so these are spread out
   * a little rather than played on top of each other — a chord says "something
   * happened", where a quick run says "you read three more words".
   */
  const previousMatchedRef = useRef<boolean[]>([]);
  useEffect(() => {
    const previous = previousMatchedRef.current;
    previousMatchedRef.current = matchedWords;
    if (phase !== "listening") return;

    const landed = matchedWords.reduce<number[]>(
      (acc, isMatched, index) => (isMatched && !previous[index] ? [...acc, index] : acc),
      []
    );
    landed.forEach((index, i) =>
      window.setTimeout(() => playWordChime(index), i * 90)
    );
  }, [matchedWords, phase]);

  if (!isMounted || !sentence) {
    return (
      <main className={styles.main}>
        <nav className={styles.nav}>
          <Link href="/" className={styles.backButton}>
            <ArrowLeft size={32} />
          </Link>
        </nav>
      </main>
    );
  }

  // Only shown once listening has actually been tried and failed — there is no
  // second recogniser behind this one, so say plainly that it is not working
  // rather than let her read to something that is not listening.
  if (speech.status === "unavailable") {
    return (
      <main className={styles.main}>
        <nav className={styles.nav}>
          <Link href="/" className={styles.backButton}>
            <ArrowLeft size={32} />
          </Link>
        </nav>
        <div className={styles.unsupported}>
          <h1>I can&apos;t hear you right now</h1>
          <p>{speech.error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <nav className={styles.nav}>
        <Link href="/" className={styles.backButton}>
          <ArrowLeft size={32} />
        </Link>
      </nav>

      <div className={styles.streakIndicator}>
        <span>Streak: {streak}</span>
        {streak > 0 && streak % 2 === 0 && (
          <span className={styles.coinReward}>+1 🪙</span>
        )}
      </div>

      {phase === "gameover" ? (
        <div className={styles.gameOver}>
          <h1>Game Over!</h1>
          <p>
            Streak: <strong>{streak}</strong>
          </p>
          <button className={styles.playAgain} onClick={handlePlayAgain}>
            <RotateCcw size={28} /> Play Again
          </button>
        </div>
      ) : phase === "success" ? (
        <div className={styles.successOverlay}>
          <div className={styles.successImageWrap}>
            {imageBroken ? (
              <div className={styles.successFallback}>⭐️</div>
            ) : (
              <Image
                src={sentenceImage(sentence)}
                alt={sentence.text}
                fill
                sizes="(max-width: 768px) 92vw, 70vw"
                className={styles.successImage}
                onError={() => setImageBroken(true)}
                priority
              />
            )}
          </div>
          <div className={styles.successSentence}>{sentence.text}</div>
        </div>
      ) : (
        <div className={styles.gameArea}>
          <p className={styles.sentenceCard}>
            {words.map((word, index) => (
              <span
                key={`${word}-${index}`}
                className={`${styles.word} ${
                  matchedWords[index] ? styles.wordMatched : ""
                }`}
              >
                {word}
              </span>
            ))}
          </p>

          <div className={styles.status}>
            {phase === "listening"
              ? "Read it out loud…"
              : phase === "retry"
                ? lastHeard
                  ? `I heard: "${lastHeard}"`
                  : "I didn't catch that — try again"
                : "Tap the microphone, then read the sentence"}
          </div>

          <button
            className={`${styles.micButton} ${
              phase === "listening" ? styles.listening : ""
            }`}
            onClick={handleMicTap}
            aria-label={phase === "listening" ? "Stop" : "Start reading"}
          >
            {phase === "listening" ? <Square size={52} /> : <Mic size={60} />}
            {phase === "listening" && (
              <svg className={styles.timerRing} viewBox="0 0 100 100">
                <circle className={styles.timerRingTrack} cx="50" cy="50" r="46" />
                <circle
                  className={styles.timerRingProgress}
                  cx="50"
                  cy="50"
                  r="46"
                  style={{ animationDuration: `${LISTEN_MS}ms` }}
                />
              </svg>
            )}
          </button>
        </div>
      )}

      <div className={styles.progressBar}>
        <div className={styles.progressInner}>
          <div
            className={styles.highScoreBar}
            style={{ width: `${Math.max(0, highScore * 24 - 8)}px` }}
          />
          {Array.from({ length: 30 }, (_, index) => (
            <div
              key={index}
              className={`${styles.progressDot} ${
                index === streak ? styles.current : ""
              } ${index < streak ? styles.completed : ""}`}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
