"use client";
import { useState, useEffect, useCallback } from "react";
import styles from "./page.module.css";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { MathLevel } from "@/types/math";
import { Howl } from "howler";
import { currencyService } from "@/services";
import { celebrationService } from "@/services";

const STORAGE_KEY = "mathGame_progress";
const HIGH_SCORE_KEY = "mathGame_highScore";
const TOTAL_PROBLEMS = 30;

// Generate random addition problems with numbers 0-10
const generateProblems = (): MathLevel[] => {
  const problems: MathLevel[] = [];
  for (let i = 0; i < TOTAL_PROBLEMS; i++) {
    const num1 = Math.floor(Math.random() * 11); // 0-10
    const num2 = Math.floor(Math.random() * 11); // 0-10
    problems.push({
      num1,
      num2,
      operation: '+',
      showApples: false
    });
  }
  return problems;
};

export default function MathGame() {
  const [problems] = useState<MathLevel[]>(() => generateProblems());
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answer, setAnswer] = useState<string>("");
  const [error, setError] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [fromColoringGame, setFromColoringGame] = useState(false);
  const [questionsAnswered, setQuestionsAnswered] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [hasBeatenHighScore, setHasBeatenHighScore] = useState(false);

  useEffect(() => {
    // Check if coming from coloring game
    const searchParams = new URLSearchParams(window.location.search);
    const fromColoring = searchParams.get("from") === "coloring";
    setFromColoringGame(fromColoring);

    // Load high score
    const savedHighScore = localStorage.getItem(HIGH_SCORE_KEY);
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore));
    }

    // Only load saved progress if coming from coloring game
    if (fromColoring) {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setCurrentIndex(parseInt(saved));
      }
    }
    // If not from coloring game, index stays at 0 (beginning)
  }, []);

  const currentProblem = problems[currentIndex];

  // Play audio sequence when problem changes
  useEffect(() => {
    if (currentProblem && !error && !isTransitioning) {
      const { num1, num2 } = currentProblem;
      
      // Create sounds with onend callbacks to chain them properly
      const sound1 = new Howl({
        src: [`/sounds/alphabet/english/${num1}.mp3`],
        volume: 1.0,
        onend: () => {
          // Play "plus" after first number finishes
          const plusSound = new Howl({
            src: [`/sounds/alphabet/english/plus.mp3`],
            volume: 1.0,
            onend: () => {
              // Play second number after "plus" finishes
              const sound2 = new Howl({
                src: [`/sounds/alphabet/english/${num2}.mp3`],
                volume: 1.0,
              });
              sound2.play();
            }
          });
          plusSound.play();
        }
      });
      
      // Start playing the sequence
      sound1.play();
    }
  }, [currentIndex, currentProblem, error, isTransitioning]);

  const handleEnter = useCallback((text: string) => {
    const numAnswer = parseInt(text);
    const correctAnswer = currentProblem.num1 + currentProblem.num2;

    if (numAnswer === correctAnswer) {
      const success = new Howl({
        src: ["/sounds/success.mp3"],
        volume: 1.0,
      });
      success.play();
      setIsTransitioning(true);

      // Track questions answered and streak
      const newQuestionsAnswered = questionsAnswered + 1;
      const newStreak = streak + 1;
      setQuestionsAnswered(newQuestionsAnswered);
      setStreak(newStreak);

      // Check if beaten high score and award coin
      if (newStreak > highScore && !hasBeatenHighScore) {
        currencyService.addCoins(1);
        celebrationService.celebrate();
        setHasBeatenHighScore(true);
      }

      // Award 1 coin for every 5 questions in streak
      if (newStreak % 5 === 0) {
        currencyService.addCoins(1);
        celebrationService.celebrate();
      }

      // Update high score if needed
      if (newStreak > highScore) {
        setHighScore(newStreak);
        localStorage.setItem(HIGH_SCORE_KEY, newStreak.toString());
      }

      setTimeout(() => {
        const nextIndex = currentIndex + 1;
        // Continue with new problems or loop back
        if (nextIndex < problems.length) {
          setCurrentIndex(nextIndex);
          if (fromColoringGame) {
            localStorage.setItem(STORAGE_KEY, nextIndex.toString());
          }
        } else {
          // Generate new set of problems and continue
          setCurrentIndex(0);
        }
        setAnswer("");
        setIsTransitioning(false);
      }, 1000);
    } else {
      const reject = new Howl({
        src: ["/sounds/reject.mp3"],
        volume: 1.0,
      });
      reject.play();
      setError(true);
      setStreak(0); // Reset streak on error

      setTimeout(() => {
        setError(false);
        setAnswer("");
      }, 500);
    }
  }, [currentProblem, questionsAnswered, streak, highScore, hasBeatenHighScore, currentIndex, problems.length, fromColoringGame]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (isTransitioning) return;

      if (e.key >= "0" && e.key <= "9") {
        setAnswer(prev => prev.length < 2 ? prev + e.key : prev);
      } else if (e.key === "Enter" && answer) {
        handleEnter(answer);
      } else if (e.key === "Backspace") {
        setAnswer(prev => prev.slice(0, -1));
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [answer, isTransitioning, handleEnter]);

  return (
    <main className={styles.main}>
      <nav className={styles.nav}>
          <Link
            href={fromColoringGame ? "/games/coloring-search" : "/"}
            className={styles.backButton}
          >
            <ArrowLeft size={32} />
          </Link>
      </nav>

      <div className={styles.streakIndicator}>
        <span>Streak: {streak}</span>
        {streak > 0 && streak % 5 === 0 && (
          <span className={styles.coinReward}>+1 🪙</span>
        )}
      </div>

      <div className={styles.problem}>
        <div className={styles.equation}>
          <div className={styles.numberGroup}>
            <div className={styles.number}>{currentProblem?.num1}</div>
          </div>

          <div className={styles.operation}>{currentProblem?.operation}</div>

          <div className={styles.numberGroup}>
            <div className={styles.number}>{currentProblem?.num2}</div>
          </div>

          <div className={styles.operation}>=</div>

          <div
            className={`${styles.answer} ${error ? styles.error : ""} ${
              isTransitioning ? styles.success : ""
            }`}
          >
            {answer}
            <div className={styles.cursor} />
          </div>
        </div>
      </div>

      {/* Score bar similar to character recognition */}
      <div className={styles.progressBar}>
        <div
          className={styles.highScoreBar}
          style={{
            width: `${(highScore + 1) * 24}px`,
          }}
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
    </main>
  );
}
