import * as fs from "node:fs/promises";
import * as path from "node:path";
import { VocabularyWord } from "../../types/vocabulary";
import { mediaGenerator } from "./media-generator";

const VOCABULARY_FILE = path.join(__dirname, "../../types/vocabulary.ts");
const IMAGE_DIR = path.join(__dirname, "../../public/images/vocabulary");
const AUDIO_DIR_EN = path.join(__dirname, "../../public/sounds/vocabulary/en");
const AUDIO_DIR_FR = path.join(__dirname, "../../public/sounds/vocabulary/fr");
const AUDIO_DIR_IT = path.join(__dirname, "../../public/sounds/vocabulary/it");

export interface VocabularyUpdateOptions {
  id?: string;
  english?: string;
  french?: string;
  italian?: string;
  category?: string;
  imagePrompt?: string;
  regenerateImage?: boolean;
  regenerateAudio?: boolean;
}

export class VocabularyManager {
  private vocabularyWords: VocabularyWord[] = [];

  async loadVocabulary(): Promise<void> {
    const content = await fs.readFile(VOCABULARY_FILE, "utf-8");
    const match = content.match(
      /export const vocabularyWords[^=]*=\s*(\[[\s\S]*?\n\];)/
    );

    if (!match) {
      throw new Error("Could not parse vocabulary file");
    }

    // Parse the vocabulary array
    const jsCode = match[1]
      .replace(/: VocabularyWord\[\]/g, "")
      .replace(/id:\s*'/g, "id: '")
      .replace(/english:\s*'/g, "english: '")
      .replace(/french:\s*'/g, "french: '")
      .replace(/italian:\s*'/g, "italian: '")
      .replace(/category:\s*'/g, "category: '")
      .replace(/imagePrompt:\s*'/g, "imagePrompt: '");

    this.vocabularyWords = eval(jsCode);
  }

  async saveVocabulary(): Promise<void> {
    const content = await fs.readFile(VOCABULARY_FILE, "utf-8");
    
    // Format the vocabulary array
    const formattedWords = this.vocabularyWords
      .map((word) => {
        return `  { id: '${word.id}', english: '${word.english}', french: '${word.french}', italian: '${word.italian}', category: '${word.category}', imagePrompt: '${word.imagePrompt}' }`;
      })
      .join(",\n");

    const newVocabularyArray = `export const vocabularyWords: VocabularyWord[] = [\n${formattedWords}\n];`;

    // Replace the vocabulary array in the file
    const newContent = content.replace(
      /export const vocabularyWords[^=]*=\s*\[[\s\S]*?\n\];/,
      newVocabularyArray
    );

    await fs.writeFile(VOCABULARY_FILE, newContent);
  }

  async addWord(word: VocabularyWord): Promise<void> {
    await this.loadVocabulary();

    // Check for duplicate ID
    if (this.vocabularyWords.find((w) => w.id === word.id)) {
      throw new Error(`Word with ID '${word.id}' already exists`);
    }

    this.vocabularyWords.push(word);
    await this.saveVocabulary();

    // Generate media files
    await this.generateMediaForWord(word);
  }

  async updateWord(
    id: string,
    updates: VocabularyUpdateOptions
  ): Promise<void> {
    await this.loadVocabulary();

    const wordIndex = this.vocabularyWords.findIndex((w) => w.id === id);
    if (wordIndex === -1) {
      throw new Error(`Word with ID '${id}' not found`);
    }

    const oldWord = { ...this.vocabularyWords[wordIndex] };
    const newWord = { ...oldWord, ...updates };

    // Update the word
    this.vocabularyWords[wordIndex] = newWord;
    await this.saveVocabulary();

    // Regenerate media if needed
    if (updates.regenerateImage || updates.imagePrompt !== oldWord.imagePrompt) {
      await this.generateImageForWord(newWord);
    }

    if (updates.regenerateAudio) {
      await this.generateAudioForWord(newWord);
    } else {
      // Check if any text changed and regenerate corresponding audio
      if (updates.english && updates.english !== oldWord.english) {
        await this.generateAudioForLanguage(newWord, "en");
      }
      if (updates.french && updates.french !== oldWord.french) {
        await this.generateAudioForLanguage(newWord, "fr");
      }
      if (updates.italian && updates.italian !== oldWord.italian) {
        await this.generateAudioForLanguage(newWord, "it");
      }
    }
  }

  async deleteWord(id: string): Promise<void> {
    await this.loadVocabulary();

    const wordIndex = this.vocabularyWords.findIndex((w) => w.id === id);
    if (wordIndex === -1) {
      throw new Error(`Word with ID '${id}' not found`);
    }

    // Remove the word
    this.vocabularyWords.splice(wordIndex, 1);
    await this.saveVocabulary();

    // Delete media files
    await this.deleteMediaFiles(id);
  }

  async findWord(query: string): Promise<VocabularyWord[]> {
    await this.loadVocabulary();

    const lowercaseQuery = query.toLowerCase();
    return this.vocabularyWords.filter(
      (word) =>
        word.id.toLowerCase().includes(lowercaseQuery) ||
        word.english.toLowerCase().includes(lowercaseQuery) ||
        word.french.toLowerCase().includes(lowercaseQuery) ||
        word.italian.toLowerCase().includes(lowercaseQuery) ||
        word.category.toLowerCase().includes(lowercaseQuery)
    );
  }

  async replaceText(oldText: string, newText: string, language?: "en" | "fr" | "it"): Promise<void> {
    await this.loadVocabulary();

    let updatedWords = 0;
    const updates: Array<{ word: VocabularyWord; field: string }> = [];

    for (let i = 0; i < this.vocabularyWords.length; i++) {
      const word = this.vocabularyWords[i];
      let updated = false;

      if (!language || language === "en") {
        if (word.english.toLowerCase() === oldText.toLowerCase()) {
          this.vocabularyWords[i].english = newText;
          updates.push({ word: this.vocabularyWords[i], field: "en" });
          updated = true;
        }
      }

      if (!language || language === "fr") {
        if (word.french.toLowerCase() === oldText.toLowerCase()) {
          this.vocabularyWords[i].french = newText;
          updates.push({ word: this.vocabularyWords[i], field: "fr" });
          updated = true;
        }
      }

      if (!language || language === "it") {
        if (word.italian.toLowerCase() === oldText.toLowerCase()) {
          this.vocabularyWords[i].italian = newText;
          updates.push({ word: this.vocabularyWords[i], field: "it" });
          updated = true;
        }
      }

      if (updated) {
        updatedWords++;
      }
    }

    if (updatedWords > 0) {
      await this.saveVocabulary();

      // Regenerate audio for updated words
      for (const update of updates) {
        await this.generateAudioForLanguage(update.word, update.field as "en" | "fr" | "it");
      }

      console.log(`Updated ${updatedWords} word(s): "${oldText}" → "${newText}"`);
    } else {
      console.log(`No words found with text "${oldText}"`);
    }
  }

  async regenerateMedia(
    id: string,
    mediaType: "image" | "audio" | "all"
  ): Promise<void> {
    await this.loadVocabulary();

    const word = this.vocabularyWords.find((w) => w.id === id);
    if (!word) {
      throw new Error(`Word with ID '${id}' not found`);
    }

    if (mediaType === "image" || mediaType === "all") {
      await this.generateImageForWord(word);
    }

    if (mediaType === "audio" || mediaType === "all") {
      await this.generateAudioForWord(word);
    }
  }

  private async generateMediaForWord(word: VocabularyWord): Promise<void> {
    await this.generateImageForWord(word);
    await this.generateAudioForWord(word);
  }

  private async generateImageForWord(word: VocabularyWord): Promise<void> {
    const outputPath = path.join(IMAGE_DIR, `${word.id}.webp`);

    // Ensure directory exists
    await mediaGenerator.ensureDirectoryExists(IMAGE_DIR);

    const prompt = `Create a simple, colorful, child-friendly illustration: ${word.imagePrompt}
Style: Cute cartoon style for children ages 3-7, bright vibrant colors, simple rounded shapes, educational.
Background: Clean white or soft pastel background.
The image should clearly represent the word "${word.english}" (${word.french} in French, ${word.italian} in Italian).
Make it cheerful and easy to understand for young children learning languages.`;

    try {
      await mediaGenerator.generateImage({
        prompt,
        outputPath,
        width: 512,
        height: 512,
        quality: 85,
      });
      console.log(`✅ Generated image for ${word.id} (${word.english})`);
    } catch (error) {
      console.error(`❌ Failed to generate image for ${word.id}: ${error instanceof Error ? error.message : String(error)}`);
      // Create placeholder
      await mediaGenerator.generatePlaceholderImage(word.english, outputPath);
      console.log(`📝 Created placeholder image for ${word.id}`);
    }
  }

  private async generateAudioForWord(word: VocabularyWord): Promise<void> {
    await this.generateAudioForLanguage(word, "en");
    await this.generateAudioForLanguage(word, "fr");
    await this.generateAudioForLanguage(word, "it");
  }

  private async generateAudioForLanguage(
    word: VocabularyWord,
    language: "en" | "fr" | "it"
  ): Promise<void> {
    const audioDir = {
      en: AUDIO_DIR_EN,
      fr: AUDIO_DIR_FR,
      it: AUDIO_DIR_IT,
    }[language];

    const text = {
      en: word.english,
      fr: word.french,
      it: word.italian,
    }[language];

    const outputPath = path.join(audioDir, `${word.id}.mp3`);

    // Ensure directory exists
    await mediaGenerator.ensureDirectoryExists(audioDir);

    try {
      await mediaGenerator.generateTTS({
        text,
        language,
        outputPath,
      });
      console.log(`✅ Generated ${language} audio for ${word.id} (${text})`);
    } catch (error) {
      console.error(`❌ Failed to generate ${language} audio for ${word.id}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async deleteMediaFiles(id: string): Promise<void> {
    const files = [
      path.join(IMAGE_DIR, `${id}.webp`),
      path.join(AUDIO_DIR_EN, `${id}.mp3`),
      path.join(AUDIO_DIR_FR, `${id}.mp3`),
      path.join(AUDIO_DIR_IT, `${id}.mp3`),
    ];

    for (const file of files) {
      try {
        await fs.unlink(file);
        console.log(`🗑️ Deleted: ${file}`);
      } catch (error) {
        // File might not exist, that's ok
      }
    }
  }

  async generateNextId(category: string): Promise<string> {
    await this.loadVocabulary();

    const categoryWords = this.vocabularyWords.filter(w => w.category === category);
    if (categoryWords.length === 0) {
      // Return a new category prefix
      const categoryPrefixes: Record<string, string> = {
        numbers: "num",
        greetings: "greet",
        family: "fam",
        people: "ppl",
        animals: "ani",
        food: "food",
        body: "body",
        colors: "col",
        clothing: "cloth",
        house: "house",
        furniture: "furn",
        objects: "obj",
        kitchen: "kit",
        transport: "trans",
        nature: "nat",
        time: "time",
        actions: "act",
        emotions: "emo",
        expressions: "expr",
        school: "sch",
        seasons: "seas",
        descriptions: "size",
      };

      const prefix = categoryPrefixes[category] || category.substring(0, 3);
      return `${prefix}_1`;
    }

    // Find the highest number in this category
    let maxNum = 0;
    for (const word of categoryWords) {
      const match = word.id.match(/_(\d+)$/);
      if (match) {
        const num = parseInt(match[1]);
        if (num > maxNum) {
          maxNum = num;
        }
      }
    }

    const prefix = categoryWords[0].id.replace(/_\d+$/, "");
    return `${prefix}_${maxNum + 1}`;
  }

  async listCategories(): Promise<string[]> {
    await this.loadVocabulary();
    const categories = new Set(this.vocabularyWords.map(w => w.category));
    return Array.from(categories).sort();
  }

  async getWordsByCategory(category: string): Promise<VocabularyWord[]> {
    await this.loadVocabulary();
    return this.vocabularyWords.filter(w => w.category === category);
  }
}

export const vocabularyManager = new VocabularyManager();