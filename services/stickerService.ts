import { stickers, Sticker } from "@/types/stickers";

class StickerService {
  private readonly STORAGE_KEY = "madeleine_stickers";
  private ownedIds: string[] = [];
  private listeners: Set<(ownedIds: string[]) => void> = new Set();

  constructor() {
    if (typeof window !== "undefined") {
      this.load();
    }
  }

  private load(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      const parsed = stored ? JSON.parse(stored) : [];
      this.ownedIds = Array.isArray(parsed)
        ? parsed.filter((id) => stickers.some((s) => s.id === id))
        : [];
    } catch {
      this.ownedIds = [];
    }
  }

  private save(): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.ownedIds));
    }
    this.listeners.forEach((listener) => listener([...this.ownedIds]));
  }

  getOwnedIds(): string[] {
    return [...this.ownedIds];
  }

  isOwned(id: string): boolean {
    return this.ownedIds.includes(id);
  }

  getOwnedCount(): number {
    return this.ownedIds.length;
  }

  getTotalCount(): number {
    return stickers.length;
  }

  /** Awards a random sticker not yet owned; returns null if the album is full */
  unlockRandom(): Sticker | null {
    const missing = stickers.filter((s) => !this.ownedIds.includes(s.id));
    if (missing.length === 0) return null;
    const sticker = missing[Math.floor(Math.random() * missing.length)];
    this.ownedIds.push(sticker.id);
    this.save();
    return sticker;
  }

  unlockAll(): void {
    this.ownedIds = stickers.map((s) => s.id);
    this.save();
  }

  reset(): void {
    this.ownedIds = [];
    this.save();
  }

  subscribe(listener: (ownedIds: string[]) => void): () => void {
    this.listeners.add(listener);
    listener([...this.ownedIds]);
    return () => {
      this.listeners.delete(listener);
    };
  }
}

export const stickerService = new StickerService();
