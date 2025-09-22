import { vocabularyManager } from "../utils/vocabulary-manager";
import { CONFIG, formatSuccess, formatError, formatInfo, formatWarning, validateApiKeys } from "../config";
import { VocabularyWord } from "../../types/vocabulary";
import * as fs from "node:fs/promises";
import * as path from "node:path";

interface BatchOperation {
  type: "add" | "update" | "delete";
  data: any;
}

interface BatchProgress {
  totalOperations: number;
  completedOperations: number;
  failedOperations: number;
  operations: BatchOperation[];
  lastProcessedIndex: number;
  timestamp: string;
}

export class BatchVocabulary {
  private progressFile = path.join(CONFIG.paths.progress, "batch-vocabulary.json");

  async processBatchFile(filePath: string): Promise<void> {
    try {
      const content = await fs.readFile(filePath, "utf-8");
      const operations = JSON.parse(content) as BatchOperation[];

      console.log(formatInfo(`Processing ${operations.length} operations`));

      const progress: BatchProgress = {
        totalOperations: operations.length,
        completedOperations: 0,
        failedOperations: 0,
        operations,
        lastProcessedIndex: -1,
        timestamp: new Date().toISOString(),
      };

      // Check for existing progress
      const existingProgress = await this.loadProgress();
      if (existingProgress && existingProgress.operations.length === operations.length) {
        console.log(formatWarning(`Resuming from operation ${existingProgress.lastProcessedIndex + 1}`));
        progress.lastProcessedIndex = existingProgress.lastProcessedIndex;
        progress.completedOperations = existingProgress.completedOperations;
        progress.failedOperations = existingProgress.failedOperations;
      }

      for (let i = progress.lastProcessedIndex + 1; i < operations.length; i++) {
        const operation = operations[i];
        console.log(formatInfo(`[${i + 1}/${operations.length}] Processing ${operation.type} operation`));

        try {
          await this.processOperation(operation);
          progress.completedOperations++;
          console.log(formatSuccess(`Operation ${i + 1} completed`));
        } catch (error) {
          progress.failedOperations++;
          console.error(formatError(`Operation ${i + 1} failed: ${error.message}`));
        }

        progress.lastProcessedIndex = i;
        await this.saveProgress(progress);

        // Rate limiting
        if (i < operations.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      console.log(formatSuccess(`Batch processing complete`));
      console.log(formatInfo(`Completed: ${progress.completedOperations}`));
      console.log(formatInfo(`Failed: ${progress.failedOperations}`));

      // Clean up progress file
      await this.clearProgress();
    } catch (error) {
      console.error(formatError(`Batch processing failed: ${error.message}`));
      throw error;
    }
  }

  private async processOperation(operation: BatchOperation): Promise<void> {
    switch (operation.type) {
      case "add":
        await this.processAdd(operation.data);
        break;
      case "update":
        await this.processUpdate(operation.data);
        break;
      case "delete":
        await this.processDelete(operation.data);
        break;
      default:
        throw new Error(`Unknown operation type: ${operation.type}`);
    }
  }

  private async processAdd(data: any): Promise<void> {
    const word: VocabularyWord = {
      id: data.id || await vocabularyManager.generateNextId(data.category),
      english: data.english,
      french: data.french,
      italian: data.italian,
      category: data.category,
      imagePrompt: data.imagePrompt || `${data.english} illustration for children`,
    };

    await vocabularyManager.addWord(word);
  }

  private async processUpdate(data: any): Promise<void> {
    if (!data.id) {
      throw new Error("Update operation requires an ID");
    }

    await vocabularyManager.updateWord(data.id, {
      english: data.english,
      french: data.french,
      italian: data.italian,
      category: data.category,
      imagePrompt: data.imagePrompt,
      regenerateImage: data.regenerateImage,
      regenerateAudio: data.regenerateAudio,
    });
  }

  private async processDelete(data: any): Promise<void> {
    if (!data.id) {
      throw new Error("Delete operation requires an ID");
    }

    await vocabularyManager.deleteWord(data.id);
  }

  private async loadProgress(): Promise<BatchProgress | null> {
    try {
      const content = await fs.readFile(this.progressFile, "utf-8");
      return JSON.parse(content);
    } catch {
      return null;
    }
  }

  private async saveProgress(progress: BatchProgress): Promise<void> {
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

  async generateBatchTemplate(outputPath: string): Promise<void> {
    const template: BatchOperation[] = [
      {
        type: "add",
        data: {
          english: "example",
          french: "exemple",
          italian: "esempio",
          category: "objects",
          imagePrompt: "example object illustration for children",
        },
      },
      {
        type: "update",
        data: {
          id: "obj_1",
          english: "updated text",
          regenerateAudio: true,
        },
      },
      {
        type: "delete",
        data: {
          id: "obj_2",
        },
      },
    ];

    await fs.writeFile(outputPath, JSON.stringify(template, null, 2));
    console.log(formatSuccess(`Batch template saved to: ${outputPath}`));
  }

  async importCSV(csvPath: string): Promise<void> {
    const content = await fs.readFile(csvPath, "utf-8");
    const lines = content.split("\n").filter(line => line.trim());
    
    if (lines.length < 2) {
      throw new Error("CSV file must have a header row and at least one data row");
    }

    const header = lines[0].split(",").map(h => h.trim());
    const operations: BatchOperation[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map(v => v.trim());
      const data: any = {};

      header.forEach((key, index) => {
        if (values[index]) {
          data[key] = values[index];
        }
      });

      if (data.english && data.french && data.italian && data.category) {
        operations.push({
          type: "add",
          data,
        });
      }
    }

    console.log(formatInfo(`Importing ${operations.length} words from CSV`));

    for (let i = 0; i < operations.length; i++) {
      const operation = operations[i];
      console.log(formatInfo(`[${i + 1}/${operations.length}] Adding ${operation.data.english}`));

      try {
        await this.processOperation(operation);
        console.log(formatSuccess(`Added ${operation.data.english}`));
      } catch (error) {
        console.error(formatError(`Failed to add ${operation.data.english}: ${error.message}`));
      }

      // Rate limiting
      if (i < operations.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    console.log(formatSuccess("CSV import complete"));
  }
}

export const batchVocabulary = new BatchVocabulary();