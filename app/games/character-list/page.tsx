'use client';
import { Character } from '@/types/characters';
import styles from './page.module.css';
import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { characterService, progressService } from '@/services';

export default function CharacterList() {
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [visibleCharacters, setVisibleCharacters] = useState<Character[]>([]);

  useEffect(() => {
    const characters = characterService.getAllCharacters();
    const unlockedIds = progressService.getUnlockedCharacters();
    
    // Find the index of the last unlocked character
    let lastUnlockedIndex = -1;
    for (let i = characters.length - 1; i >= 0; i--) {
      if (unlockedIds.includes(characters[i].id)) {
        lastUnlockedIndex = i;
        break;
      }
    }
    
    // Show all unlocked characters + 3 more
    const maxVisibleIndex = Math.min(lastUnlockedIndex + 3, characters.length - 1);
    const visible = characters.slice(0, maxVisibleIndex + 1);
    
    setVisibleCharacters(visible);
  }, []);

  const handleBack = () => {
    if (selectedCharacter) {
      setSelectedCharacter(null);
    }
  };

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
        {visibleCharacters.map((character) => (
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
              </div>
            </div>
            {selectedCharacter === character && (
              <div className={styles.characterName}>
                {character.name.toLowerCase()}
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
} 