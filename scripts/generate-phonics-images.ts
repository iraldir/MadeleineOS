#!/usr/bin/env node
/**
 * Generates the reward pictures for the phonics reading game
 * (public/images/phonics/<word>.webp).
 *
 * Resumable: a word whose file already exists is skipped, so it is safe to
 * re-run after adding words, or after the Vertex quota cuts a run short.
 *
 * Usage: pnpm phonics:images [-- --only <word>] [-- --limit <n>] [-- --force]
 */
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { formatSuccess, formatError, formatInfo, formatWarning } from "./config";
import { generateImageWithRetry, getVertexAuth } from "./utils/vertex-image";
import { ALL_WORDS, type PhonicsWord } from "../app/games/phonics/words";

const OUTPUT_DIR = path.join(__dirname, "../public/images/phonics");
const THUMB_PATH = path.join(__dirname, "../public/images/games/phonics.webp");

/** Milliseconds between requests; tuned against the model's per-minute quota. */
const SPACING_MS = 2500;

async function exists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const arg = (name: string): string | null => {
    const i = args.indexOf(name);
    return i >= 0 ? args[i + 1] : null;
  };
  const only = arg("--only");
  const limitArg = arg("--limit");
  const limit = limitArg ? parseInt(limitArg, 10) : Infinity;
  const force = args.includes("--force");

  try {
    await getVertexAuth();
  } catch {
    console.error(formatError("gcloud auth unavailable — run: gcloud auth login"));
    process.exit(1);
  }

  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  const pool = only
    ? ALL_WORDS.filter((w) => w.word.toLowerCase() === only.toLowerCase())
    : ALL_WORDS;

  const todo: PhonicsWord[] = [];
  for (const word of pool) {
    const outputPath = path.join(OUTPUT_DIR, `${word.word.toLowerCase()}.webp`);
    if (!force && (await exists(outputPath))) continue;
    todo.push(word);
    if (todo.length >= limit) break;
  }

  console.log(
    formatInfo(`${pool.length} words, ${todo.length} still need a picture`)
  );

  let generated = 0;
  const failures: string[] = [];

  for (let i = 0; i < todo.length; i++) {
    const word = todo[i];
    const filename = `${word.word.toLowerCase()}.webp`;
    const outputPath = path.join(OUTPUT_DIR, filename);
    const label = `[${i + 1}/${todo.length}] ${word.word}`;

    const ok = await generateImageWithRetry(
      { prompt: word.imagePrompt, outputPath, width: 512, height: 512, quality: 88 },
      5,
      (attempt, message) =>
        console.error(formatError(`${label} attempt ${attempt}: ${message.slice(0, 140)}`))
    );

    if (ok) {
      generated++;
      console.log(formatSuccess(label));
    } else {
      failures.push(word.word);
      console.error(formatError(`${label} gave up`));
    }

    if (i < todo.length - 1) await new Promise((r) => setTimeout(r, SPACING_MS));
  }

  if (!(await exists(THUMB_PATH))) {
    const catPath = path.join(OUTPUT_DIR, "cat.webp");
    if (await exists(catPath)) {
      await fs.copyFile(catPath, THUMB_PATH);
      console.log(formatInfo("Copied cat.webp → phonics.webp (home thumbnail)"));
    } else {
      console.warn(formatWarning("Could not create thumbnail — cat.webp missing"));
    }
  }

  console.log(
    formatInfo(`Done. Generated ${generated}, failed ${failures.length}` +
      (failures.length ? `: ${failures.join(", ")}` : ""))
  );
  if (failures.length > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
