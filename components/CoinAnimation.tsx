"use client";
import { useEffect, useState } from 'react';
import styles from './CoinAnimation.module.css';
import type { CoinTransaction } from '@/services/currencyService';
import { audioService } from '@/services';

interface CoinAnimationProps {
  transaction: CoinTransaction | null;
  onComplete: () => void;
}

export default function CoinAnimation({ transaction, onComplete }: CoinAnimationProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  
  useEffect(() => {
    if (transaction) {
      setIsAnimating(true);
      
      // Play sound effect based on transaction type
      if (transaction.type === 'earn') {
        audioService.playSuccess();
      } else {
        // Play a spending sound (using success sound for now)
        audioService.playSuccess();
      }
      
      const timer = setTimeout(() => {
        setIsAnimating(false);
        onComplete();
      }, transaction.type === 'earn' ? 3000 : 2000);
      
      return () => clearTimeout(timer);
    }
  }, [transaction, onComplete]);
  
  if (!transaction || !isAnimating) return null;
  
  const isEarning = transaction.type === 'earn';
  const coins = Array.from({ length: Math.abs(transaction.amount) }, (_, i) => i);
  
  return (
    <div className={`${styles.overlay} ${isEarning ? styles.earn : styles.spend}`}>
      <div className={styles.animationContainer}>
        {/* The coin, the amount and the message travel together as one small
            card in the corner. Centred, they landed on top of whatever the game
            was showing — on the reading games, squarely across the picture she
            had just earned and the sentence she had just read. */}
        <div className={styles.toast}>
        {/* Main coin animation */}
        <div className={styles.mainCoinWrapper}>
          {coins.map((index) => (
            <div
              key={index}
              className={`${styles.coin} ${isEarning ? styles.coinEarn : styles.coinSpend}`}
              style={{
                animationDelay: `${index * 0.15}s`
              }}
            >
              <span className={styles.coinEmoji}>🪙</span>
            </div>
          ))}
        </div>
        
        {/* Amount display */}
        <div className={`${styles.amountDisplay} ${isEarning ? styles.amountEarn : styles.amountSpend}`}>
          <span className={styles.sign}>{isEarning ? '+' : '-'}</span>
          <span className={styles.number}>{Math.abs(transaction.amount)}</span>
        </div>
        
        {/* Message */}
        <div className={styles.message}>
          {isEarning ? (
            <>
              <h2 className={styles.earnTitle}>Great Job! 🎉</h2>
              <p className={styles.earnSubtitle}>You earned {transaction.amount} coin{transaction.amount > 1 ? 's' : ''}!</p>
            </>
          ) : (
            <>
              <h2 className={styles.spendTitle}>Coin Used! 💫</h2>
              <p className={styles.spendSubtitle}>You spent {Math.abs(transaction.amount)} coin{Math.abs(transaction.amount) > 1 ? 's' : ''}</p>
            </>
          )}
        </div>
        </div>

        {/* Decorative elements for earning */}
        {isEarning && (
          <>
            <div className={styles.sparkles}>
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className={styles.sparkle}
                  style={{
                    // Kept to the margins: the middle of the screen is where the
                    // game puts the thing she just earned, and a sparkle sitting
                    // on a word is the same problem in miniature.
                    left: `${i % 2 === 0 ? 2 + Math.random() * 16 : 82 + Math.random() * 16}%`,
                    top: `${10 + Math.random() * 80}%`,
                    animationDelay: `${Math.random() * 1}s`,
                    fontSize: `${20 + Math.random() * 30}px`
                  }}
                >
                  ✨
                </div>
              ))}
            </div>
            <div className={styles.stars}>
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className={styles.star}
                  style={{
                    left: `${i % 2 === 0 ? 1 + Math.random() * 18 : 81 + Math.random() * 18}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    fontSize: `${30 + Math.random() * 40}px`
                  }}
                >
                  ⭐
                </div>
              ))}
            </div>
          </>
        )}
        
        {/* Decorative elements for spending */}
        {!isEarning && (
          <div className={styles.bubbles}>
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className={styles.bubble}
                style={{
                  left: `${10 + Math.random() * 80}%`,
                  animationDelay: `${Math.random() * 1}s`,
                  width: `${40 + Math.random() * 60}px`,
                  height: `${40 + Math.random() * 60}px`
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}