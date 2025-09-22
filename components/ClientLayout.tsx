"use client";
import { ReactNode } from 'react';
import CoinDisplay from './CoinDisplay';
import CoinAnimationManager from './CoinAnimationManager';

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <>
      <CoinDisplay />
      <CoinAnimationManager />
      {children}
    </>
  );
}