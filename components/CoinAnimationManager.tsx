"use client";
import { useState, useEffect } from 'react';
import { currencyService } from '@/services';
import type { CoinTransaction } from '@/services/currencyService';
import CoinAnimation from './CoinAnimation';

export default function CoinAnimationManager() {
  const [transactions, setTransactions] = useState<CoinTransaction[]>([]);
  const [currentTransaction, setCurrentTransaction] = useState<CoinTransaction | null>(null);

  useEffect(() => {
    const unsubscribe = currencyService.subscribeToTransactions((transaction) => {
      setTransactions(prev => [...prev, transaction]);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (transactions.length > 0 && !currentTransaction) {
      setCurrentTransaction(transactions[0]);
    }
  }, [transactions, currentTransaction]);

  const handleAnimationComplete = () => {
    setTransactions(prev => prev.slice(1));
    setCurrentTransaction(null);
  };

  return (
    <CoinAnimation
      transaction={currentTransaction}
      onComplete={handleAnimationComplete}
    />
  );
}