/**
 * Draw whatever is still missing, patiently.
 *
 * The quota refills a request or two at a time, so the ordinary batch scripts
 * lose: they fire five retries for the first item and the burst is spent before
 * anything else is tried. This one makes a single request, waits, and moves on,
 * so every missing item gets an equal turn.
 */
import * as fs from "node:fs";
import { generateImage, LOCATIONS } from "./utils/vertex-image";
import { SENTENCES } from "../app/games/reading-sentences/sentences";
import { EASY, MEDIUM, HARD, imageFilename } from "../app/games/phonics/words";

const GAP_MS = 45_000;

interface Job { label: string; prompt: string; out: string; w: number; h: number }

function jobs(): Job[] {
  const list: Job[] = [];
  for (const s of SENTENCES) {
    const out = `public/images/sentences/${s.id}.webp`;
    if (!fs.existsSync(out)) list.push({ label: s.id, prompt: s.imagePrompt, out, w: 1024, h: 640 });
  }
  for (const w of [...EASY, ...MEDIUM, ...HARD]) {
    const out = `public/images/phonics/${imageFilename(w)}`;
    if (!fs.existsSync(out)) list.push({ label: w.word, prompt: w.imagePrompt, out, w: 512, h: 512 });
  }
  return list;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main() {
  let round = 0;
  // Rotate the starting region so one exhausted location cannot stall everything.
  while (jobs().length > 0 && round < 200) {
    const pending = jobs();
    console.log(`round ${++round}: ${pending.length} still missing`);
    for (const [i, job] of pending.entries()) {
      const location = LOCATIONS[(round + i) % LOCATIONS.length];
      try {
        await generateImage({
          prompt: job.prompt, outputPath: job.out,
          width: job.w, height: job.h, fit: "cover", location,
        });
        console.log(`  drew ${job.label} (${location})`);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.log(`  ${job.label} (${location}): ${message.replace(/\s+/g, " ").slice(0, 90)}`);
      }
      await sleep(GAP_MS);
    }
  }
  console.log(jobs().length === 0 ? "ALL DRAWN" : `still missing: ${jobs().map(j => j.label).join(", ")}`);
}
main();
