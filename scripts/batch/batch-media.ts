import { vocabularyManager } from "../utils/vocabulary-manager";
import { mediaGenerator } from "../utils/media-generator";
import { CONFIG, formatSuccess, formatError, formatInfo, formatWarning } from "../config";
import * as fs from "node:fs/promises";
import * as path from "node:path";

interface MediaProgress {
  totalWords: number;
  processedCount: number;
  skippedCount: number;
  errorCount: number;
  lastProcessedIndex: number;
  timestamp: string;
  category?: string;
  mediaType: "image" | "audio" | "all";
}

export class BatchMedia {
  private progressFile = path.join(CONFIG.paths.progress, "batch-media.json");

  async regenerateAllImages(category?: string, startIndex = 0): Promise<void> {
    await vocabularyManager.loadVocabulary();
    
    let words = category 
      ? await vocabularyManager.getWordsByCategory(category)
      : await vocabularyManager.findWord("");

    const progress: MediaProgress = {
      totalWords: words.length,
      processedCount: 0,
      skippedCount: 0,
      errorCount: 0,
      lastProcessedIndex: startIndex - 1,
      timestamp: new Date().toISOString(),
      category,
      mediaType: "image",
    };

    // Check for existing progress
    const existingProgress = await this.loadProgress();
    if (existingProgress && existingProgress.mediaType === "image" && existingProgress.category === category) {
      console.log(formatWarning(`Resuming from index ${existingProgress.lastProcessedIndex + 1}`));
      progress.lastProcessedIndex = existingProgress.lastProcessedIndex;
      progress.processedCount = existingProgress.processedCount;
      progress.skippedCount = existingProgress.skippedCount;
      progress.errorCount = existingProgress.errorCount;
    }

    words = words.slice(progress.lastProcessedIndex + 1);

    console.log(formatInfo(`Processing ${words.length} words`));
    console.log(formatInfo(`Rate limit: ${CONFIG.rateLimit.imageGeneration.delayMs}ms between requests`));
    console.log(formatInfo(`Batch size: ${CONFIG.rateLimit.imageGeneration.batchSize}`));

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const globalIndex = progress.lastProcessedIndex + i + 1;
      
      console.log(formatInfo(`[${globalIndex + 1}/${progress.totalWords}] Processing ${word.id} (${word.english})`));

      const imagePath = path.join(CONFIG.paths.images.vocabulary, `${word.id}.webp`);
      
      // Check if image already exists
      if (await mediaGenerator.checkFileExists(imagePath)) {
        console.log(formatWarning(`Image already exists for ${word.id}`));
        progress.skippedCount++;
      } else {
        try {
          await vocabularyManager.regenerateMedia(word.id, "image");
          progress.processedCount++;
        } catch (error) {
          console.error(formatError(`Failed for ${word.id}: ${error.message}`));
          progress.errorCount++;
        }
      }

      progress.lastProcessedIndex = globalIndex;
      await this.saveProgress(progress);

      // Rate limiting
      if (i < words.length - 1) {
        await new Promise(resolve => setTimeout(resolve, CONFIG.rateLimit.imageGeneration.delayMs));
      }

      // Batch delay
      if ((globalIndex + 1) % CONFIG.rateLimit.imageGeneration.batchSize === 0 && i < words.length - 1) {
        const delaySeconds = CONFIG.rateLimit.imageGeneration.batchDelayMs / 1000;
        console.log(formatWarning(`Batch delay: ${delaySeconds}s (You can stop and resume from index ${globalIndex + 1})`));
        await new Promise(resolve => setTimeout(resolve, CONFIG.rateLimit.imageGeneration.batchDelayMs));
      }
    }

    await this.printSummary(progress);
    await this.clearProgress();
  }

  async regenerateAllAudio(category?: string, language?: "en" | "fr" | "it"): Promise<void> {
    await vocabularyManager.loadVocabulary();
    
    let words = category 
      ? await vocabularyManager.getWordsByCategory(category)
      : await vocabularyManager.findWord("");

    const progress: MediaProgress = {
      totalWords: words.length,
      processedCount: 0,
      skippedCount: 0,
      errorCount: 0,
      lastProcessedIndex: -1,
      timestamp: new Date().toISOString(),
      category,
      mediaType: "audio",
    };

    console.log(formatInfo(`Processing ${words.length} words`));
    console.log(formatInfo(`Languages: ${language || "all"}`));
    console.log(formatInfo(`Rate limit: ${CONFIG.rateLimit.ttsGeneration.delayMs}ms between requests`));

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      console.log(formatInfo(`[${i + 1}/${words.length}] Processing ${word.id} (${word.english})`));

      let hasNewAudio = false;

      // Process each language
      const languages: Array<"en" | "fr" | "it"> = language ? [language] : ["en", "fr", "it"];
      
      for (const lang of languages) {
        const audioDir = {
          en: CONFIG.paths.audio.vocabularyEn,
          fr: CONFIG.paths.audio.vocabularyFr,
          it: CONFIG.paths.audio.vocabularyIt,
        }[lang];

        const audioPath = path.join(audioDir, `${word.id}.mp3`);

        if (await mediaGenerator.checkFileExists(audioPath)) {
          console.log(formatWarning(`${lang} audio already exists for ${word.id}`));
        } else {
          try {
            const text = {
              en: word.english,
              fr: word.french,
              it: word.italian,
            }[lang];

            await mediaGenerator.ensureDirectoryExists(audioDir);
            await mediaGenerator.generateTTS({
              text,
              language: lang,
              outputPath: audioPath,
            });
            
            console.log(formatSuccess(`Generated ${lang} audio for ${word.id}`));
            hasNewAudio = true;
          } catch (error) {
            console.error(formatError(`Failed ${lang} audio for ${word.id}: ${error.message}`));
            progress.errorCount++;
          }
        }

        // Rate limiting between language generation
        if (hasNewAudio) {
          await new Promise(resolve => setTimeout(resolve, CONFIG.rateLimit.ttsGeneration.delayMs));
        }
      }

      if (hasNewAudio) {
        progress.processedCount++;
      } else {
        progress.skippedCount++;
      }

      progress.lastProcessedIndex = i;
      await this.saveProgress(progress);

      // Batch delay
      if ((i + 1) % CONFIG.rateLimit.ttsGeneration.batchSize === 0 && i < words.length - 1) {
        const delaySeconds = CONFIG.rateLimit.ttsGeneration.batchDelayMs / 1000;
        console.log(formatWarning(`Batch delay: ${delaySeconds}s`));
        await new Promise(resolve => setTimeout(resolve, CONFIG.rateLimit.ttsGeneration.batchDelayMs));
      }
    }

    await this.printSummary(progress);
    await this.clearProgress();
  }

  async checkMissingMedia(): Promise<void> {
    await vocabularyManager.loadVocabulary();
    const words = await vocabularyManager.findWord("");

    const missingImages: string[] = [];
    const missingAudio: { [key: string]: string[] } = { en: [], fr: [], it: [] };

    for (const word of words) {
      // Check image
      const imagePath = path.join(CONFIG.paths.images.vocabulary, `${word.id}.webp`);
      if (!(await mediaGenerator.checkFileExists(imagePath))) {
        missingImages.push(word.id);
      }

      // Check audio for each language
      const audioChecks = [
        { lang: "en", path: path.join(CONFIG.paths.audio.vocabularyEn, `${word.id}.mp3`) },
        { lang: "fr", path: path.join(CONFIG.paths.audio.vocabularyFr, `${word.id}.mp3`) },
        { lang: "it", path: path.join(CONFIG.paths.audio.vocabularyIt, `${word.id}.mp3`) },
      ];

      for (const check of audioChecks) {
        if (!(await mediaGenerator.checkFileExists(check.path))) {
          missingAudio[check.lang].push(word.id);
        }
      }
    }

    // Report findings
    console.log(formatInfo("Media Check Report"));
    console.log(formatInfo("=================="));

    if (missingImages.length > 0) {
      console.log(formatWarning(`Missing images: ${missingImages.length}`));
      missingImages.slice(0, 10).forEach(id => console.log(`  - ${id}`));
      if (missingImages.length > 10) {
        console.log(`  ... and ${missingImages.length - 10} more`);
      }
    } else {
      console.log(formatSuccess("All images present"));
    }

    for (const lang of ["en", "fr", "it"]) {
      if (missingAudio[lang].length > 0) {
        console.log(formatWarning(`Missing ${lang} audio: ${missingAudio[lang].length}`));
        missingAudio[lang].slice(0, 5).forEach(id => console.log(`  - ${id}`));
        if (missingAudio[lang].length > 5) {
          console.log(`  ... and ${missingAudio[lang].length - 5} more`);
        }
      } else {
        console.log(formatSuccess(`All ${lang} audio present`));
      }
    }
  }

  private async loadProgress(): Promise<MediaProgress | null> {
    try {
      const content = await fs.readFile(this.progressFile, "utf-8");
      return JSON.parse(content);
    } catch {
      return null;
    }
  }

  private async saveProgress(progress: MediaProgress): Promise<void> {
    await fs.mkdir(path.dirname(this.progressFile), { recursive: true });
    await fs.writeFile(this.progressFile, JSON.stringify(progress, null, 2));
  }

  private async clearProgress(): Promise<void> {
    try {
      await fs.unlink(this.progressFile);
    } catch {
      // File might not exist
    }
  }

  private async printSummary(progress: MediaProgress): Promise<void> {
    console.log("\n" + "=".repeat(60));
    console.log(formatSuccess("BATCH PROCESSING COMPLETE"));
    console.log("=".repeat(60));
    console.log(formatInfo(`Total words processed: ${progress.totalWords}`));
    console.log(formatSuccess(`Successfully generated: ${progress.processedCount}`));
    console.log(formatWarning(`Skipped (already existed): ${progress.skippedCount}`));
    console.log(formatError(`Errors: ${progress.errorCount}`));

    const successRate = progress.processedCount > 0
      ? ((progress.processedCount / (progress.processedCount + progress.errorCount)) * 100).toFixed(1)
      : "100";
    
    console.log(formatInfo(`Success rate: ${successRate}%`));

    if (progress.errorCount > 0) {
      console.log(formatWarning("\nSome files failed to generate. You can run the command again to retry."));
    }
  }
}

export const batchMedia = new BatchMedia();