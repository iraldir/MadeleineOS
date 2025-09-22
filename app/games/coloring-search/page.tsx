'use client';
import { useState, useEffect } from 'react';
import styles from './page.module.css';
import Link from 'next/link';
import { ArrowLeft, HelpCircle, Printer, Maximize2 } from 'lucide-react';
import TypingInterface from '@/components/TypingInterface';
import { characters, secretCharacters } from '@/types/characters';
import { Howl } from 'howler';
import confetti from 'canvas-confetti';
import dynamic from 'next/dynamic';
import { isLocked, incrementLockCounter, resetLock } from '@/types/lock';

const STORAGE_KEY = 'coloringSearch_completedCharacters';

const MathGame = dynamic(() => import('@/app/games/math/page'), {
  ssr: false
});

export default function ColoringSearch() {
  const [selectedCharacter, setSelectedCharacter] = useState<typeof characters[0] | null>(null);
  const [error, setError] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [completedCharacters, setCompletedCharacters] = useState<string[]>([]);
  const [printMode, setPrintMode] = useState<{ imagePath: string; index: number } | null>(null);
  const [showMathGame, setShowMathGame] = useState(false);

  useEffect(() => {
    // Load completed characters from localStorage
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setCompletedCharacters(JSON.parse(saved));
    }
  }, []);

  const celebrate = () => {
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 15,
        angle: 60,
        spread: 60,
        origin: { x: 0, y: 0.8 },
        colors: ['#26a69a', '#00897b', '#00796b', '#00695c', '#004d40'],
      });
      
      confetti({
        particleCount: 15,
        angle: 120,
        spread: 60,
        origin: { x: 1, y: 0.8 },
        colors: ['#26a69a', '#00897b', '#00796b', '#00695c', '#004d40'],
      });

      if (Math.random() < 0.3) {
        confetti({
          particleCount: 20,
          angle: 90,
          spread: 100,
          origin: { x: Math.random(), y: 0.3 },
          colors: ['#26a69a', '#00897b', '#00796b', '#00695c', '#004d40'],
          gravity: 1.2,
        });
      }

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  };

  const handleEnter = (text: string) => {
    const character = [...characters, ...secretCharacters].find(c => c.name === text);
    
    if (character && character.coloringPages?.length) {
      // Success case
      const success = new Howl({
        src: ['/sounds/success.mp3'],
        volume: 1.0,
      });
      
      setIsTransitioning(true);
      success.play();
      celebrate();

      // Add to completed characters if not already completed
      if (!completedCharacters.includes(character.id)) {
        const newCompleted = [...completedCharacters, character.id];
        setCompletedCharacters(newCompleted);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newCompleted));
      }
      
      setTimeout(() => {
        setSelectedCharacter(character);
        setIsTransitioning(false);
      }, 2000);
      
      setError(false);
    } else {
      // Error case
      const reject = new Howl({
        src: ['/sounds/reject.mp3'],
        volume: 1.0,
      });
      reject.play();
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
    console.log('Print clicked'); // Debug

    // Check if already locked
    if (isLocked()) {
      console.log('System is locked, showing math game'); // Debug
      setShowMathGame(true);
      return;
    }

    // Increment counter and check if we should lock
    const shouldLock = incrementLockCounter();
    console.log('Print attempted, should lock:', shouldLock); // Debug

    // Verify the current state
    const currentState = localStorage.getItem(STORAGE_KEY);
    console.log('Current state after increment:', currentState); // Debug

    if (shouldLock) {
      console.log('Locking system and showing math game'); // Debug
      setShowMathGame(true);
    } else {
      console.log('Printing...'); // Debug
      window.print();
    }
  };

  const handleMathComplete = () => {
    resetLock();
    setShowMathGame(false);
    window.print();
  };

  return (
    <main className={`${styles.main} ${printMode ? styles.printMode : ''}`}>
      <nav className={`${styles.nav} ${printMode ? styles.hideForPrint : ''}`}>
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
      
      {selectedCharacter ? (
        <>
          {printMode ? (
            <div className={styles.printPreview}>
              <img 
                src={printMode.imagePath} 
                alt={`${selectedCharacter.name} coloring page ${printMode.index + 1}`}
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
          className={`${error ? styles.error : ''} ${isTransitioning ? styles.success : ''}`}
        />
      )}
      
      {!selectedCharacter && (
        <div className={styles.progressTracker}>
          {[...characters, ...secretCharacters].map(character => (
            <div 
              key={character.id} 
              className={`${styles.characterIcon} ${completedCharacters.includes(character.id) ? styles.completed : ''} ${character.isSecret ? styles.secret : ''}`}
              title={completedCharacters.includes(character.id) ? character.name : '???'}
            >
              {character.isSecret && !completedCharacters.includes(character.id) ? (
                <div className={styles.secretIcon}>
                  <HelpCircle size={40} />
                </div>
              ) : (
                <img 
                  src={completedCharacters.includes(character.id) ? character.imageUrl.replace('question-mark.webp', `${character.id}.webp`) : character.imageUrl}
                  alt={completedCharacters.includes(character.id) ? character.name : '???'}
                  className={styles.characterImage}
                />
              )}
            </div>
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