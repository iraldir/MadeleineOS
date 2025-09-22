'use client';
import { useState, useEffect } from 'react';
import styles from './MathProblem.module.css';
import { MathProblem as MathProblemType } from '@/types/math';
import { audioService } from '@/services/audioService';
import { progressService } from '@/services/progressService';
import Image from 'next/image';

interface MathProblemProps {
  problem: MathProblemType;
  onSuccess: () => void;
  onFail?: () => void;
  darkMode?: boolean;
  showVisuals?: boolean;
  autoFocus?: boolean;
}

export default function MathProblem({ 
  problem, 
  onSuccess, 
  onFail, 
  darkMode = false,
  showVisuals = false,
  autoFocus = true
}: MathProblemProps) {
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const correctAnswer = problem.operation === '+'
    ? problem.num1 + problem.num2
    : problem.num1 - problem.num2;

  const handleSubmit = () => {
    if (isTransitioning || !answer) return;

    const numAnswer = parseInt(answer);
    const problemStr = `${problem.num1} ${problem.operation} ${problem.num2}`;
    
    if (numAnswer === correctAnswer) {
      audioService.playSuccess();
      progressService.recordMathAnswer(problemStr, true);
      setIsTransitioning(true);
      
      setTimeout(() => {
        onSuccess();
        setAnswer('');
        setIsTransitioning(false);
      }, 1000);
    } else {
      audioService.playFailure();
      progressService.recordMathAnswer(problemStr, false);
      setError(true);
      
      if (onFail) {
        setTimeout(() => {
          onFail();
        }, 1000);
      } else {
        setTimeout(() => {
          setError(false);
          setAnswer('');
        }, 500);
      }
    }
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (isTransitioning) return;

      if (e.key >= '0' && e.key <= '9') {
        setAnswer(prev => prev.length < 2 ? prev + e.key : prev);
      } else if (e.key === 'Enter' && answer) {
        handleSubmit();
      } else if (e.key === 'Backspace') {
        setAnswer(prev => prev.slice(0, -1));
      }
    };

    if (autoFocus) {
      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }
  }, [answer, isTransitioning, autoFocus]);

  const renderVisuals = () => {
    if (!showVisuals || problem.num1 > 5 || problem.num2 > 5) return null;

    return (
      <div className={styles.visuals}>
        <div className={styles.visualGroup}>
          {Array(problem.num1).fill(0).map((_, i) => (
            <Image
              key={`a-${i}`}
              src="/images/math/apple.webp"
              alt="apple"
              width={60}
              height={60}
              className={styles.apple}
            />
          ))}
        </div>
        <div className={styles.visualOperation}>{problem.operation}</div>
        <div className={styles.visualGroup}>
          {Array(problem.num2).fill(0).map((_, i) => (
            <Image
              key={`b-${i}`}
              src="/images/math/apple.webp"
              alt="apple"
              width={60}
              height={60}
              className={styles.apple}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={`${styles.container} ${darkMode ? styles.darkMode : ''}`}>
      <div className={styles.problem}>
        {renderVisuals()}
        <div className={styles.equation}>
          <span className={styles.number}>{problem.num1}</span>
          <span className={styles.operation}>{problem.operation}</span>
          <span className={styles.number}>{problem.num2}</span>
          <span className={styles.equals}>=</span>
          <div className={`${styles.answer} ${error ? styles.error : ''} ${isTransitioning ? styles.success : ''}`}>
            {answer}
            <div className={styles.cursor} />
          </div>
        </div>
      </div>
      {!autoFocus && (
        <div className={styles.buttons}>
          <div className={styles.numpad}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(num => (
              <button
                key={num}
                onClick={() => setAnswer(prev => prev.length < 2 ? prev + num : prev)}
                className={styles.numButton}
                disabled={isTransitioning}
              >
                {num}
              </button>
            ))}
          </div>
          <div className={styles.actions}>
            <button
              onClick={() => setAnswer('')}
              className={styles.clearButton}
              disabled={isTransitioning}
            >
              Clear
            </button>
            <button
              onClick={handleSubmit}
              className={styles.submitButton}
              disabled={!answer || isTransitioning}
            >
              Check
            </button>
          </div>
        </div>
      )}
    </div>
  );
}