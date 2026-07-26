import { games, Game } from "@/types/games";
import { Sticker } from "@/types/stickers";
import { stickerService } from "./stickerService";

export interface DailyChallenge {
  date: string;
  gameId: string;
  goal: number;
  label: string;
  path: string;
  progress: number;
  completed: boolean;
  /** Sticker earned when the challenge was completed */
  stickerId?: string;
}

/**
 * Picks and tracks the "Challenge of the day": one challenge-enabled game and
 * a goal, both derived deterministically from the date. Progress persists in
 * localStorage; opted-in games report each completed exercise via
 * recordProgress(gameId).
 */
class ChallengeService {
  private readonly STORAGE_KEY = "madeleine_daily_challenge";
  private challenge: DailyChallenge | null = null;
  private listeners: Set<(challenge: DailyChallenge) => void> = new Set();
  private completionListeners: Set<(sticker: Sticker | null) => void> = new Set();

  private todayKey(): string {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${now.getFullYear()}-${month}-${day}`;
  }

  private hash(input: string): number {
    let h = 0;
    for (let i = 0; i < input.length; i++) {
      h = (h * 31 + input.charCodeAt(i)) | 0;
    }
    return Math.abs(h);
  }

  private buildForToday(): DailyChallenge {
    const date = this.todayKey();
    const eligible = games.filter(
      (game): game is Game & Required<Pick<Game, "challenge">> =>
        Boolean(game.challenge)
    );
    const game = eligible[this.hash(date) % eligible.length];
    const { label, minGoal, maxGoal } = game.challenge;
    const goal = minGoal + (this.hash(`${date}-goal`) % (maxGoal - minGoal + 1));

    return {
      date,
      gameId: game.id,
      goal,
      label: label.replace("{n}", goal.toString()),
      path: game.path,
      progress: 0,
      completed: false,
    };
  }

  getChallenge(): DailyChallenge {
    if (typeof window === "undefined") {
      return this.buildForToday();
    }
    if (!this.challenge || this.challenge.date !== this.todayKey()) {
      let stored: DailyChallenge | null = null;
      try {
        const raw = localStorage.getItem(this.STORAGE_KEY);
        stored = raw ? JSON.parse(raw) : null;
      } catch {
        stored = null;
      }
      if (stored && stored.date === this.todayKey()) {
        this.challenge = stored;
      } else {
        this.challenge = this.buildForToday();
        this.save();
      }
    }
    return { ...this.challenge };
  }

  private save(): void {
    if (typeof window !== "undefined" && this.challenge) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.challenge));
    }
  }

  private notify(): void {
    if (!this.challenge) return;
    const snapshot = { ...this.challenge };
    this.listeners.forEach((listener) => listener(snapshot));
  }

  /** Called by challenge-enabled games each time one exercise is completed */
  recordProgress(gameId: string): void {
    if (typeof window === "undefined") return;
    const challenge = this.getChallenge();
    if (challenge.gameId !== gameId || challenge.completed) return;

    this.challenge = { ...challenge, progress: challenge.progress + 1 };

    if (this.challenge.progress >= this.challenge.goal) {
      const sticker = stickerService.unlockRandom();
      this.challenge.completed = true;
      this.challenge.stickerId = sticker?.id;
      this.save();
      this.notify();
      this.completionListeners.forEach((listener) => listener(sticker));
    } else {
      this.save();
      this.notify();
    }
  }

  subscribe(listener: (challenge: DailyChallenge) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /** Fires once when today's challenge is completed, with the earned sticker */
  subscribeToCompletion(listener: (sticker: Sticker | null) => void): () => void {
    this.completionListeners.add(listener);
    return () => {
      this.completionListeners.delete(listener);
    };
  }
}

export const challengeService = new ChallengeService();
