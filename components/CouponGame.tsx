'use client';

import { useState, useEffect, useCallback } from 'react';
import { Howl } from 'howler';
import confetti from 'canvas-confetti';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { currencyService } from '@/services/currencyService';
import TypingInterface from '@/components/TypingInterface';
import styles from './CouponGame.module.css';

const CouponGame = () => {
  const [inputValue, setInputValue] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [usedCodes, setUsedCodes] = useState<string[]>([]);
  const [coins, setCoins] = useState(0);

  useEffect(() => {
    const storedCodes = localStorage.getItem('usedCouponCodes');
    if (storedCodes) {
      setUsedCodes(JSON.parse(storedCodes));
    }
    
    const unsubscribe = currencyService.subscribe((newCoins) => {
      setCoins(newCoins);
    });
    
    return unsubscribe;
  }, []);

  const validateCode = (code: string): boolean => {
    const normalizedCode = code.toUpperCase().trim();
    
    const match = normalizedCode.match(/^([A-Z]+)(\d+)$/);
    if (!match) return false;
    
    const [, letters, numbers] = match;
    const firstLetterAsNumber = letters.charCodeAt(0) - 64;
    const letterCount = letters.length;
    
    const expectedNumber = `${firstLetterAsNumber}${letterCount}`;
    
    return numbers === expectedNumber;
  };

  const handleSubmit = useCallback((text: string) => {
    const normalizedCode = text.toUpperCase().trim();
    
    if (!normalizedCode) {
      setMessage('Please enter a code');
      setIsError(true);
      return;
    }

    if (usedCodes.includes(normalizedCode)) {
      setMessage('This code has already been used!');
      setIsError(true);
      setInputValue('');
      new Howl({
        src: ['/sounds/failure.mp3'],
        volume: 0.5,
      }).play();
      return;
    }

    if (validateCode(normalizedCode)) {
      const newUsedCodes = [...usedCodes, normalizedCode];
      
      setUsedCodes(newUsedCodes);
      localStorage.setItem('usedCouponCodes', JSON.stringify(newUsedCodes));
      
      currencyService.addCoins(1);
      
      setMessage('Success! You earned 1 coin! 🪙');
      setIsError(false);
      setInputValue('');
      
      new Howl({
        src: ['/sounds/success.mp3'],
        volume: 0.5,
      }).play();
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } else {
      setMessage('Invalid code. Please check and try again.');
      setIsError(true);
      setInputValue('');
      new Howl({
        src: ['/sounds/failure.mp3'],
        volume: 0.5,
      }).play();
    }
  }, [usedCodes]);

  const handleTextChange = useCallback((text: string) => {
    setInputValue(text);
    const upperText = text.toUpperCase();
    
    if (/^\d+$/.test(upperText)) {
      setInputValue(text);
    } else if (/^[A-Z\s]+\d*$/.test(upperText)) {
      setInputValue(text);
    }
  }, []);

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (/^\d$/.test(e.key)) {
      const newText = inputValue + e.key;
      setInputValue(newText);
      e.preventDefault();
    }
  }, [inputValue]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  return (
    <div className={styles.container}>
      <nav className={styles.nav}>
        <Link href="/" className={styles.backButton}>
          <ArrowLeft size={32} />
        </Link>
      </nav>
      
      <div className={styles.coinDisplay}>
        <span className={styles.coinIcon}>🪙</span>
        <span className={styles.coinCount}>{coins}</span>
      </div>
      
      <h1 className={styles.title}>Enter Your Coupon Code</h1>
      
      <div className={styles.gameArea}>
        <TypingInterface
          onTextChange={handleTextChange}
          onEnter={handleSubmit}
          value={inputValue}
          cooldown={100}
          className={isError ? styles.errorShake : ''}
        />
      </div>
      
      {message && (
        <div className={`${styles.message} ${isError ? styles.error : styles.success}`}>
          {message}
        </div>
      )}
      
      <div className={styles.hint}>
        Enter your special reward code to earn coins!
      </div>
    </div>
  );
};

export default CouponGame;