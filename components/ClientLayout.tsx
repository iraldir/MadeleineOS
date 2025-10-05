"use client";
import { ReactNode, useState, useEffect } from 'react';
import CoinDisplay from './CoinDisplay';
import CoinAnimationManager from './CoinAnimationManager';
import AppPreloader from './AppPreloader';

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const [isPreloadingComplete, setIsPreloadingComplete] = useState(false);
  const [showPreloader, setShowPreloader] = useState(true);

  useEffect(() => {
    // Check if this is the first time loading the app
    const hasPreloaded = sessionStorage.getItem('madeleineOS_preloaded');
    
    if (hasPreloaded === 'true') {
      // Skip preloader if already preloaded in this session
      setIsPreloadingComplete(true);
      setShowPreloader(false);
    }
  }, []);

  const handlePreloadComplete = () => {
    setIsPreloadingComplete(true);
    sessionStorage.setItem('madeleineOS_preloaded', 'true');
  };

  return (
    <>
      {showPreloader && !isPreloadingComplete && (
        <AppPreloader onComplete={handlePreloadComplete} />
      )}
      {isPreloadingComplete && (
        <>
          <CoinDisplay />
          <CoinAnimationManager />
          {children}
        </>
      )}
    </>
  );
}
