import { useState, useEffect, useCallback } from 'react';
import { progressService } from '@/services/progressService';
import { audioService } from '@/services/audioService';
import { celebrationService } from '@/services/celebrationService';

interface GameState {
  score: number;
  level: number;
  isPlaying: boolean;
  isPaused: boolean;
  isComplete: boolean;
  highScore: number;
  attempts: number;
}

interface UseGameStateOptions {
  gameName: string;
  maxLevel?: number;
  pointsPerLevel?: number;
  celebrateOnComplete?: boolean;
  saveProgress?: boolean;
}

export function useGameState(options: UseGameStateOptions) {
  const {
    gameName,
    maxLevel = 10,
    pointsPerLevel = 100,
    celebrateOnComplete = true,
    saveProgress = true,
  } = options;

  const [state, setState] = useState<GameState>({
    score: 0,
    level: 1,
    isPlaying: false,
    isPaused: false,
    isComplete: false,
    highScore: 0,
    attempts: 0,
  });

  // Load saved progress on mount
  useEffect(() => {
    if (!saveProgress) return;
    
    const savedLevel = progressService.getCompletedLevel(gameName);
    const totalScore = progressService.getTotalScore();
    
    setState(prev => ({
      ...prev,
      level: Math.min(savedLevel + 1, maxLevel),
      highScore: totalScore,
    }));
  }, [gameName, maxLevel, saveProgress]);

  // Start game
  const startGame = useCallback(() => {
    setState(prev => ({
      ...prev,
      isPlaying: true,
      isPaused: false,
      isComplete: false,
      attempts: 0,
    }));
  }, []);

  // Pause game
  const pauseGame = useCallback(() => {
    setState(prev => ({
      ...prev,
      isPaused: true,
    }));
  }, []);

  // Resume game
  const resumeGame = useCallback(() => {
    setState(prev => ({
      ...prev,
      isPaused: false,
    }));
  }, []);

  // Complete level
  const completeLevel = useCallback(() => {
    const newScore = state.score + pointsPerLevel;
    const newLevel = state.level + 1;
    const isGameComplete = newLevel > maxLevel;

    setState(prev => ({
      ...prev,
      score: newScore,
      level: isGameComplete ? prev.level : newLevel,
      isComplete: isGameComplete,
    }));

    if (saveProgress) {
      progressService.completeLevel(gameName, state.level);
      progressService.addScore(pointsPerLevel);
    }

    audioService.playSuccess();
    
    if (isGameComplete && celebrateOnComplete) {
      celebrationService.bigCelebration();
    } else {
      celebrationService.celebrate();
    }
  }, [state.score, state.level, pointsPerLevel, maxLevel, gameName, saveProgress, celebrateOnComplete]);

  // Fail attempt
  const failAttempt = useCallback(() => {
    setState(prev => ({
      ...prev,
      attempts: prev.attempts + 1,
    }));
    
    audioService.playFailure();
  }, []);

  // Reset game
  const resetGame = useCallback(() => {
    setState(prev => ({
      ...prev,
      score: 0,
      level: 1,
      isPlaying: false,
      isPaused: false,
      isComplete: false,
      attempts: 0,
    }));
  }, []);

  // Add custom score
  const addScore = useCallback((points: number) => {
    setState(prev => ({
      ...prev,
      score: prev.score + points,
      highScore: Math.max(prev.highScore, prev.score + points),
    }));

    if (saveProgress) {
      progressService.addScore(points);
    }
  }, [saveProgress]);

  // Set level
  const setLevel = useCallback((level: number) => {
    setState(prev => ({
      ...prev,
      level: Math.min(Math.max(1, level), maxLevel),
    }));
  }, [maxLevel]);

  return {
    ...state,
    startGame,
    pauseGame,
    resumeGame,
    completeLevel,
    failAttempt,
    resetGame,
    addScore,
    setLevel,
  };
}