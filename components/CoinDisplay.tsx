"use client";
import { useState, useEffect } from 'react';
import { currencyService } from '@/services';
import styles from './CoinDisplay.module.css';

export default function CoinDisplay() {
  const [coins, setCoins] = useState(0);

  useEffect(() => {
    setCoins(currencyService.getCoins());
    
    const unsubscribe = currencyService.subscribe((newCoins) => {
      setCoins(newCoins);
    });

    return unsubscribe;
  }, []);

  return (
    <div className={styles.coinDisplay}>
      <span className={styles.coinIcon}>🪙</span>
      <span className={styles.coinAmount}>{coins}</span>
    </div>
  );
}