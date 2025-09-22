interface GameProgress {
  unlockedCharacters: string[];
  completedLevels: Record<string, number>;
  totalScore: number;
  achievements: string[];
  lastPlayed: string;
}

interface MathProgress {
  correctAnswers: number;
  totalAttempts: number;
  currentStreak: number;
  bestStreak: number;
  difficulty: 'easy' | 'medium' | 'hard';
  lastProblems: Array<{ problem: string; correct: boolean }>;
}

class ProgressService {
  private static instance: ProgressService;
  private readonly STORAGE_KEY = 'madeleine_progress';
  private readonly MATH_KEY = 'madeleine_math_progress';

  private constructor() {
    // Only initialize on client side
    if (typeof window !== 'undefined') {
      this.initializeProgress();
    }
  }

  public static getInstance(): ProgressService {
    if (!ProgressService.instance) {
      ProgressService.instance = new ProgressService();
    }
    return ProgressService.instance;
  }

  private initializeProgress(): void {
    if (!this.getProgress()) {
      const initialProgress: GameProgress = {
        unlockedCharacters: ['aang'], // Default unlocked character
        completedLevels: {},
        totalScore: 0,
        achievements: [],
        lastPlayed: new Date().toISOString(),
      };
      this.saveProgress(initialProgress);
    }

    if (!this.getMathProgress()) {
      const initialMathProgress: MathProgress = {
        correctAnswers: 0,
        totalAttempts: 0,
        currentStreak: 0,
        bestStreak: 0,
        difficulty: 'easy',
        lastProblems: [],
      };
      this.saveMathProgress(initialMathProgress);
    }
  }

  private getProgress(): GameProgress | null {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Failed to load progress:', error);
      return null;
    }
  }

  private saveProgress(progress: GameProgress): void {
    if (typeof window === 'undefined') return;
    try {
      progress.lastPlayed = new Date().toISOString();
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(progress));
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  }

  public getMathProgress(): MathProgress | null {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem(this.MATH_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Failed to load math progress:', error);
      return null;
    }
  }

  private saveMathProgress(progress: MathProgress): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(this.MATH_KEY, JSON.stringify(progress));
    } catch (error) {
      console.error('Failed to save math progress:', error);
    }
  }

  public unlockCharacter(characterId: string): void {
    const progress = this.getProgress();
    if (progress && !progress.unlockedCharacters.includes(characterId)) {
      progress.unlockedCharacters.push(characterId);
      this.saveProgress(progress);
    }
  }

  public isCharacterUnlocked(characterId: string): boolean {
    const progress = this.getProgress();
    return progress ? progress.unlockedCharacters.includes(characterId) : false;
  }

  public getUnlockedCharacters(): string[] {
    const progress = this.getProgress();
    return progress ? progress.unlockedCharacters : ['aang'];
  }

  public completeLevel(game: string, level: number): void {
    const progress = this.getProgress();
    if (progress) {
      if (!progress.completedLevels[game] || progress.completedLevels[game] < level) {
        progress.completedLevels[game] = level;
        this.saveProgress(progress);
      }
    }
  }

  public getCompletedLevel(game: string): number {
    const progress = this.getProgress();
    return progress?.completedLevels[game] || 0;
  }

  public addScore(points: number): void {
    const progress = this.getProgress();
    if (progress) {
      progress.totalScore += points;
      this.saveProgress(progress);
    }
  }

  public getTotalScore(): number {
    const progress = this.getProgress();
    return progress?.totalScore || 0;
  }

  public unlockAchievement(achievement: string): void {
    const progress = this.getProgress();
    if (progress && !progress.achievements.includes(achievement)) {
      progress.achievements.push(achievement);
      this.saveProgress(progress);
    }
  }

  public getAchievements(): string[] {
    const progress = this.getProgress();
    return progress?.achievements || [];
  }

  public recordMathAnswer(problem: string, correct: boolean): void {
    const progress = this.getMathProgress();
    if (progress) {
      progress.totalAttempts++;
      if (correct) {
        progress.correctAnswers++;
        progress.currentStreak++;
        if (progress.currentStreak > progress.bestStreak) {
          progress.bestStreak = progress.currentStreak;
        }
      } else {
        progress.currentStreak = 0;
      }

      progress.lastProblems.push({ problem, correct });
      if (progress.lastProblems.length > 10) {
        progress.lastProblems.shift();
      }

      // Auto-adjust difficulty based on performance
      const recentAccuracy = progress.lastProblems.filter(p => p.correct).length / progress.lastProblems.length;
      if (recentAccuracy > 0.8 && progress.lastProblems.length >= 5) {
        if (progress.difficulty === 'easy') progress.difficulty = 'medium';
        else if (progress.difficulty === 'medium') progress.difficulty = 'hard';
      } else if (recentAccuracy < 0.4 && progress.lastProblems.length >= 5) {
        if (progress.difficulty === 'hard') progress.difficulty = 'medium';
        else if (progress.difficulty === 'medium') progress.difficulty = 'easy';
      }

      this.saveMathProgress(progress);
    }
  }

  public getMathDifficulty(): 'easy' | 'medium' | 'hard' {
    const progress = this.getMathProgress();
    return progress?.difficulty || 'easy';
  }

  public getMathStats(): { accuracy: number; streak: number; bestStreak: number } {
    const progress = this.getMathProgress();
    if (!progress || progress.totalAttempts === 0) {
      return { accuracy: 0, streak: 0, bestStreak: 0 };
    }

    return {
      accuracy: (progress.correctAnswers / progress.totalAttempts) * 100,
      streak: progress.currentStreak,
      bestStreak: progress.bestStreak,
    };
  }

  public resetProgress(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.MATH_KEY);
    this.initializeProgress();
  }

  public exportProgress(): string {
    const gameProgress = this.getProgress();
    const mathProgress = this.getMathProgress();
    return JSON.stringify({ gameProgress, mathProgress }, null, 2);
  }

  public importProgress(data: string): boolean {
    try {
      const parsed = JSON.parse(data);
      if (parsed.gameProgress) {
        this.saveProgress(parsed.gameProgress);
      }
      if (parsed.mathProgress) {
        this.saveMathProgress(parsed.mathProgress);
      }
      return true;
    } catch (error) {
      console.error('Failed to import progress:', error);
      return false;
    }
  }
}

export const progressService = ProgressService.getInstance();