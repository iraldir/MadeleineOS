"use client";
import { useState, useEffect } from "react";
import styles from "./page.module.css";
import Link from "next/link";
import { ArrowLeft, ChevronRight, Send } from "lucide-react";
import TypingInterface from "@/components/TypingInterface";
import { characterService, audioService, celebrationService, currencyService } from "@/services";
import dynamic from "next/dynamic";
import { resetLock } from "@/types/lock";

// No longer using localStorage to store progress

// Get ordered characters from centralized service
const getOrderedCharacters = () => {
  const characterOrder = characterService.getCharacterOrder();
  return characterOrder
    .map(id => characterService.getCharacterById(id))
    .filter(Boolean);
};

const MathGame = dynamic(() => import("@/app/games/math/page"), {
  ssr: false,
});

export default function CharacterWriting() {
  const orderedCharacters = getOrderedCharacters();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [showMathGame, setShowMathGame] = useState(false);
  const [text, setText] = useState("");
  const [highScore, setHighScore] = useState(0);

  // Load high score from localStorage on component mount
  useEffect(() => {
    const savedHighScore = localStorage.getItem("characterWritingHighScore");
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10));
    }
  }, []);

  // Reset text when current character changes
  useEffect(() => {
    setText("");
  }, [currentIndex]);


  const handleEnter = (text: string) => {
    const currentCharacter = orderedCharacters[currentIndex];

    if (currentCharacter && text === currentCharacter.name) {
      // Success case
      setIsTransitioning(true);
      audioService.playSuccess();
      celebrationService.celebrate();

      setTimeout(() => {
        if (currentIndex < orderedCharacters.length - 1) {
          // Move to next character
          const nextIndex = currentIndex + 1;
          setCurrentIndex(nextIndex);

          // Update high score if needed and award coins
          if (nextIndex > highScore) {
            setHighScore(nextIndex);
            localStorage.setItem(
              "characterWritingHighScore",
              nextIndex.toString()
            );
            // Award 2 coins for beating the high score
            currencyService.addCoins(2);
          }
        } else {
          // Completed all characters
          setCompleted(true);
          // Set high score to max if completed
          setHighScore(orderedCharacters.length - 1);
          localStorage.setItem(
            "characterWritingHighScore",
            (orderedCharacters.length - 1).toString()
          );
        }
        setIsTransitioning(false);
        setText(""); // Reset text input for the next character
      }, 1500);

      setError(false);
    } else {
      // Error case
      audioService.playFailure();
      setError(true);

      setTimeout(() => {
        setError(false);
        setText(""); // Reset text input after error
      }, 500);
    }
  };

  const handleReset = () => {
    // Reset progress
    setCurrentIndex(0);
    setCompleted(false);
    // No longer storing progress in localStorage
  };

  const handleMathComplete = () => {
    resetLock();
    setShowMathGame(false);
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
              alt="Character to write"
              className={styles.characterImage}
            />
          </div>

          <div className={styles.inputContainer}>
            <TypingInterface
              onEnter={handleEnter}
              onTextChange={(text) => setText(text)}
              value={text}
              className={`${error ? styles.error : ""} ${
                isTransitioning ? styles.success : ""
              }`}
            />
            <button
              onClick={() => handleEnter(text)}
              className={styles.submitButton}
              title="Submit"
            >
              <Send size={24} />
            </button>
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
          <MathGame
            darkMode={true}
            onComplete={handleMathComplete}
            isLockScreen={false}
          />
        </div>
      )}
    </main>
  );
}
