import { useState, useEffect, useCallback } from 'react';
import { progressService } from '@/services/progressService';

export function useProgress() {
  const [unlockedCharacters, setUnlockedCharacters] = useState<string[]>([]);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [totalScore, setTotalScore] = useState(0);
  const [mathStats, setMathStats] = useState({
    accuracy: 0,
    streak: 0,
    bestStreak: 0,
  });

  // Load initial progress
  useEffect(() => {
    const loadProgress = () => {
      setUnlockedCharacters(progressService.getUnlockedCharacters());
      setAchievements(progressService.getAchievements());
      setTotalScore(progressService.getTotalScore());
      setMathStats(progressService.getMathStats());
    };

    loadProgress();

    // Reload progress when window gains focus (in case another tab updated it)
    const handleFocus = () => loadProgress();
    window.addEventListener('focus', handleFocus);
    
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // Unlock a character
  const unlockCharacter = useCallback((characterId: string) => {
    progressService.unlockCharacter(characterId);
    setUnlockedCharacters(progressService.getUnlockedCharacters());
  }, []);

  // Check if character is unlocked
  const isCharacterUnlocked = useCallback((characterId: string) => {
    return unlockedCharacters.includes(characterId);
  }, [unlockedCharacters]);

  // Unlock achievement
  const unlockAchievement = useCallback((achievement: string) => {
    progressService.unlockAchievement(achievement);
    setAchievements(progressService.getAchievements());
  }, []);

  // Add to score
  const addScore = useCallback((points: number) => {
    progressService.addScore(points);
    setTotalScore(progressService.getTotalScore());
  }, []);

  // Record math answer
  const recordMathAnswer = useCallback((problem: string, correct: boolean) => {
    progressService.recordMathAnswer(problem, correct);
    setMathStats(progressService.getMathStats());
  }, []);

  // Get level progress for a specific game
  const getGameLevel = useCallback((gameName: string) => {
    return progressService.getCompletedLevel(gameName);
  }, []);

  // Complete a level in a game
  const completeGameLevel = useCallback((gameName: string, level: number) => {
    progressService.completeLevel(gameName, level);
  }, []);

  // Reset all progress
  const resetProgress = useCallback(() => {
    progressService.resetProgress();
    setUnlockedCharacters(progressService.getUnlockedCharacters());
    setAchievements([]);
    setTotalScore(0);
    setMathStats({
      accuracy: 0,
      streak: 0,
      bestStreak: 0,
    });
  }, []);

  // Export progress as JSON
  const exportProgress = useCallback(() => {
    return progressService.exportProgress();
  }, []);

  // Import progress from JSON
  const importProgress = useCallback((data: string) => {
    const success = progressService.importProgress(data);
    if (success) {
      setUnlockedCharacters(progressService.getUnlockedCharacters());
      setAchievements(progressService.getAchievements());
      setTotalScore(progressService.getTotalScore());
      setMathStats(progressService.getMathStats());
    }
    return success;
  }, []);

  return {
    // State
    unlockedCharacters,
    achievements,
    totalScore,
    mathStats,

    // Character methods
    unlockCharacter,
    isCharacterUnlocked,

    // Achievement methods
    unlockAchievement,

    // Score methods
    addScore,

    // Math methods
    recordMathAnswer,

    // Game level methods
    getGameLevel,
    completeGameLevel,

    // Utility methods
    resetProgress,
    exportProgress,
    importProgress,
  };
}