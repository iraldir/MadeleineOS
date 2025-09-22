import { useState, useEffect, useMemo } from 'react';
import { Character } from '@/types/characters';
import { characterService } from '@/services/characterService';
import { progressService } from '@/services/progressService';

interface UseCharacterOrderOptions {
  includeSecret?: boolean;
  onlyUnlocked?: boolean;
  franchise?: string;
  randomize?: boolean;
  limit?: number;
}

export function useCharacterOrder(options: UseCharacterOrderOptions = {}) {
  const {
    includeSecret = false,
    onlyUnlocked = false,
    franchise,
    randomize = false,
    limit,
  } = options;

  const [characters, setCharacters] = useState<Character[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [unlockedIds, setUnlockedIds] = useState<string[]>([]);

  // Load characters and unlock status
  useEffect(() => {
    // Get characters based on options
    let chars: Character[];
    
    if (franchise) {
      chars = characterService.getCharactersByFranchise(franchise);
    } else {
      chars = characterService.getOrderedCharacters(includeSecret);
    }

    // Filter by unlock status if needed
    if (onlyUnlocked) {
      const unlocked = progressService.getUnlockedCharacters();
      setUnlockedIds(unlocked);
      chars = chars.filter(c => unlocked.includes(c.id));
    }

    // Randomize if requested
    if (randomize) {
      chars = [...chars].sort(() => Math.random() - 0.5);
    }

    // Apply limit if specified
    if (limit && limit > 0) {
      chars = chars.slice(0, limit);
    }

    setCharacters(chars);
  }, [includeSecret, onlyUnlocked, franchise, randomize, limit]);

  // Current character
  const currentCharacter = useMemo(() => {
    return characters[currentIndex] || null;
  }, [characters, currentIndex]);

  // Navigation functions
  const nextCharacter = () => {
    setCurrentIndex(prev => 
      prev < characters.length - 1 ? prev + 1 : prev
    );
  };

  const previousCharacter = () => {
    setCurrentIndex(prev => prev > 0 ? prev - 1 : prev);
  };

  const goToCharacter = (index: number) => {
    if (index >= 0 && index < characters.length) {
      setCurrentIndex(index);
    }
  };

  const goToCharacterById = (id: string) => {
    const index = characters.findIndex(c => c.id === id);
    if (index !== -1) {
      setCurrentIndex(index);
    }
  };

  const resetOrder = () => {
    setCurrentIndex(0);
  };

  // Check if character is unlocked (when not filtering by unlocked)
  const isUnlocked = (characterId: string) => {
    if (onlyUnlocked) return true; // All shown characters are unlocked
    return unlockedIds.includes(characterId) || 
           progressService.isCharacterUnlocked(characterId);
  };

  // Get random character excluding current
  const getRandomCharacter = () => {
    if (characters.length <= 1) return currentCharacter;
    
    const otherChars = characters.filter((_, index) => index !== currentIndex);
    const randomIndex = Math.floor(Math.random() * otherChars.length);
    return otherChars[randomIndex];
  };

  // Get multiple random characters (for options in games)
  const getRandomCharacters = (count: number, excludeCurrent: boolean = true) => {
    let pool = excludeCurrent 
      ? characters.filter((_, index) => index !== currentIndex)
      : [...characters];
    
    // Shuffle and take the requested count
    pool = pool.sort(() => Math.random() - 0.5);
    return pool.slice(0, Math.min(count, pool.length));
  };

  // Progress tracking
  const progress = useMemo(() => ({
    current: currentIndex + 1,
    total: characters.length,
    percentage: characters.length > 0 
      ? Math.round((currentIndex + 1) / characters.length * 100)
      : 0,
    isComplete: currentIndex >= characters.length - 1,
    isFirst: currentIndex === 0,
    isLast: currentIndex === characters.length - 1,
  }), [currentIndex, characters.length]);

  return {
    // Character data
    characters,
    currentCharacter,
    currentIndex,
    
    // Navigation
    nextCharacter,
    previousCharacter,
    goToCharacter,
    goToCharacterById,
    resetOrder,
    
    // Utilities
    isUnlocked,
    getRandomCharacter,
    getRandomCharacters,
    
    // Progress info
    progress,
  };
}