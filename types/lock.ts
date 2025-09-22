export interface LockState {
  count: number;
  lastActionTime: number;
  lockedUntil: number;
}

const STORAGE_KEY = "app_lockState";
const ACTION_LIMIT = 3;
const COOLDOWN_MINUTES = 20;

export function isLocked(): boolean {
  if (typeof window === 'undefined') return false;
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return false;

  const state: LockState = JSON.parse(saved);
  // Only reset if we're past the lock time
  if (state.lockedUntil > 0 && state.lockedUntil <= Date.now()) {
    resetLock();
    return false;
  }
  return state.lockedUntil > Date.now();
}

export function incrementLockCounter(): boolean {
  if (typeof window === 'undefined') return false;
  const now = Date.now();
  const saved = localStorage.getItem(STORAGE_KEY);

  // Initialize state
  const currentState: LockState = saved
    ? JSON.parse(saved)
    : {
        count: 0,
        lastActionTime: now,
        lockedUntil: 0,
      };

  // If already locked, maintain the lock
  if (currentState.lockedUntil > now) {
    return true;
  }

  // Increment counter
  const newCount = currentState.count + 1;

  // Create new state
  const newState: LockState = {
    count: newCount,
    lastActionTime: now,
    lockedUntil:
      newCount >= ACTION_LIMIT ? now + COOLDOWN_MINUTES * 60 * 1000 : 0,
  };

  // Save new state
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
  } catch (e) {
    console.error("Failed to save lock state:", e);
  }

  return newCount >= ACTION_LIMIT;
}

export function resetLock(): void {
  if (typeof window === 'undefined') return;
  const newState: LockState = {
    count: 0,
    lastActionTime: Date.now(),
    lockedUntil: 0,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
}

export function getLockEndTime(): number {
  if (typeof window === 'undefined') return 0;
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return 0;

  const state: LockState = JSON.parse(saved);
  return state.lockedUntil;
}
