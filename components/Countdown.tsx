'use client';
import { useState, useEffect } from 'react';
import styles from './Countdown.module.css';

interface CountdownProps {
  endTime: number;
  onComplete: () => void;
}

export default function Countdown({ endTime, onComplete }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const remaining = endTime - now;

      if (remaining <= 0) {
        clearInterval(timer);
        onComplete();
        return;
      }

      const minutes = Math.floor(remaining / 60000);
      const seconds = Math.floor((remaining % 60000) / 1000);
      setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime, onComplete]);

  return (
    <div className={styles.countdown}>
      <div className={styles.text}>Time remaining:</div>
      <div className={styles.time}>{timeLeft}</div>
    </div>
  );
} 