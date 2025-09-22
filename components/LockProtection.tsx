'use client';
import { useEffect, useState } from 'react';
import { isLocked, resetLock, getLockEndTime } from '@/types/lock';
import MathProblem from './MathProblem';
import Countdown from './Countdown';
import { mathService } from '@/services/mathService';

interface LockProtectionProps {
  children: React.ReactNode;
}

export default function LockProtection({ children }: LockProtectionProps) {
  const [showMathGame, setShowMathGame] = useState(false);
  const [failedAttempt, setFailedAttempt] = useState(false);
  const [endTime, setEndTime] = useState<number>(0);
  const [currentProblem, setCurrentProblem] = useState(() => mathService.generateProblem('easy'));
  const [attemptCount, setAttemptCount] = useState(1);

  useEffect(() => {
    const checkLock = () => {
      if (isLocked()) {
        const lockEndTime = getLockEndTime();
        setEndTime(lockEndTime);
        setShowMathGame(true);
      } else {
        setShowMathGame(false);
        setFailedAttempt(false);
      }
    };

    checkLock();
    // Check periodically in case the lock expires
    const interval = setInterval(checkLock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Add cheat code handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showMathGame && e.key === 'p' && e.metaKey && e.shiftKey) {
        e.preventDefault();
        handleMathComplete();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showMathGame]);

  const handleMathComplete = () => {
    resetLock();
    setShowMathGame(false);
    setFailedAttempt(false);
    setEndTime(0);
    setAttemptCount(1);
    // Generate new problem for next time
    setCurrentProblem(mathService.generateProblem());
  };

  const handleMathFail = () => {
    // Generate a new problem with progressive difficulty
    setAttemptCount(prev => prev + 1);
    setCurrentProblem(mathService.generateProgressiveProblem(attemptCount + 1));
    // Don't set failedAttempt to true, let them keep trying
  };

  const handleCountdownComplete = () => {
    resetLock();
    setShowMathGame(false);
    setFailedAttempt(false);
    setEndTime(0);
    setAttemptCount(1);
    setCurrentProblem(mathService.generateProblem());
  };

  if (showMathGame) {
    return (
      <div className="lockOverlay">
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          backgroundColor: 'rgba(0, 0, 0, 0.95)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <h2 style={{ 
            color: 'white', 
            fontSize: '2rem', 
            marginBottom: '2rem',
            textAlign: 'center' 
          }}>
            Solve this problem to continue
            {attemptCount > 1 && ` (Attempt ${attemptCount})`}
          </h2>
          <MathProblem
            problem={currentProblem}
            onSuccess={handleMathComplete}
            onFail={handleMathFail}
            darkMode={true}
            showVisuals={currentProblem.num1 <= 5 && currentProblem.num2 <= 5}
          />
          <Countdown 
            endTime={endTime}
            onComplete={handleCountdownComplete}
          />
        </div>
      </div>
    );
  }

  return <>{children}</>;
} 