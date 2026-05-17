"use client";
import { useState, useEffect } from "react";
import styles from "./page.module.css";
import Link from "next/link";
import { ArrowLeft, HelpCircle, Printer } from "lucide-react";
import TypingInterface from "@/components/TypingInterface";
import { characters, secretCharacters } from "@/types/characters";
import { audioService, celebrationService } from "@/services";
import { currencyService } from "@/services/currencyService";
import { progressService } from "@/services/progressService";

export default function ColoringSearch() {
  const [selectedCharacter, setSelectedCharacter] = useState<
    (typeof characters)[0] | null
  >(null);
  const [error, setError] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [unlockedCharacters, setUnlockedCharacters] = useState<string[]>([]);
  const [printMode, setPrintMode] = useState<{
    imagePath: string;
    index: number;
  } | null>(null);

  useEffect(() => {
    // Load unlocked characters from progressService
    const unlocked = progressService.getUnlockedCharacters();
    setUnlockedCharacters(unlocked);
  }, []);

  const handleEnter = (text: string) => {
    const character = [...characters, ...secretCharacters].find(
      (c) => c.name === text
    );

    if (character && character.coloringPages?.length) {
      setIsTransitioning(true);
      audioService.playSuccess();
      celebrationService.bigCelebration();

      if (!unlockedCharacters.includes(character.id)) {
        progressService.unlockCharacter(character.id);
        const newUnlocked = [...unlockedCharacters, character.id];
        setUnlockedCharacters(newUnlocked);
        currencyService.addCoins(1);
      }

      setTimeout(() => {
        setSelectedCharacter(character);
        setIsTransitioning(false);
      }, 2000);

      setError(false);
    } else {
      audioService.playFailure();
      setError(true);

      setTimeout(() => {
        setError(false);
      }, 500);
    }
  };

  const handleBack = () => {
    if (printMode) {
      setPrintMode(null);
    } else if (selectedCharacter) {
      setSelectedCharacter(null);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <main className={`${styles.main} ${printMode ? styles.printMode : ""}`}>
      <nav className={`${styles.nav} ${printMode ? styles.hideForPrint : ""}`}>
        {selectedCharacter ? (
          <button onClick={handleBack} className={styles.backButton}>
            <ArrowLeft size={32} />
          </button>
        ) : (
          <Link href="/" className={styles.backButton}>
            <ArrowLeft size={32} />
          </Link>
        )}
      </nav>

      {selectedCharacter ? (
        <>
          {printMode ? (
            <div className={styles.printPreview}>
              <img
                src={printMode.imagePath}
                alt={`${selectedCharacter.name} coloring page ${
                  printMode.index + 1
                }`}
                className={styles.printImage}
              />
              <button
                onClick={handlePrint}
                className={styles.printAction}
                title="Print"
              >
                <Printer size={24} />
              </button>
            </div>
          ) : (
            <div className={styles.coloringGrid}>
              {selectedCharacter.coloringPages?.map((imagePath, index) => (
                <div
                  key={index}
                  className={styles.coloringCard}
                  onClick={() => setPrintMode({ imagePath, index })}
                  role="button"
                  tabIndex={0}
                  title="View full screen"
                >
                  <img
                    src={imagePath}
                    alt={`${selectedCharacter.name} coloring page ${index + 1}`}
                    className={styles.coloringImage}
                  />
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <TypingInterface
          onEnter={handleEnter}
          className={`${error ? styles.error : ""} ${
            isTransitioning ? styles.success : ""
          }`}
        />
      )}

      {!selectedCharacter && (
        <div className={styles.progressTracker}>
          {[...characters, ...secretCharacters].map((character) => (
            <div
              key={character.id}
              className={`${styles.characterIcon} ${
                unlockedCharacters.includes(character.id)
                  ? styles.completed
                  : ""
              } ${character.isSecret ? styles.secret : ""}`}
              title={
                unlockedCharacters.includes(character.id)
                  ? character.name
                  : "???"
              }
            >
              {character.isSecret &&
              !unlockedCharacters.includes(character.id) ? (
                <div className={styles.secretIcon}>
                  <HelpCircle />
                </div>
              ) : (
                <img
                  src={
                    unlockedCharacters.includes(character.id)
                      ? character.imageUrl.replace(
                          "question-mark.webp",
                          `${character.id}.webp`
                        )
                      : character.imageUrl
                  }
                  alt={
                    unlockedCharacters.includes(character.id)
                      ? character.name
                      : "???"
                  }
                  className={styles.characterImage}
                />
              )}
            </div>
          ))}
        </div>
      )}

    </main>
  );
}
