import { useCallback } from 'react';
import { celebrationService } from '@/services/celebrationService';

interface UseCelebrationOptions {
  enableCelebrations?: boolean;
}

export function useCelebration(options: UseCelebrationOptions = {}) {
  const { enableCelebrations = true } = options;

  // Basic celebration
  const celebrate = useCallback((customOptions?: any) => {
    if (!enableCelebrations) return;
    celebrationService.celebrate(customOptions);
  }, [enableCelebrations]);

  // Big celebration (for major achievements)
  const bigCelebration = useCallback(() => {
    if (!enableCelebrations) return;
    celebrationService.bigCelebration();
  }, [enableCelebrations]);

  // Level complete celebration
  const levelComplete = useCallback(() => {
    if (!enableCelebrations) return;
    celebrationService.levelComplete();
  }, [enableCelebrations]);

  // Quick burst (for minor achievements)
  const quickBurst = useCallback(() => {
    if (!enableCelebrations) return;
    celebrationService.quickBurst();
  }, [enableCelebrations]);

  // Custom celebration with streak
  const celebrateStreak = useCallback((streak: number) => {
    if (!enableCelebrations) return;
    
    if (streak >= 10) {
      celebrationService.bigCelebration();
    } else if (streak >= 5) {
      celebrationService.levelComplete();
    } else if (streak >= 3) {
      celebrationService.celebrate();
    } else {
      celebrationService.quickBurst();
    }
  }, [enableCelebrations]);

  // Celebration based on score
  const celebrateScore = useCallback((score: number) => {
    if (!enableCelebrations) return;
    
    const particleCount = Math.min(200, Math.floor(score / 10));
    const spread = Math.min(180, 70 + Math.floor(score / 20));
    
    celebrationService.celebrate({
      particleCount,
      spread,
      origin: { y: 0.6 },
    });
  }, [enableCelebrations]);

  return {
    celebrate,
    bigCelebration,
    levelComplete,
    quickBurst,
    celebrateStreak,
    celebrateScore,
  };
}