const STORAGE_KEY = 'characterList_unlockedCharacters';

export function getUnlockedCharacters(): string[] {
  if (typeof window === 'undefined') return [];
  
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    return JSON.parse(saved);
  }
  
  // By default, first character is unlocked
  return ['aang'];
}

export function unlockCharacter(characterId: string): void {
  const current = getUnlockedCharacters();
  if (!current.includes(characterId)) {
    const updated = [...current, characterId];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }
}

export function isCharacterUnlocked(characterId: string): boolean {
  const unlocked = getUnlockedCharacters();
  return unlocked.includes(characterId);
}