"use client";
import { useState, useEffect, useMemo } from "react";
import styles from "./page.module.css";
import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { characterService, audioService, celebrationService, mathService } from "@/services";
import { resetLock } from "@/types/lock";
import MathProblem from "@/components/MathProblem";

// Get ordered characters from centralized service
const getOrderedCharacters = () => {
  const characterOrder = characterService.getCharacterOrder();
  return characterOrder
    .map(id => characterService.getCharacterById(id))
    .filter(Boolean);
};

export default function CharacterRecognition() {
  const orderedCharacters = useMemo(() => getOrderedCharacters(), []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [options, setOptions] = useState<string[]>([]);
  const [error, setError] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [showMathGame, setShowMathGame] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [currentProblem, setCurrentProblem] = useState(() =>
    mathService.generateProblem("easy")
  );

  // Load high score from localStorage on component mount
  useEffect(() => {
    const savedHighScore = localStorage.getItem(
      "characterRecognitionHighScore"
    );
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10));
    }
  }, []);

  // Generate 6 options including the correct answer
  useEffect(() => {
    if (completed) return;

    const currentCharacter = orderedCharacters[currentIndex];
    if (!currentCharacter) return;

    // Get 5 random characters different from the current one
    const otherCharacters = [...orderedCharacters]
      .filter((char) => char?.id !== currentCharacter.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 5);

    // Combine with current character and shuffle
    const allOptions = [currentCharacter, ...otherCharacters]
      .sort(() => Math.random() - 0.5)
      .map((char) => char?.name || "");

    setOptions(allOptions);
  }, [currentIndex, completed, orderedCharacters]);


  const handleOptionClick = (selectedName: string) => {
    if (isTransitioning) return;

    const currentCharacter = orderedCharacters[currentIndex];

    if (currentCharacter && selectedName === currentCharacter.name) {
      // Success case
      setIsTransitioning(true);
      audioService.playSuccess();
      celebrationService.celebrate();

      setTimeout(() => {
        if (currentIndex < orderedCharacters.length - 1) {
          // Move to next character
          const nextIndex = currentIndex + 1;
          setCurrentIndex(nextIndex);

          // Update high score if needed
          if (nextIndex > highScore) {
            setHighScore(nextIndex);
            localStorage.setItem(
              "characterRecognitionHighScore",
              nextIndex.toString()
            );
          }
        } else {
          // Completed all characters
          setCompleted(true);
          // Set high score to max if completed
          setHighScore(orderedCharacters.length - 1);
          localStorage.setItem(
            "characterRecognitionHighScore",
            (orderedCharacters.length - 1).toString()
          );
        }
        setIsTransitioning(false);
      }, 1500);

      setError(false);
    } else {
      // Error case - go back to the beginning
      audioService.playFailure();
      setError(true);

      setTimeout(() => {
        setError(false);
        // Reset to the first character
        setCurrentIndex(0);
      }, 1000);
    }
  };

  const handleReset = () => {
    // Reset progress
    setCurrentIndex(0);
    setCompleted(false);
  };

  const handleMathComplete = () => {
    resetLock();
    setShowMathGame(false);
    // Generate new problem for next time
    setCurrentProblem(mathService.generateProblem("easy"));
  };

  const handleMathFail = () => {
    // Generate a new problem
    setCurrentProblem(mathService.generateProblem("easy"));
  };

  const currentCharacter = orderedCharacters[currentIndex];

  return (
    <main className={styles.main}>
      <nav className={styles.nav}>
        <Link href="/" className={styles.backButton}>
          <ArrowLeft size={32} />
        </Link>
      </nav>

      {completed ? (
        <div className={styles.gameArea}>
          <div className={styles.congratsMessage}>
            <p>Congratulations! You&apos;ve completed all characters!</p>
          </div>
          <button onClick={handleReset} className={styles.nextButton}>
            Play Again <ChevronRight size={20} />
          </button>
        </div>
      ) : (
        <div className={styles.gameArea}>
          <div className={styles.characterDisplay}>
            <img
              src={currentCharacter?.imageUrl}
              alt="Character to recognize"
              className={styles.characterImage}
            />
          </div>

          <div
            className={`${styles.optionsContainer} ${
              error ? styles.error : ""
            } ${isTransitioning ? styles.success : ""}`}
          >
            {options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleOptionClick(option)}
                className={styles.optionButton}
                disabled={isTransitioning}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}

      {!completed && (
        <div className={styles.progressBar}>
          <div
            className={styles.highScoreBar}
            style={{
              width: `${(highScore + 1) * 24}px`,
            }}
          />
          {orderedCharacters.map((_, index) => (
            <div
              key={index}
              className={`${styles.progressDot} ${
                index === currentIndex ? styles.current : ""
              } ${index < currentIndex ? styles.completed : ""}`}
            />
          ))}
        </div>
      )}

      {showMathGame && (
        <div className={styles.mathOverlay}>
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.95)",
              zIndex: 9999,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <h2
              style={{
                color: "white",
                fontSize: "2rem",
                marginBottom: "2rem",
                textAlign: "center",
              }}
            >
              Great job! Solve this bonus problem
            </h2>
            <MathProblem
              problem={currentProblem}
              onSuccess={handleMathComplete}
              onFail={handleMathFail}
              darkMode={true}
              showVisuals={currentProblem.num1 <= 5 && currentProblem.num2 <= 5}
            />
          </div>
        </div>
      )}
    </main>
  );
}
