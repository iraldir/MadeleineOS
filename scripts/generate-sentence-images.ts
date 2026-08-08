#!/usr/bin/env node
/**
 * Generates the reward illustrations for the sentence reading game
 * (public/images/sentences/<id>.webp).
 *
 * One landscape storybook painting per sentence. Resumable: a sentence whose
 * file already exists is skipped, so it is safe to stop this and re-run it —
 * which matters, because the Vertex quota is roughly ten images a minute and a
 * full pass takes a while.
 *
 * Usage: pnpm sentences:images [-- --only <id>] [-- --limit <n>] [-- --force]
 */
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { formatSuccess, formatError, formatInfo } from "./config";
import { generateImageWithRetry, getVertexAuth } from "./utils/vertex-image";
import {
  ALL_SENTENCES,
  type ReadingSentence,
} from "../app/games/reading-sentences/sentences";

const OUTPUT_DIR = path.join(__dirname, "../public/images/sentences");

/** Landscape — these are scenes, not single objects. */
const WIDTH = 768;
const HEIGHT = 512;

/** Milliseconds between requests; the model allows roughly ten a minute. */
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
    ? ALL_SENTENCES.filter((s) => s.id === only)
    : ALL_SENTENCES;

  const todo: ReadingSentence[] = [];
  for (const sentence of pool) {
    if (!force && (await exists(path.join(OUTPUT_DIR, `${sentence.id}.webp`)))) {
      continue;
    }
    todo.push(sentence);
    if (todo.length >= limit) break;
  }

  console.log(
    formatInfo(`${pool.length} sentences, ${todo.length} still need a picture`)
  );

  let generated = 0;
  const failures: string[] = [];

  for (let i = 0; i < todo.length; i++) {
    const sentence = todo[i];
    const outputPath = path.join(OUTPUT_DIR, `${sentence.id}.webp`);
    const label = `[${i + 1}/${todo.length}] ${sentence.id}`;

    const ok = await generateImageWithRetry(
      {
        prompt: sentence.imagePrompt,
        outputPath,
        width: WIDTH,
        height: HEIGHT,
        quality: 88,
      },
      5,
      (attempt, message) =>
        console.error(
          formatError(`${label} attempt ${attempt}: ${message.slice(0, 140)}`)
        )
    );

    if (ok) {
      generated++;
      console.log(formatSuccess(`${label} — "${sentence.text}"`));
    } else {
      failures.push(sentence.id);
      console.error(formatError(`${label} gave up`));
    }

    if (i < todo.length - 1) await new Promise((r) => setTimeout(r, SPACING_MS));
  }

  console.log(
    formatInfo(
      `Done. Generated ${generated}, failed ${failures.length}` +
        (failures.length ? `: ${failures.join(", ")}` : "")
    )
  );
  if (failures.length > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
