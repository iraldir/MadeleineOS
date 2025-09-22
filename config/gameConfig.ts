export interface GameConfig {
  // Lock system configuration
  lock: {
    actionLimit: number;
    cooldownMinutes: number;
    storageKey: string;
  };

  // Math game configuration
  math: {
    difficulties: {
      easy: {
        minNum: number;
        maxNum: number;
        operations: ('+' | '-')[];
        maxSum: number;
      };
      medium: {
        minNum: number;
        maxNum: number;
        operations: ('+' | '-')[];
        maxSum: number;
      };
      hard: {
        minNum: number;
        maxNum: number;
        operations: ('+' | '-')[];
        maxSum: number;
      };
    };
    progressionThresholds: {
      toMedium: number;
      toHard: number;
    };
    celebrationThreshold: number;
  };

  // Character games configuration
  character: {
    defaultUnlockedCharacter: string;
    charactersPerUnlock: number;
    showLockedOffset: number;
    recognitionTimeout: number;
    writingCooldown: number;
  };

  // Audio configuration
  audio: {
    defaultVolume: number;
    soundsPath: string;
    alphabetPath: string;
    enableSounds: boolean;
  };

  // Visual effects configuration
  effects: {
    celebrationDuration: number;
    particleCount: number;
    transitionDelay: number;
    animationDuration: number;
  };

  // Storage keys
  storage: {
    progressKey: string;
    mathProgressKey: string;
    lockStateKey: string;
    characterListKey: string;
    recognitionHighScoreKey: string;
    writingHighScoreKey: string;
  };
}

const gameConfig: GameConfig = {
  lock: {
    actionLimit: 3,
    cooldownMinutes: 20,
    storageKey: 'app_lockState',
  },

  math: {
    difficulties: {
      easy: {
        minNum: 1,
        maxNum: 5,
        operations: ['+'],
        maxSum: 10,
      },
      medium: {
        minNum: 1,
        maxNum: 10,
        operations: ['+', '-'],
        maxSum: 15,
      },
      hard: {
        minNum: 5,
        maxNum: 15,
        operations: ['+', '-'],
        maxSum: 20,
      },
    },
    progressionThresholds: {
      toMedium: 3,
      toHard: 7,
    },
    celebrationThreshold: 5,
  },

  character: {
    defaultUnlockedCharacter: 'aang',
    charactersPerUnlock: 1,
    showLockedOffset: 3,
    recognitionTimeout: 1500,
    writingCooldown: 500,
  },

  audio: {
    defaultVolume: 1.0,
    soundsPath: '/sounds',
    alphabetPath: '/sounds/alphabet/english',
    enableSounds: true,
  },

  effects: {
    celebrationDuration: 2000,
    particleCount: 100,
    transitionDelay: 1500,
    animationDuration: 300,
  },

  storage: {
    progressKey: 'madeleine_progress',
    mathProgressKey: 'madeleine_math_progress',
    lockStateKey: 'app_lockState',
    characterListKey: 'characterList_unlockedCharacters',
    recognitionHighScoreKey: 'characterRecognitionHighScore',
    writingHighScoreKey: 'characterWritingHighScore',
  },
};

export default gameConfig;

// Environment-based configuration overrides
if (process.env.NODE_ENV === 'development') {
  // Shorter cooldowns for testing
  gameConfig.lock.cooldownMinutes = 1;
  gameConfig.character.writingCooldown = 100;
}

// Feature flags
export const featureFlags = {
  enableSecretCharacters: true,
  enableProgressTracking: true,
  enableAchievements: true,
  enableMultiplayer: false,
  enableParentalControls: true,
  enableCustomCharacters: false,
};

// Difficulty presets
export const difficultyPresets = {
  toddler: {
    mathMax: 5,
    characterSpeed: 'slow',
    hintsEnabled: true,
  },
  preschool: {
    mathMax: 10,
    characterSpeed: 'normal',
    hintsEnabled: true,
  },
  kindergarten: {
    mathMax: 20,
    characterSpeed: 'fast',
    hintsEnabled: false,
  },
};

// Export convenience functions
export function getStorageKey(key: keyof typeof gameConfig.storage): string {
  return gameConfig.storage[key];
}

export function getMathDifficulty(level: 'easy' | 'medium' | 'hard') {
  return gameConfig.math.difficulties[level];
}

export function shouldCelebrate(streak: number): boolean {
  return streak >= gameConfig.math.celebrationThreshold;
}