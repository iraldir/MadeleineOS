"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { Howl } from "howler";
import PlanetSphere from "@/components/PlanetSphere";
import { ALL_BODIES, Planet, planetAudioUrl } from "@/types/planets";
import { audioService, celebrationService, challengeService } from "@/services";
import styles from "./page.module.css";

const HIGH_SCORE_KEY = "planetQuizHighScore";
const OPTION_COUNT = 4;

const shuffle = <T,>(items: T[]): T[] =>
  [...items].sort(() => Math.random() - 0.5);

export default function PlanetQuiz() {
  const [order, setOrder] = useState<Planet[]>(() => shuffle(ALL_BODIES));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [options, setOptions] = useState<Planet[]>([]);
  const [error, setError] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const voicesRef = useRef<Map<string, Howl>>(new Map());

  const current = order[currentIndex];

  const speak = useCallback((id: string) => {
    let voice = voicesRef.current.get(id);
    if (!voice) {
      voice = new Howl({ src: [planetAudioUrl(id)], volume: 1 });
      voicesRef.current.set(id, voice);
    }
    voice.play();
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem(HIGH_SCORE_KEY);
    if (saved) setHighScore(parseInt(saved, 10));
  }, []);

  // The 3D canvas has a fixed pixel size, so it has to be told about resizes.
  const [stageSize, setStageSize] = useState(340);
  useEffect(() => {
    const fit = () =>
      setStageSize(
        Math.max(
          200,
          Math.min(340, window.innerWidth - 48, window.innerHeight - 340)
        )
      );
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  // Build the answer choices for the current planet
  useEffect(() => {
    if (completed || !current) return;
    const decoys = shuffle(ALL_BODIES.filter((body) => body.id !== current.id)).slice(
      0,
      OPTION_COUNT - 1
    );
    setOptions(shuffle([current, ...decoys]));
  }, [current, completed]);

  const handleOptionClick = (selected: Planet) => {
    if (isTransitioning || !current) return;

    if (selected.id === current.id) {
      setIsTransitioning(true);
      setError(false);
      audioService.playSuccess();
      celebrationService.celebrate();
      challengeService.recordProgress("planet-quiz");
      // Hearing the name right after getting it right makes it stick.
      setTimeout(() => speak(current.id), 350);

      setTimeout(() => {
        const nextIndex = currentIndex + 1;
        if (nextIndex > highScore) {
          setHighScore(nextIndex);
          localStorage.setItem(HIGH_SCORE_KEY, nextIndex.toString());
        }
        if (nextIndex < order.length) {
          setCurrentIndex(nextIndex);
        } else {
          setCompleted(true);
          celebrationService.bigCelebration();
        }
        setIsTransitioning(false);
      }, 1800);
    } else {
      // Same rule as Character Recognition: a wrong answer starts the run over.
      audioService.playFailure();
      setError(true);
      setTimeout(() => {
        setError(false);
        setCurrentIndex(0);
        setOrder(shuffle(ALL_BODIES));
      }, 1000);
    }
  };

  const handleReset = () => {
    setOrder(shuffle(ALL_BODIES));
    setCurrentIndex(0);
    setCompleted(false);
  };

  return (
    <main className={styles.main}>
      <nav className={styles.nav}>
        <Link href="/" className={styles.backButton} aria-label="Back to games">
          <ArrowLeft size={32} />
        </Link>
      </nav>

      {completed ? (
        <div className={styles.gameArea}>
          <p className={styles.congratsMessage}>
            You know every planet in the solar system!
          </p>
          <button onClick={handleReset} className={styles.nextButton}>
            Play Again <ChevronRight size={20} />
          </button>
        </div>
      ) : (
        <div className={styles.gameArea}>
          <h1 className={styles.question}>Which one is this?</h1>

          <div
            className={`${styles.planetStage} ${
              isTransitioning ? styles.success : ""
            }`}
            style={{ ["--accent" as string]: current?.color }}
          >
            {current && (
              <PlanetSphere key={current.id} planet={current} size={stageSize} />
            )}
          </div>

          <div
            className={`${styles.optionsContainer} ${error ? styles.error : ""}`}
          >
            {options.map((option) => (
              <button
                key={option.id}
                onClick={() => handleOptionClick(option)}
                className={styles.optionButton}
                disabled={isTransitioning}
              >
                {option.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {!completed && (
        <div className={styles.progressBar}>
          {order.map((body, index) => (
            <div
              key={body.id}
              className={`${styles.progressDot} ${
                index === currentIndex ? styles.current : ""
              } ${index < currentIndex ? styles.completed : ""} ${
                index < highScore ? styles.record : ""
              }`}
            />
          ))}
        </div>
      )}
    </main>
  );
}
