"use client";
import { useState, useEffect } from "react";
import styles from "./page.module.css";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { mathProgression } from "@/types/math";
import { Howl } from "howler";
import { currencyService } from "@/services";

const STORAGE_KEY = "mathGame_progress";

export default function MathGame() {
  const [level, setLevel] = useState<number>(0);
  const [answer, setAnswer] = useState<string>("");
  const [error, setError] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [fromColoringGame, setFromColoringGame] = useState(false);
  const [questionsAnswered, setQuestionsAnswered] = useState<number>(0);

  useEffect(() => {
    // Check if coming from coloring game
    const searchParams = new URLSearchParams(window.location.search);
    const fromColoring = searchParams.get("from") === "coloring";
    setFromColoringGame(fromColoring);

    // Only load saved progress if coming from coloring game
    if (fromColoring) {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setLevel(parseInt(saved));
      }
    }
    // If not from coloring game, level stays at 0 (beginning)
  }, []);

  const currentProblem = mathProgression[level];

  const handleKeyPress = (e: KeyboardEvent) => {
    if (isTransitioning) return;

    if (e.key >= "0" && e.key <= "9" && !answer) {
      setAnswer(e.key);
    } else if (e.key === "Enter" && answer) {
      handleEnter(answer);
    } else if (e.key === "Backspace") {
      setAnswer("");
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [answer, isTransitioning]);

  const handleEnter = (text: string) => {
    const numAnswer = parseInt(text);
    const correctAnswer =
      currentProblem.operation === "+"
        ? currentProblem.num1 + currentProblem.num2
        : currentProblem.num1 - currentProblem.num2;

    if (numAnswer === correctAnswer) {
      const success = new Howl({
        src: ["/sounds/success.mp3"],
        volume: 1.0,
      });
      success.play();
      setIsTransitioning(true);

      // Track questions answered and award coins
      const newQuestionsAnswered = questionsAnswered + 1;
      setQuestionsAnswered(newQuestionsAnswered);

      // Award 1 coin for every 5 questions answered
      if (newQuestionsAnswered % 5 === 0) {
        currencyService.addCoins(1);
      }

      setTimeout(() => {
        const nextLevel = level + 1;
        // Continue with normal progression
        if (nextLevel < mathProgression.length) {
          setLevel(nextLevel);
          if (fromColoringGame) {
            localStorage.setItem(STORAGE_KEY, nextLevel.toString());
          }
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

      setTimeout(() => {
        setError(false);
        setAnswer("");
      }, 500);
    }
  };

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

      <div className={styles.problem}>
        <div className={styles.equation}>
          <div className={styles.numberGroup}>
            <div className={styles.number}>{currentProblem.num1}</div>
          </div>

          <div className={styles.operation}>{currentProblem.operation}</div>

          <div className={styles.numberGroup}>
            <div className={styles.number}>{currentProblem.num2}</div>
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
    </main>
  );
}
