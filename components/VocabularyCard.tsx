'use client';

import React, { useState, useMemo, useRef } from 'react';
import Image from 'next/image';
import { Howl } from 'howler';
import styles from './VocabularyCard.module.css';
import { VocabularyWord } from '@/types/vocabulary';

interface VocabularyCardProps {
  word: VocabularyWord;
}

const gradients = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
  'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  'linear-gradient(135deg, #8ec5fc 0%, #e0c3fc 100%)',
  'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)',
  'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
  'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
  'linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 100%)',
  'linear-gradient(135deg, #92fe9d 0%, #00c9ff 100%)',
  'linear-gradient(135deg, #fc466b 0%, #3f5efb 100%)',
];

const VocabularyCard: React.FC<VocabularyCardProps> = ({ word }) => {
  const [imageError, setImageError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const cooldownRef = useRef<NodeJS.Timeout | null>(null);
  const imagePath = `/images/vocabulary/${word.id}.webp`;
  
  const randomGradient = useMemo(() => {
    const index = word.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return gradients[index % gradients.length];
  }, [word.id]);

  const playSound = (language: 'en' | 'fr' | 'it') => {
    if (isPlaying) return;
    
    setIsPlaying(true);
    
    const soundPath = `/sounds/vocabulary/${language}/${word.id}.mp3`;
    const sound = new Howl({
      src: [soundPath],
      onend: () => {
        cooldownRef.current = setTimeout(() => {
          setIsPlaying(false);
          cooldownRef.current = null;
        }, 1000);
      },
      onloaderror: () => {
        console.error(`Failed to load sound: ${soundPath}`);
        setIsPlaying(false);
      },
    });
    
    sound.play();
  };

  return (
    <div className={styles.card} style={{ '--card-gradient': randomGradient } as React.CSSProperties}>
      <div className={styles.shinyBorder}></div>
      <div className={styles.categoryBadge}>{word.category}</div>
      
      <div className={styles.imageContainer}>
        {!imageError ? (
          <Image
            src={imagePath}
            alt={`${word.english} - ${word.french} - ${word.italian}`}
            width={240}
            height={240}
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover',
              borderRadius: '10px'
            }}
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : (
          <div className={styles.imagePlaceholder} style={{ background: randomGradient }}>
            <div style={{ fontSize: '48px', marginBottom: '8px' }}>🖼️</div>
            <div>{word.english}</div>
          </div>
        )}
      </div>

      <div className={styles.wordDisplay}>
        <div className={styles.languageRow}>
          <span className={styles.flag}>🇬🇧</span>
          <span 
            className={`${styles.word} ${styles.english} ${isPlaying ? styles.disabled : ''}`}
            onClick={() => playSound('en')}
            style={{ cursor: isPlaying ? 'not-allowed' : 'pointer' }}
          >
            {word.english}
          </span>
        </div>
        
        <div className={styles.languageRow}>
          <span className={styles.flag}>🇫🇷</span>
          <span 
            className={`${styles.word} ${styles.french} ${isPlaying ? styles.disabled : ''}`}
            onClick={() => playSound('fr')}
            style={{ cursor: isPlaying ? 'not-allowed' : 'pointer' }}
          >
            {word.french}
          </span>
        </div>
        
        <div className={styles.languageRow}>
          <span className={styles.flag}>🇮🇹</span>
          <span 
            className={`${styles.word} ${styles.italian} ${isPlaying ? styles.disabled : ''}`}
            onClick={() => playSound('it')}
            style={{ cursor: isPlaying ? 'not-allowed' : 'pointer' }}
          >
            {word.italian}
          </span>
        </div>
      </div>
    </div>
  );
};

export default VocabularyCard;