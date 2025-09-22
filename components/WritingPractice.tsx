'use client';
import { useState, useEffect, useCallback } from 'react';
import styles from './WritingPractice.module.css';
import { Trash2, Check, X } from 'lucide-react';
import { audioService } from '@/services/audioService';
import { celebrationService } from '@/services/celebrationService';

interface WritingPracticeProps {
  targetText: string;
  onSuccess?: () => void;
  onFailure?: () => void;
  onTextChange?: (text: string) => void;
  placeholder?: string;
  caseSensitive?: boolean;
  allowPartialMatch?: boolean;
  showHint?: boolean;
  hintDelay?: number;
  cooldownMs?: number;
  playLetterSounds?: boolean;
  soundsPath?: string;
  showVisualFeedback?: boolean;
  autoFocus?: boolean;
  maxLength?: number;
  allowedCharacters?: RegExp;
  successMessage?: string;
  errorMessage?: string;
  showTargetText?: boolean;
  targetLabel?: string;
}

export default function WritingPractice({
  targetText,
  onSuccess,
  onFailure,
  onTextChange,
  placeholder = 'Start typing...',
  caseSensitive = false,
  allowPartialMatch = false,
  showHint = false,
  hintDelay = 3000,
  cooldownMs = 300,
  playLetterSounds = true,
  soundsPath = '/sounds/alphabet/english',
  showVisualFeedback = true,
  autoFocus = true,
  maxLength,
  allowedCharacters = /^[a-zA-Z\s]$/,
  successMessage = 'Great job!',
  errorMessage = 'Try again!',
  showTargetText = true,
  targetLabel = 'Write this:'
}: WritingPracticeProps) {
  const [text, setText] = useState('');
  const [canType, setCanType] = useState(true);
  const [showHintText, setShowHintText] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);

  const normalizedTarget = caseSensitive ? targetText : targetText.toUpperCase();
  const normalizedText = caseSensitive ? text : text.toUpperCase();

  // Play letter sound
  const playSound = useCallback((letter: string) => {
    if (!playLetterSounds) return;
    
    const audio = new Audio(`${soundsPath}/${letter.toUpperCase()}.mp3`);
    audio.volume = 0.7;
    audio.play().catch(() => {
      // Fallback if specific letter sound not available
      audioService.playClick();
    });
  }, [playLetterSounds, soundsPath]);

  // Check if text matches target
  const checkMatch = useCallback(() => {
    const isMatch = allowPartialMatch 
      ? normalizedTarget.startsWith(normalizedText)
      : normalizedText === normalizedTarget;

    if (isMatch && normalizedText.length === normalizedTarget.length) {
      setIsSuccess(true);
      audioService.playSuccess();
      celebrationService.celebrate();
      setTimeout(() => {
        onSuccess?.();
        setText('');
        setIsSuccess(false);
        setAttemptCount(0);
      }, 1500);
    } else if (!allowPartialMatch && normalizedText.length >= normalizedTarget.length) {
      setIsError(true);
      audioService.playFailure();
      setTimeout(() => {
        onFailure?.();
        setText('');
        setIsError(false);
        setAttemptCount(prev => prev + 1);
      }, 1000);
    }
  }, [normalizedText, normalizedTarget, allowPartialMatch, onSuccess, onFailure]);

  // Handle keyboard input
  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (!canType || isSuccess || isError) return;

    // Handle Enter key for submission
    if (e.key === 'Enter') {
      checkMatch();
      return;
    }

    // Handle Backspace
    if (e.key === 'Backspace') {
      setText(prev => prev.slice(0, -1));
      return;
    }

    // Check if character is allowed
    if (!allowedCharacters.test(e.key)) return;

    // Check max length
    if (maxLength && text.length >= maxLength) return;

    const newChar = caseSensitive ? e.key : e.key.toUpperCase();
    const newText = text + newChar;
    
    setText(newText);
    onTextChange?.(newText);
    
    if (e.key !== ' ') {
      playSound(e.key);
    }

    // Implement typing cooldown
    setCanType(false);
    setTimeout(() => setCanType(true), cooldownMs);

    // Check for match on each keystroke if partial match is allowed
    if (allowPartialMatch) {
      const tempNormalized = caseSensitive ? newText : newText.toUpperCase();
      if (tempNormalized === normalizedTarget) {
        setTimeout(() => checkMatch(), 100);
      }
    }
  }, [canType, isSuccess, isError, text, caseSensitive, allowedCharacters, 
      maxLength, onTextChange, playSound, cooldownMs, checkMatch, 
      allowPartialMatch, normalizedTarget]);

  // Handle clear button
  const handleClear = useCallback(() => {
    setText('');
    onTextChange?.('');
    setShowHintText(false);
  }, [onTextChange]);

  // Set up keyboard listener
  useEffect(() => {
    if (!autoFocus) return;
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress, autoFocus]);

  // Show hint after delay
  useEffect(() => {
    if (!showHint || text.length > 0 || attemptCount < 2) return;

    const timer = setTimeout(() => {
      setShowHintText(true);
    }, hintDelay);

    return () => clearTimeout(timer);
  }, [showHint, hintDelay, text, attemptCount]);

  // Visual feedback for correct/incorrect characters
  const renderText = () => {
    if (!showVisualFeedback) {
      return text;
    }

    return text.split('').map((char, index) => {
      const targetChar = caseSensitive ? targetText[index] : targetText[index]?.toUpperCase();
      const isCorrect = (caseSensitive ? char : char.toUpperCase()) === targetChar;
      
      return (
        <span
          key={index}
          className={`${styles.letter} ${
            isCorrect ? styles.correct : styles.incorrect
          } ${char === ' ' ? styles.space : ''}`}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      );
    });
  };

  return (
    <div className={`${styles.container} ${isError ? styles.error : ''} ${isSuccess ? styles.success : ''}`}>
      {showTargetText && (
        <div className={styles.targetSection}>
          <label className={styles.targetLabel}>{targetLabel}</label>
          <div className={styles.targetText}>
            {targetText}
            {showHintText && (
              <div className={styles.hint}>
                Hint: Type "{targetText}"
              </div>
            )}
          </div>
        </div>
      )}

      <div className={styles.writingArea}>
        <div className={styles.textDisplay}>
          {text.length > 0 ? (
            renderText()
          ) : (
            <span className={styles.placeholder}>{placeholder}</span>
          )}
          <span className={`${styles.cursor} ${!canType ? styles.waiting : ''}`} />
        </div>

        {text.length > 0 && (
          <button
            onClick={handleClear}
            className={styles.clearButton}
            aria-label="Clear text"
          >
            <Trash2 size={20} />
          </button>
        )}
      </div>

      {(isSuccess || isError) && (
        <div className={styles.feedback}>
          {isSuccess ? (
            <>
              <Check className={styles.successIcon} size={32} />
              <span>{successMessage}</span>
            </>
          ) : (
            <>
              <X className={styles.errorIcon} size={32} />
              <span>{errorMessage}</span>
            </>
          )}
        </div>
      )}

      {!autoFocus && (
        <div className={styles.keyboard}>
          <div className={styles.keyboardRow}>
            {'QWERTYUIOP'.split('').map(letter => (
              <button
                key={letter}
                onClick={() => {
                  const e = new KeyboardEvent('keydown', { key: letter.toLowerCase() });
                  handleKeyPress(e);
                }}
                className={styles.key}
              >
                {letter}
              </button>
            ))}
          </div>
          <div className={styles.keyboardRow}>
            {'ASDFGHJKL'.split('').map(letter => (
              <button
                key={letter}
                onClick={() => {
                  const e = new KeyboardEvent('keydown', { key: letter.toLowerCase() });
                  handleKeyPress(e);
                }}
                className={styles.key}
              >
                {letter}
              </button>
            ))}
          </div>
          <div className={styles.keyboardRow}>
            {'ZXCVBNM'.split('').map(letter => (
              <button
                key={letter}
                onClick={() => {
                  const e = new KeyboardEvent('keydown', { key: letter.toLowerCase() });
                  handleKeyPress(e);
                }}
                className={styles.key}
              >
                {letter}
              </button>
            ))}
            <button
              onClick={() => {
                const e = new KeyboardEvent('keydown', { key: ' ' });
                handleKeyPress(e);
              }}
              className={`${styles.key} ${styles.spaceKey}`}
            >
              SPACE
            </button>
          </div>
        </div>
      )}
    </div>
  );
}