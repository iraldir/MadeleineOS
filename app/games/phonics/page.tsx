"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Mic, Square, RotateCcw } from "lucide-react";
import styles from "./page.module.css";
import {
  PhonicsWord,
  judgeMatch,
  pickNextWord,
  imageFilename,
} from "./words";
import { useSpeechRecognition } from "@/lib/speech";
import { audioService, celebrationService, currencyService, challengeService } from "@/services";

const HIGH_SCORE_KEY = "phonicsGame_highScore";
const LISTEN_MS = 6000;
/** How many words to hold out of the bag before they can come round again. */
const RECENT_MEMORY = 15;

type Phase = "ready" | "listening" | "success" | "retry" | "gameover";

export default function PhonicsGame() {
  const [isMounted, setIsMounted] = useState(false);
  const [streak, setStreak] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [recent, setRecent] = useState<string[]>([]);
  const [currentWord, setCurrentWord] = useState<PhonicsWord | null>(null);
  const [phase, setPhase] = useState<Phase>("ready");
  const [lastHeard, setLastHeard] = useState("");
  const [interim, setInterim] = useState("");

  const currentWordRef = useRef<PhonicsWord | null>(null);
  currentWordRef.current = currentWord;

  const advance = useCallback(
    (current: PhonicsWord | null, nextStreak: number) => {
      const nextRecent = current
        ? [current.word, ...recent].slice(0, RECENT_MEMORY)
        : recent;
      setRecent(nextRecent);
      const next = pickNextWord(nextStreak, nextRecent);
      setCurrentWord(next);
      setPhase("ready");
      setLastHeard("");
      setInterim("");
    },
    [recent]
  );

  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem(HIGH_SCORE_KEY);
    if (saved) setHighScore(parseInt(saved) || 0);
    const first = pickNextWord(0, []);
    setCurrentWord(first);
  }, []);

  const handleSuccess = useCallback(() => {
    const word = currentWordRef.current;
    if (!word) return;
    audioService.playSuccess();
    challengeService.recordProgress("phonics");
    const newStreak = streak + 1;
    setStreak(newStreak);
    // A coin only for a new best. Reading two in a row stopped being an
    // achievement a while ago, and a reward she cannot fail to get is not
    // really a reward.
    if (newStreak > highScore) {
      setHighScore(newStreak);
      localStorage.setItem(HIGH_SCORE_KEY, newStreak.toString());
      currencyService.addCoins(1);
      celebrationService.quickBurst();
    } else {
      celebrationService.celebrate();
    }
    setPhase("success");
    setTimeout(() => {
      advance(word, newStreak);
    }, 2500);
  }, [streak, highScore, advance]);

  const handleFailedAttempt = useCallback(() => {
    audioService.playFailure();
    setPhase((p) => (p === "retry" ? "gameover" : "retry"));
  }, []);

  const shouldMatch = useCallback((transcript: string) => {
    const word = currentWordRef.current;
    if (!word) return false;
    return judgeMatch(word, transcript);
  }, []);

  const speech = useSpeechRecognition({
    language: "en",
    timeoutMs: LISTEN_MS,
    // The phonics game keeps its own verdict: at three letters "cat" and "cap"
    // are the distinction it exists to teach, so a short word must be exact.
    judge: shouldMatch,
    onProgress: (_matched, transcript) => setInterim(transcript),
    onResult: (result, transcript) => {
      if (result.passed) {
        handleSuccess();
      } else {
        setLastHeard(transcript);
        handleFailedAttempt();
      }
    },
  });

  const listen = useCallback(() => {
    const word = currentWordRef.current;
    if (!word) return;
    setLastHeard("");
    setInterim("");
    setPhase("listening");
    // The word's own accepted spellings are passed through so the highlighting
    // agrees with the verdict; `judge` still has the final say.
    speech.start({
      text: word.word,
      alternates: { [word.word.toLowerCase()]: word.match },
    });
  }, [speech]);

  const handleMicTap = useCallback(() => {
    if (phase === "listening") {
      speech.stop();
      return;
    }
    listen();
  }, [phase, speech, listen]);

  const handleRetry = listen;

  const handlePlayAgain = useCallback(() => {
    setStreak(0);
    setRecent([]);
    const next = pickNextWord(0, []);
    setCurrentWord(next);
    setLastHeard("");
    setInterim("");
    setPhase("ready");
  }, []);

  const imgSrc = useMemo(
    () => (currentWord ? `/images/phonics/${imageFilename(currentWord)}` : ""),
    [currentWord]
  );

  if (!isMounted || !currentWord) {
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
            <Image
              src={imgSrc}
              alt={currentWord.word}
              fill
              sizes="(max-width: 768px) 80vw, 60vh"
              className={styles.successImage}
              priority
            />
          </div>
          <div className={styles.successWord}>{currentWord.word}</div>
        </div>
      ) : (
        <div className={styles.gameArea}>
          {/* Fetched while she works the word out, so the picture is already
              there when she gets it. Rendered rather than preloaded by URL:
              next/image serves an optimised URL, so preloading the .webp would
              fetch something the <Image> above never asks for. */}
          <div className={styles.rewardPreload} aria-hidden="true">
            <Image
              src={imgSrc}
              alt=""
              fill
              sizes="(max-width: 768px) 80vw, 60vh"
            />
          </div>

          <div className={styles.wordCard}>{currentWord.word}</div>

          <div className={styles.interim}>
            {phase === "listening"
              ? interim || "Listening…"
              : phase === "retry"
                ? lastHeard
                  ? `I heard: "${lastHeard}"`
                  : "I didn't catch that"
                : " "}
          </div>

          {phase === "retry" ? (
            <button className={styles.retryButton} onClick={handleRetry}>
              Try again
            </button>
          ) : (
            <button
              className={`${styles.micButton} ${phase === "listening" ? styles.listening : ""}`}
              onClick={handleMicTap}
              aria-label={phase === "listening" ? "Stop" : "Start speaking"}
            >
              {phase === "listening" ? <Square size={56} /> : <Mic size={64} />}
              {phase === "listening" && (
                <svg className={styles.timerRing} viewBox="0 0 100 100">
                  <circle
                    className={styles.timerRingTrack}
                    cx="50"
                    cy="50"
                    r="46"
                  />
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
          )}
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
