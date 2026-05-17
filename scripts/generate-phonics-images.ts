import * as fs from "node:fs/promises";
import * as path from "node:path";
import dotenv from "dotenv";
import { mediaGenerator } from "./utils/media-generator";
import { CONFIG } from "./config";
import { ALL_WORDS, type PhonicsWord } from "../app/games/phonics/words";

dotenv.config();

const OUTPUT_DIR = path.join(__dirname, "../public/images/phonics");
const THUMB_PATH = path.join(__dirname, "../public/images/games/phonics.webp");
const { delayMs, batchSize, batchDelayMs } = CONFIG.rateLimit.imageGeneration;

async function exists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function generateOne(
  word: PhonicsWord
): Promise<"generated" | "skipped" | "failed"> {
  const filename = `${word.word.toLowerCase()}.webp`;
  const outputPath = path.join(OUTPUT_DIR, filename);

  if (await exists(outputPath)) {
    console.log(`✓ Skip ${filename} (already exists)`);
    return "skipped";
  }

  try {
    console.log(`🎨 Generating ${filename} — "${word.imagePrompt}"`);
    await mediaGenerator.generateImage({
      prompt: word.imagePrompt,
      outputPath,
      width: 512,
      height: 512,
      quality: 88,
    });
    console.log(`   ✅ Saved ${filename}`);
    return "generated";
  } catch (err) {
    console.error(`   ❌ Failed ${filename}:`, err instanceof Error ? err.message : err);
    return "failed";
  }
}

async function main() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  let generated = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < ALL_WORDS.length; i++) {
    const word = ALL_WORDS[i];
    const result = await generateOne(word);
    if (result === "generated") generated++;
    else if (result === "skipped") skipped++;
    else failed++;

    const isLastInBatch =
      (i + 1) % batchSize === 0 && i + 1 < ALL_WORDS.length;
    const isLast = i + 1 === ALL_WORDS.length;

    if (result === "generated" && !isLast) {
      if (isLastInBatch) {
        console.log(`⏸  Batch break — waiting ${batchDelayMs}ms`);
        await new Promise((r) => setTimeout(r, batchDelayMs));
      } else {
        await new Promise((r) => setTimeout(r, delayMs));
      }
    }
  }

  if (!(await exists(THUMB_PATH))) {
    const catPath = path.join(OUTPUT_DIR, "cat.webp");
    if (await exists(catPath)) {
      await fs.copyFile(catPath, THUMB_PATH);
      console.log(`🏠 Copied cat.webp → phonics.webp (home thumbnail)`);
    } else {
      console.warn(`⚠️  Could not create thumbnail — cat.webp missing`);
    }
  } else {
    console.log(`✓ Thumbnail already exists at ${THUMB_PATH}`);
  }

  console.log(
    `\nDone. Generated: ${generated}, Skipped: ${skipped}, Failed: ${failed}`
  );
  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
