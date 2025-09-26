'use client';
import { Character } from '@/types/characters';
import styles from './page.module.css';
import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Medal } from 'lucide-react';
import Link from 'next/link';
import { characterService, progressService } from '@/services';
import { Howl } from 'howler';

export default function CharacterList() {
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [allCharacters, setAllCharacters] = useState<Character[]>([]);
  const [unlockedCharacterIds, setUnlockedCharacterIds] = useState<string[]>([]);

  useEffect(() => {
    // Show all characters
    const characters = characterService.getAllCharacters();
    setAllCharacters(characters);
    
    // Get unlocked characters for medal display
    const unlockedIds = progressService.getUnlockedCharacters();
    setUnlockedCharacterIds(unlockedIds);
  }, []);

  const handleBack = () => {
    if (selectedCharacter) {
      setSelectedCharacter(null);
    }
  };

  const playLetterSound = useCallback((letter: string) => {
    if (/^[a-zA-Z]$/.test(letter)) {
      const upperLetter = letter.toUpperCase();
      const sound = new Howl({
        src: [`/sounds/alphabet/english/${upperLetter}.mp3`],
        volume: 1.0,
      });
      sound.play();
    }
  }, []);

  return (
    <main className={`${styles.main} ${selectedCharacter ? styles.hasSelected : ''}`}>
      <nav className={styles.nav}>
        {selectedCharacter ? (
          <button 
            onClick={handleBack}
            className={styles.backButton}
          >
            <ArrowLeft size={32} />
          </button>
        ) : (
          <Link href="/" className={styles.backButton}>
            <ArrowLeft size={32} />
          </Link>
        )}
      </nav>
      <div className={styles.grid}>
        {allCharacters.map((character) => {
          const isUnlocked = unlockedCharacterIds.includes(character.id);
          return (
            <div 
              key={character.id} 
              className={`${styles.characterWrapper} ${selectedCharacter === character ? styles.selected : ''}`}
            >
              <div 
                className={styles.characterCard}
                onClick={() => setSelectedCharacter(character === selectedCharacter ? null : character)}
              >
                <div className={styles.cardContent}>
                  <img
                    src={character.imageUrl}
                    alt={character.name}
                    className={styles.characterImage}
                  />
                  {isUnlocked && (
                    <div className={styles.medalBadge}>
                      <Medal size={24} color="#FFD700" />
                    </div>
                  )}
                </div>
              </div>
              {selectedCharacter === character && (
                <div className={styles.characterName}>
                  {character.name.toLowerCase().split('').map((letter, index) => (
                    <span
                      key={index}
                      className={styles.letterSpan}
                      onClick={() => playLetterSound(letter)}
                    >
                      {letter}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
} 