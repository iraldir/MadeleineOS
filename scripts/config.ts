import dotenv from "dotenv";
import * as path from "node:path";

// Load environment variables
dotenv.config();

export const CONFIG = {
  // API Keys
  api: {
    geminiKey: process.env.GEMINI_KEY || "",
    googleCloudProject: process.env.GCLOUD_PROJECT || "",
  },

  // Model Configuration
  models: {
    imageGeneration: "gemini-2.5-flash-image-preview",
    textGeneration: "gemini-2.5-flash",
  },

  // Voice Configurations
  voices: {
    en: {
      languageCode: "en-US",
      name: "en-US-Journey-F",
      ssmlGender: "FEMALE",
      alternates: [
        "en-US-Journey-D",
        "en-US-Wavenet-F",
        "en-US-Wavenet-D",
      ],
    },
    fr: {
      languageCode: "fr-FR",
      name: "fr-FR-Wavenet-C",
      ssmlGender: "FEMALE",
      alternates: [
        "fr-FR-Journey-F",
        "fr-FR-Wavenet-A",
        "fr-FR-Wavenet-E",
      ],
    },
    it: {
      languageCode: "it-IT",
      name: "it-IT-Journey-F",
      ssmlGender: "FEMALE",
      alternates: [
        "it-IT-Wavenet-A",
        "it-IT-Wavenet-B",
        "it-IT-Wavenet-C",
      ],
    },
  },

  // Rate Limiting
  rateLimit: {
    imageGeneration: {
      delayMs: 3000,
      batchSize: 10,
      batchDelayMs: 30000,
    },
    ttsGeneration: {
      delayMs: 2000,
      batchSize: 5,
      batchDelayMs: 10000,
    },
  },

  // File Paths
  paths: {
    vocabulary: path.join(__dirname, "../types/vocabulary.ts"),
    images: {
      vocabulary: path.join(__dirname, "../public/images/vocabulary"),
      characters: path.join(__dirname, "../public/images/characters"),
      coloring: path.join(__dirname, "../public/images/coloring"),
      icons: path.join(__dirname, "../public/images/icons"),
    },
    audio: {
      vocabularyEn: path.join(__dirname, "../public/sounds/vocabulary/en"),
      vocabularyFr: path.join(__dirname, "../public/sounds/vocabulary/fr"),
      vocabularyIt: path.join(__dirname, "../public/sounds/vocabulary/it"),
      alphabet: path.join(__dirname, "../public/sounds/alphabet"),
    },
    progress: path.join(__dirname, "../progress"),
  },

  // Image Generation Settings
  imageSettings: {
    vocabulary: {
      width: 512,
      height: 512,
      quality: 85,
      format: "webp",
      style: "Cute cartoon style for children ages 3-7, bright vibrant colors, simple rounded shapes, educational",
      background: "Clean white or soft pastel background",
    },
    appIcon: {
      sizes: [16, 32, 64, 128, 256, 512, 1024],
      quality: 95,
      format: "png",
      style: "Modern, clean, professional app icon with rounded corners",
    },
    character: {
      width: 512,
      height: 512,
      quality: 90,
      format: "webp",
      style: "Friendly character portrait, Disney/Pixar style",
    },
  },

  // TTS Settings
  ttsSettings: {
    audioEncoding: "MP3",
    speakingRate: 1.0,
    pitch: 0.0,
    volumeGainDb: 0.0,
  },

  // CLI Settings
  cli: {
    colors: {
      success: "\x1b[32m",
      error: "\x1b[31m",
      warning: "\x1b[33m",
      info: "\x1b[36m",
      reset: "\x1b[0m",
    },
    symbols: {
      success: "✅",
      error: "❌",
      warning: "⚠️",
      info: "ℹ️",
      progress: "⏳",
      done: "✨",
    },
  },

  // Validation Rules
  validation: {
    vocabulary: {
      maxTextLength: 100,
      maxPromptLength: 500,
      allowedCategories: [
        "numbers",
        "greetings",
        "family",
        "people",
        "animals",
        "food",
        "body",
        "colors",
        "clothing",
        "house",
        "furniture",
        "objects",
        "kitchen",
        "transport",
        "nature",
        "time",
        "actions",
        "emotions",
        "expressions",
        "school",
        "seasons",
        "descriptions",
      ],
    },
  },
};

// Helper functions
export function validateApiKeys(): boolean {
  const errors: string[] = [];

  if (!CONFIG.api.geminiKey) {
    errors.push("GEMINI_KEY not found in environment variables");
  }

  if (errors.length > 0) {
    console.error("Configuration errors:");
    errors.forEach((error) => console.error(`  - ${error}`));
    return false;
  }

  return true;
}

export function getVoiceForLanguage(language: "en" | "fr" | "it", variant = 0) {
  const voiceConfig = CONFIG.voices[language];
  if (!voiceConfig) {
    throw new Error(`Unsupported language: ${language}`);
  }

  if (variant === 0) {
    return voiceConfig.name;
  }

  const alternates = voiceConfig.alternates;
  if (variant > 0 && variant <= alternates.length) {
    return alternates[variant - 1];
  }

  return voiceConfig.name;
}

export function formatSuccess(message: string): string {
  return `${CONFIG.cli.colors.success}${CONFIG.cli.symbols.success} ${message}${CONFIG.cli.colors.reset}`;
}

export function formatError(message: string): string {
  return `${CONFIG.cli.colors.error}${CONFIG.cli.symbols.error} ${message}${CONFIG.cli.colors.reset}`;
}

export function formatWarning(message: string): string {
  return `${CONFIG.cli.colors.warning}${CONFIG.cli.symbols.warning} ${message}${CONFIG.cli.colors.reset}`;
}

export function formatInfo(message: string): string {
  return `${CONFIG.cli.colors.info}${CONFIG.cli.symbols.info} ${message}${CONFIG.cli.colors.reset}`;
}