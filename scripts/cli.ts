#!/usr/bin/env node

import { Command } from "commander";
import { vocabularyManager } from "./utils/vocabulary-manager";
import { mediaGenerator } from "./utils/media-generator";
import { youtubeManager } from "./utils/youtube-manager";
import { searchImages, pickCandidates, installCharacter, slugify } from "./utils/character-search";
import { CONFIG, formatSuccess, formatError, formatInfo, formatWarning, validateApiKeys } from "./config";
import { VocabularyWord } from "../types/vocabulary";
import * as path from "node:path";
import * as fs from "node:fs/promises";

const program = new Command();

program
  .name("madeleine-cli")
  .description("Utility toolkit for Madeleine's Learning Games")
  .version("1.0.0");

// Vocabulary commands
const vocab = program
  .command("vocab")
  .description("Manage vocabulary words");

vocab
  .command("add")
  .description("Add a new vocabulary word")
  .option("-e, --english <text>", "English word")
  .option("-f, --french <text>", "French word")
  .option("-i, --italian <text>", "Italian word")
  .option("-c, --category <category>", "Category")
  .option("-p, --prompt <prompt>", "Image generation prompt")
  .option("--id <id>", "Custom ID (auto-generated if not provided)")
  .action(async (options) => {
    try {
      if (!options.english || !options.french || !options.italian || !options.category) {
        throw new Error("All translations and category are required");
      }

      const id = options.id || await vocabularyManager.generateNextId(options.category);
      const imagePrompt = options.prompt || `${options.english} illustration for children`;

      const word: VocabularyWord = {
        id,
        english: options.english,
        french: options.french,
        italian: options.italian,
        category: options.category,
        imagePrompt,
      };

      await vocabularyManager.addWord(word);
      console.log(formatSuccess(`Added word: ${word.id} (${word.english})`));
    } catch (error) {
      console.error(formatError(error instanceof Error ? error.message : String(error)));
      process.exit(1);
    }
  });

vocab
  .command("update")
  .description("Update an existing vocabulary word")
  .argument("<id>", "Word ID to update")
  .option("-e, --english <text>", "New English word")
  .option("-f, --french <text>", "New French word")
  .option("-i, --italian <text>", "New Italian word")
  .option("-c, --category <category>", "New category")
  .option("-p, --prompt <prompt>", "New image generation prompt")
  .option("--regenerate-image", "Force regenerate image")
  .option("--regenerate-audio", "Force regenerate all audio")
  .action(async (id, options) => {
    try {
      await vocabularyManager.updateWord(id, {
        english: options.english,
        french: options.french,
        italian: options.italian,
        category: options.category,
        imagePrompt: options.prompt,
        regenerateImage: options.regenerateImage,
        regenerateAudio: options.regenerateAudio,
      });
      console.log(formatSuccess(`Updated word: ${id}`));
    } catch (error) {
      console.error(formatError(error instanceof Error ? error.message : String(error)));
      process.exit(1);
    }
  });

vocab
  .command("replace")
  .description("Replace text across all vocabulary words")
  .argument("<old-text>", "Text to find")
  .argument("<new-text>", "Text to replace with")
  .option("-l, --language <lang>", "Specific language (en/fr/it)")
  .action(async (oldText, newText, options) => {
    try {
      await vocabularyManager.replaceText(oldText, newText, options.language);
    } catch (error) {
      console.error(formatError(error instanceof Error ? error.message : String(error)));
      process.exit(1);
    }
  });

vocab
  .command("delete")
  .description("Delete a vocabulary word")
  .argument("<id>", "Word ID to delete")
  .action(async (id) => {
    try {
      await vocabularyManager.deleteWord(id);
      console.log(formatSuccess(`Deleted word: ${id}`));
    } catch (error) {
      console.error(formatError(error instanceof Error ? error.message : String(error)));
      process.exit(1);
    }
  });

vocab
  .command("find")
  .description("Search for vocabulary words")
  .argument("<query>", "Search query")
  .action(async (query) => {
    try {
      const words = await vocabularyManager.findWord(query);
      if (words.length === 0) {
        console.log(formatWarning("No words found"));
      } else {
        console.log(formatInfo(`Found ${words.length} word(s):`));
        words.forEach(word => {
          console.log(`  ${word.id}: ${word.english} / ${word.french} / ${word.italian} (${word.category})`);
        });
      }
    } catch (error) {
      console.error(formatError(error instanceof Error ? error.message : String(error)));
      process.exit(1);
    }
  });

vocab
  .command("list")
  .description("List vocabulary by category")
  .option("-c, --category <category>", "Filter by category")
  .action(async (options) => {
    try {
      if (options.category) {
        const words = await vocabularyManager.getWordsByCategory(options.category);
        console.log(formatInfo(`${options.category}: ${words.length} words`));
        words.forEach(word => {
          console.log(`  ${word.id}: ${word.english} / ${word.french} / ${word.italian}`);
        });
      } else {
        const categories = await vocabularyManager.listCategories();
        console.log(formatInfo("Categories:"));
        for (const category of categories) {
          const words = await vocabularyManager.getWordsByCategory(category);
          console.log(`  ${category}: ${words.length} words`);
        }
      }
    } catch (error) {
      console.error(formatError(error instanceof Error ? error.message : String(error)));
      process.exit(1);
    }
  });

vocab
  .command("regenerate")
  .description("Regenerate media for a word")
  .argument("<id>", "Word ID")
  .option("-t, --type <type>", "Media type: image, audio, or all", "all")
  .action(async (id, options) => {
    try {
      await vocabularyManager.regenerateMedia(id, options.type);
      console.log(formatSuccess(`Regenerated ${options.type} for word: ${id}`));
    } catch (error) {
      console.error(formatError(error instanceof Error ? error.message : String(error)));
      process.exit(1);
    }
  });

// Media commands
const media = program
  .command("media")
  .description("Generate media files");

media
  .command("image")
  .description("Generate a standalone image")
  .argument("<prompt>", "Image generation prompt")
  .argument("<output>", "Output file path")
  .option("-w, --width <number>", "Image width", "512")
  .option("-h, --height <number>", "Image height", "512")
  .option("-q, --quality <number>", "Image quality (1-100)", "85")
  .action(async (prompt, output, options) => {
    try {
      if (!validateApiKeys()) {
        process.exit(1);
      }

      console.log(formatInfo("Generating image..."));
      await mediaGenerator.generateImage({
        prompt,
        outputPath: output,
        width: parseInt(options.width),
        height: parseInt(options.height),
        quality: parseInt(options.quality),
      });
      console.log(formatSuccess(`Image saved to: ${output}`));
    } catch (error) {
      console.error(formatError(error instanceof Error ? error.message : String(error)));
      process.exit(1);
    }
  });

media
  .command("tts")
  .description("Generate text-to-speech audio")
  .argument("<text>", "Text to speak")
  .argument("<output>", "Output file path")
  .option("-l, --language <lang>", "Language (en/fr/it)", "en")
  .option("-r, --rate <number>", "Speaking rate", "1.0")
  .action(async (text, output, options) => {
    try {
      console.log(formatInfo("Generating audio..."));
      await mediaGenerator.generateTTS({
        text,
        language: options.language,
        outputPath: output,
        speakingRate: parseFloat(options.rate),
      });
      console.log(formatSuccess(`Audio saved to: ${output}`));
    } catch (error) {
      console.error(formatError(error instanceof Error ? error.message : String(error)));
      process.exit(1);
    }
  });

media
  .command("app-icon")
  .description("Generate app icons in multiple sizes")
  .argument("<prompt>", "Icon design prompt")
  .argument("<output-dir>", "Output directory")
  .action(async (prompt, outputDir) => {
    try {
      if (!validateApiKeys()) {
        process.exit(1);
      }

      console.log(formatInfo("Generating app icons..."));
      await fs.mkdir(outputDir, { recursive: true });
      await mediaGenerator.generateAppIcon(prompt, outputDir);
      console.log(formatSuccess(`Icons saved to: ${outputDir}`));
    } catch (error) {
      console.error(formatError(error instanceof Error ? error.message : String(error)));
      process.exit(1);
    }
  });

// Batch commands
const batch = program
  .command("batch")
  .description("Batch operations");

batch
  .command("regenerate-images")
  .description("Regenerate all vocabulary images")
  .option("-c, --category <category>", "Filter by category")
  .option("-s, --start <number>", "Start index", "0")
  .action(async (options) => {
    try {
      if (!validateApiKeys()) {
        process.exit(1);
      }

      await vocabularyManager.loadVocabulary();
      let words = options.category 
        ? await vocabularyManager.getWordsByCategory(options.category)
        : await vocabularyManager.findWord("");

      const startIndex = parseInt(options.start);
      words = words.slice(startIndex);

      console.log(formatInfo(`Processing ${words.length} words starting from index ${startIndex}`));

      for (let i = 0; i < words.length; i++) {
        const word = words[i];
        console.log(formatInfo(`[${i + 1}/${words.length}] Processing ${word.id}`));
        
        try {
          await vocabularyManager.regenerateMedia(word.id, "image");
          // Rate limiting
          if (i < words.length - 1) {
            await new Promise(resolve => setTimeout(resolve, CONFIG.rateLimit.imageGeneration.delayMs));
          }
        } catch (error) {
          console.error(formatError(`Failed for ${word.id}: ${error instanceof Error ? error.message : String(error)}`));
        }

        // Batch delay
        if ((i + 1) % CONFIG.rateLimit.imageGeneration.batchSize === 0 && i < words.length - 1) {
          console.log(formatWarning(`Batch delay: ${CONFIG.rateLimit.imageGeneration.batchDelayMs / 1000}s`));
          await new Promise(resolve => setTimeout(resolve, CONFIG.rateLimit.imageGeneration.batchDelayMs));
        }
      }

      console.log(formatSuccess("Batch regeneration complete"));
    } catch (error) {
      console.error(formatError(error instanceof Error ? error.message : String(error)));
      process.exit(1);
    }
  });

batch
  .command("regenerate-audio")
  .description("Regenerate all vocabulary audio")
  .option("-c, --category <category>", "Filter by category")
  .option("-l, --language <lang>", "Specific language (en/fr/it)")
  .action(async (options) => {
    try {
      await vocabularyManager.loadVocabulary();
      let words = options.category 
        ? await vocabularyManager.getWordsByCategory(options.category)
        : await vocabularyManager.findWord("");

      console.log(formatInfo(`Processing ${words.length} words`));

      for (let i = 0; i < words.length; i++) {
        const word = words[i];
        console.log(formatInfo(`[${i + 1}/${words.length}] Processing ${word.id}`));
        
        try {
          await vocabularyManager.regenerateMedia(word.id, "audio");
          // Rate limiting
          if (i < words.length - 1) {
            await new Promise(resolve => setTimeout(resolve, CONFIG.rateLimit.ttsGeneration.delayMs));
          }
        } catch (error) {
          console.error(formatError(`Failed for ${word.id}: ${error instanceof Error ? error.message : String(error)}`));
        }

        // Batch delay
        if ((i + 1) % CONFIG.rateLimit.ttsGeneration.batchSize === 0 && i < words.length - 1) {
          console.log(formatWarning(`Batch delay: ${CONFIG.rateLimit.ttsGeneration.batchDelayMs / 1000}s`));
          await new Promise(resolve => setTimeout(resolve, CONFIG.rateLimit.ttsGeneration.batchDelayMs));
        }
      }

      console.log(formatSuccess("Batch regeneration complete"));
    } catch (error) {
      console.error(formatError(error instanceof Error ? error.message : String(error)));
      process.exit(1);
    }
  });

// YouTube commands
const youtube = program
  .command("youtube")
  .description("Manage YouTube videos");

youtube
  .command("search")
  .description("Search YouTube and add videos to a category")
  .argument("<query>", "Search query")
  .option("-c, --category <category>", "Target category (e.g., yoga, drawing)", "drawing")
  .option("-t, --top <number>", "Number of top results to add", "3")
  .action(async (query, options) => {
    try {
      if (!validateApiKeys()) {
        process.exit(1);
      }

      const maxResults = parseInt(options.top);
      if (isNaN(maxResults) || maxResults < 1 || maxResults > 50) {
        throw new Error("Top results must be between 1 and 50");
      }

      await youtubeManager.searchAndAdd(query, options.category, maxResults);
    } catch (error) {
      console.error(formatError(error instanceof Error ? error.message : String(error)));
      process.exit(1);
    }
  });

youtube
  .command("list")
  .description("List videos by category")
  .option("-c, --category <category>", "Filter by category")
  .action(async (options) => {
    try {
      await youtubeManager.listVideos(options.category);
    } catch (error) {
      console.error(formatError(error instanceof Error ? error.message : String(error)));
      process.exit(1);
    }
  });

youtube
  .command("categories")
  .description("List all available categories")
  .action(async () => {
    try {
      const categories = await youtubeManager.listCategories();
      console.log(formatInfo("Available categories:"));
      categories.forEach(cat => {
        console.log(`  - ${cat}`);
      });
    } catch (error) {
      console.error(formatError(error instanceof Error ? error.message : String(error)));
      process.exit(1);
    }
  });

youtube
  .command("import-playlist")
  .description("Import all videos from a YouTube playlist")
  .argument("<playlist-id>", "YouTube playlist ID or URL")
  .option("-c, --category <category>", "Target category (e.g., yoga, drawing)", "yoga")
  .action(async (playlistIdOrUrl, options) => {
    try {
      if (!validateApiKeys()) {
        process.exit(1);
      }

      // Extract playlist ID from URL if needed
      let playlistId = playlistIdOrUrl;
      const urlMatch = playlistIdOrUrl.match(/[?&]list=([^&]+)/);
      if (urlMatch) {
        playlistId = urlMatch[1];
      }

      console.log(formatInfo(`Importing playlist: ${playlistId}`));
      await youtubeManager.importPlaylist(playlistId, options.category);
    } catch (error) {
      console.error(formatError(error instanceof Error ? error.message : String(error)));
      process.exit(1);
    }
  });

// Character image sourcing commands
const char = program
  .command("char")
  .description("Source character images from Google Images");

char
  .command("search")
  .description("Search Google Images for character thumbnail and coloring page candidates")
  .argument("<name>", "Character name, e.g. \"Ron Weasley\"")
  .option("-t, --type <type>", "thumbnail | coloring | both", "both")
  .option("-n, --count <count>", "Number of candidates per search", "25")
  .option("--thumbnail-query <query>", "Override the thumbnail search query")
  .option("--coloring-query <query>", "Override the coloring page search query")
  .action(async (name, options) => {
    try {
      const count = parseInt(options.count, 10);
      const searches: { type: "thumbnail" | "coloring"; query: string }[] = [];
      if (options.type === "thumbnail" || options.type === "both") {
        searches.push({ type: "thumbnail", query: options.thumbnailQuery || `${name} character` });
      }
      if (options.type === "coloring" || options.type === "both") {
        searches.push({ type: "coloring", query: options.coloringQuery || `${name} coloring page printable` });
      }
      for (const search of searches) {
        console.log(formatInfo(`Searching (${search.type}): ${search.query}`));
        const result = await searchImages(name, search.type, search.query, count);
        console.log(formatSuccess(`${result.found} candidates → ${result.sheetPng}`));
      }
    } catch (error) {
      console.error(formatError(error instanceof Error ? error.message : String(error)));
      process.exit(1);
    }
  });

char
  .command("pick")
  .description("Download and process selected candidates into game formats (staged, not installed)")
  .argument("<name>", "Character name or slug")
  .option("--thumbnail <n>", "Candidate number for the character portrait")
  .option("--coloring <n,n,n,n>", "Comma-separated candidate numbers for coloring pages")
  .option("--lineart <n,n>", "Coloring candidates to run through colour→line-art conversion")
  .option("--portrait-fit <fit>", "Portrait framing: cover (face-aware crop) or contain (letterbox on white)", "cover")
  .option("--portrait-crop <left,top,width>", "Manual 2:1 crop window in source pixels (height = width/2)")
  .action(async (name, options) => {
    try {
      const thumbnailIndex = options.thumbnail ? parseInt(options.thumbnail, 10) : null;
      const coloringIndexes: number[] = options.coloring
        ? options.coloring.split(",").map((s: string) => parseInt(s.trim(), 10))
        : [];
      const lineartIndexes: number[] = options.lineart
        ? options.lineart.split(",").map((s: string) => parseInt(s.trim(), 10))
        : [];
      let portraitCrop;
      if (options.portraitCrop) {
        const [left, top, width] = options.portraitCrop.split(",").map((s: string) => parseInt(s.trim(), 10));
        portraitCrop = { left, top, width };
      }
      const result = await pickCandidates(name, thumbnailIndex, coloringIndexes, {
        lineartIndexes,
        portraitFit: options.portraitFit === "contain" ? "contain" : "cover",
        portraitCrop,
      });
      console.log(formatSuccess(`Staged in ${result.dir}`));
      console.log(formatInfo(`Preview: ${result.previewPng}`));
    } catch (error) {
      console.error(formatError(error instanceof Error ? error.message : String(error)));
      process.exit(1);
    }
  });

char
  .command("install")
  .description("Copy staged images into the game and register the character")
  .argument("<name>", "Character display name, e.g. \"Ron Weasley\"")
  .option("-f, --franchise <franchise>", "Franchise name", "Misc")
  .action(async (name, options) => {
    try {
      await installCharacter(name, name, options.franchise);
      console.log(formatSuccess(`${name} installed (id: ${slugify(name)})`));
    } catch (error) {
      console.error(formatError(error instanceof Error ? error.message : String(error)));
      process.exit(1);
    }
  });

// Parse command line arguments
program.parse(process.argv);