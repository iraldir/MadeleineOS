#!/usr/bin/env node
/**
 * Generate four independent sentence illustrations per Nano Banana request.
 * Each quadrant becomes one 768×512 reward image; no sheet is used in the app.
 * Resume safely: existing sentence files are skipped. Review the saved outputs.
 * Usage: pnpm sentences:images:batch [--only id,id,id,id] [--force]
 */
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as os from 'node:os';
import sharp from 'sharp';
import { ALL_SENTENCES, type ReadingSentence } from '../app/games/reading-sentences/sentences';
import { generateImageWithRetry } from './utils/vertex-image';

const positions = ['TOP LEFT', 'TOP RIGHT', 'BOTTOM LEFT', 'BOTTOM RIGHT'];
const output = path.join(process.cwd(), 'public/images/sentences');

async function main() {
  const args = process.argv.slice(2);
  const onlyIndex = args.indexOf('--only');
  const selectedIds = onlyIndex >= 0 ? args[onlyIndex + 1]?.split(',') : undefined;
  if (onlyIndex >= 0 && (!selectedIds?.length || selectedIds.some(id => !ALL_SENTENCES.some(s => s.id === id)))) {
    throw new Error('--only needs comma-separated active sentence IDs');
  }
  const selected = selectedIds ? selectedIds.map(id => ALL_SENTENCES.find(s => s.id === id)!) : ALL_SENTENCES;
  const pending: ReadingSentence[] = [];
  for (const sentence of selected) {
    if (args.includes('--force')) { pending.push(sentence); continue; }
    try { await fs.access(path.join(output, `${sentence.id}.webp`)); }
    catch { pending.push(sentence); }
  }
  const staging = await fs.mkdtemp(path.join(os.tmpdir(), 'sentence-sheets-'));
  const groups = Array.from({ length: Math.ceil(pending.length / 4) }, (_, i) => pending.slice(i * 4, i * 4 + 4));
  console.log(`${pending.length} missing illustrations in ${groups.length} sheets. Staging: ${staging}`);
  let next = 0;
  let saved = 0;
  const failures: string[] = [];
  async function worker() {
    while (next < groups.length) {
      const index = next++;
      const sentences = groups[index];
      const sheet = path.join(staging, `${index}.webp`);
      const prompt =
        'Create ONE landscape illustration sheet, aspect ratio 3:2, divided into an EXACT 2 by 2 grid of FOUR independent rectangular 3:2 landscape scenes of equal size. ' +
        'No gutters, no borders, no labels, no text. The dividing lines are precisely halfway across and halfway down the canvas. ' +
        'Each quadrant is a complete miniature storybook picture, with generous clear margins around its subjects. ' +
        'Keep heads and main objects fully inside their own quadrant. No scene or object may cross into another quadrant. ' +
        'Each quadrant will be cropped into a separate game reward image.\n' +
        positions.map((position, i) => `${position}: ${sentences[i]?.imagePrompt ?? 'Plain warm cream background, empty.'}`).join('\n\n') + '\nOnly artwork. Do not reproduce any sentence as text. Absolutely no captions, headings, labels or typography in any quadrant.';
      const ok = await generateImageWithRetry({
        prompt, outputPath: sheet, model: 'gemini-nano-banana-2.1', location: 'global',
        aspectRatio: '3:2', width: 1536, height: 1024, fit: 'contain', quality: 95,
      }, 10, (attempt, message) => console.log(`Sheet ${index + 1} attempt ${attempt}: ${message.slice(0, 80)}`));
      if (!ok) {
        failures.push(...sentences.map(s => s.id));
        continue;
      }
      for (let i = 0; i < sentences.length; i++) {
        const filename = path.join(output, `${sentences[i].id}.webp`);
        const tempFile = path.join(staging, `${sentences[i].id}.webp`);
        await sharp(sheet).extract({ left: (i % 2) * 768, top: Math.floor(i / 2) * 512, width: 768, height: 512 })
          .webp({ quality: 88, effort: 4 }).toFile(tempFile);
        await fs.copyFile(tempFile, filename);
        saved++;
      }
      console.log(`SAVED ${saved}/${pending.length}: ${sentences.map(s => s.id).join(', ')}`);
    }
  }
  await Promise.all([worker(), worker()]);
  console.log(`Finished: ${saved} saved, ${failures.length} missing${failures.length ? ': ' + failures.join(', ') : ''}`);
  if (failures.length) process.exitCode = 1;
}
main().catch(error => { console.error(error instanceof Error ? error.message : 'Generation failed'); process.exitCode = 1; });
