#!/usr/bin/env node
/**
 * Generates the sticker collection artwork (public/images/stickers/<id>.webp).
 *
 * Each sticker is generated on a solid magenta background, which is then
 * chroma-keyed to transparency so the app can render silhouettes with CSS
 * filters. Already-generated stickers are skipped, so the script is resumable.
 *
 * Usage: npm run stickers:generate [-- --only <id>] [-- --force]
 */
import * as fs from "node:fs/promises";
import * as path from "node:path";
import sharp from "sharp";
import dotenv from "dotenv";
import { exec } from "child_process";
import { promisify } from "util";
import { stickers } from "../types/stickers";
import { CONFIG, formatSuccess, formatError, formatInfo } from "./config";

dotenv.config();

const execAsync = promisify(exec);

const OUTPUT_DIR = path.join(__dirname, "../public/images/stickers");
const KEY_COLOR_HINT = "#FF00FF"; // asked of the model; actual key color is sampled

const stickerPrompt = (subject: string) =>
  `A single kawaii die-cut sticker of ${subject}. Cute chibi cartoon style ` +
  `with big sparkly eyes, thick clean outlines, flat bright pastel colors, and a ` +
  `thick white sticker border around the whole shape. The sticker is centered ` +
  `and fills most of the frame. The background is a completely solid, uniform, ` +
  `flat magenta color (${KEY_COLOR_HINT}) with absolutely no shadows, no ` +
  `gradients, no texture and no other elements.`;

/**
 * Turns the (sampled) background color transparent. The key color is sampled
 * from the image corners rather than assumed, since the model rarely hits the
 * exact hex. Pixels near the key color fade out over a tolerance ramp so the
 * sticker edge stays smooth.
 */
async function chromaKeyToWebp(input: Buffer, outputPath: string): Promise<void> {
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const px = (x: number, y: number) => (y * width + x) * channels;

  // Average the four corners to find the actual background color
  const corners = [
    px(2, 2),
    px(width - 3, 2),
    px(2, height - 3),
    px(width - 3, height - 3),
  ];
  const key = [0, 1, 2].map(
    (c) => corners.reduce((sum, i) => sum + data[i + c], 0) / corners.length
  );

  const FULL_KEY = 70; // distance below which a pixel is fully transparent
  const RAMP_END = 140; // distance above which a pixel is fully opaque

  let minX = width, minY = height, maxX = 0, maxY = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = px(x, y);
      const dr = data[i] - key[0];
      const dg = data[i + 1] - key[1];
      const db = data[i + 2] - key[2];
      const dist = Math.sqrt(dr * dr + dg * dg + db * db);

      if (dist < FULL_KEY) {
        data[i + 3] = 0;
      } else if (dist < RAMP_END) {
        data[i + 3] = Math.round(
          (255 * (dist - FULL_KEY)) / (RAMP_END - FULL_KEY)
        );
      }

      if (data[i + 3] > 20) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (minX >= maxX || minY >= maxY) {
    throw new Error("Chroma key removed the whole image — bad generation");
  }

  // Crop to the sticker with a small margin, then fit into a 512px square
  const margin = Math.round(Math.max(width, height) * 0.02);
  const left = Math.max(0, minX - margin);
  const top = Math.max(0, minY - margin);

  await sharp(data, { raw: { width, height, channels } })
    .extract({
      left,
      top,
      width: Math.min(width, maxX + margin) - left,
      height: Math.min(height, maxY + margin) - top,
    })
    .resize(512, 512, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .webp({ quality: 90, effort: 4 })
    .toFile(outputPath);
}

/**
 * Calls gemini-2.5-flash-image through Vertex AI, authenticated with the
 * user's gcloud credentials (same pattern as MediaGenerator.generateTTS —
 * the project's GEMINI_KEY API-key path is defunct).
 */
let cachedAuth: { token: string; project: string } | null = null;

async function getAuth(): Promise<{ token: string; project: string }> {
  if (!cachedAuth) {
    const { stdout: token } = await execAsync("gcloud auth print-access-token");
    let project = CONFIG.api.googleCloudProject;
    if (!project) {
      const { stdout } = await execAsync(
        "gcloud config list --format='value(core.project)'"
      );
      project = stdout.trim();
    }
    cachedAuth = { token: token.trim(), project };
  }
  return cachedAuth;
}

async function generateSticker(prompt: string, outputPath: string): Promise<void> {
  const { token, project } = await getAuth();
  const model = CONFIG.models.imageGeneration;
  const url =
    `https://aiplatform.googleapis.com/v1/projects/${project}/locations/global` +
    `/publishers/google/models/${model}:generateContent`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: stickerPrompt(prompt) }] }],
      generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
    }),
  });

  if (!response.ok) {
    throw new Error(`Vertex AI ${response.status}: ${(await response.text()).slice(0, 300)}`);
  }

  const result = await response.json();
  const parts = result.candidates?.[0]?.content?.parts ?? [];
  for (const part of parts) {
    if (part.inlineData?.data) {
      await chromaKeyToWebp(Buffer.from(part.inlineData.data, "base64"), outputPath);
      return;
    }
  }
  throw new Error("No image data in response");
}

async function main() {
  const args = process.argv.slice(2);
  const force = args.includes("--force");
  const onlyIndex = args.indexOf("--only");
  const only = onlyIndex >= 0 ? args[onlyIndex + 1] : null;

  try {
    await getAuth();
  } catch {
    console.error(formatError("gcloud auth unavailable — run: gcloud auth login"));
    process.exit(1);
  }
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  const targets = only ? stickers.filter((s) => s.id === only) : stickers;
  // Vertex AI quota for this model is tight (~10 req/min burst), so pace far
  // below the vocabulary-image defaults
  const delayMs = 15000;
  const batchSize = 5;
  const batchDelayMs = 60000;
  let generated = 0;
  let failed = 0;

  for (let i = 0; i < targets.length; i++) {
    const sticker = targets[i];
    const outputPath = path.join(OUTPUT_DIR, `${sticker.id}.webp`);

    if (!force) {
      try {
        await fs.access(outputPath);
        console.log(formatInfo(`[${i + 1}/${targets.length}] ${sticker.id} exists, skipping`));
        continue;
      } catch {
        // doesn't exist — generate it
      }
    }

    let success = false;
    for (let attempt = 1; attempt <= 8 && !success; attempt++) {
      try {
        await generateSticker(sticker.prompt, outputPath);
        console.log(formatSuccess(`[${i + 1}/${targets.length}] ${sticker.id}`));
        generated++;
        success = true;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(
          formatError(`[${i + 1}/${targets.length}] ${sticker.id} attempt ${attempt}: ${message.slice(0, 120)}`)
        );
        // Quota errors need a real cool-down, not a quick retry
        const backoff = message.includes("429") ? 60000 : 5000 * attempt;
        await new Promise((r) => setTimeout(r, backoff));
      }
    }
    if (!success) failed++;

    await new Promise((r) => setTimeout(r, delayMs));
    if ((i + 1) % batchSize === 0 && i + 1 < targets.length) {
      console.log(formatInfo(`Batch pause (${batchDelayMs / 1000}s)...`));
      await new Promise((r) => setTimeout(r, batchDelayMs));
    }
  }

  console.log(formatInfo(`Done. Generated ${generated}, failed ${failed}, total ${targets.length}.`));
  process.exit(failed > 0 ? 1 : 0);
}

main();
