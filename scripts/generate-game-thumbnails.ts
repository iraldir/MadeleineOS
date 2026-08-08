#!/usr/bin/env node
/**
 * Generates home-screen cards for games that want a painted one
 * (public/images/games/<id>.webp).
 *
 * Unlike the planet illustrations these are full-bleed square paintings — they
 * sit in a rounded card on the home screen, so they keep their own background.
 *
 * Usage: npm run games:thumbnails [-- --only <id>]
 */
import * as fs from "node:fs/promises";
import * as path from "node:path";
import sharp from "sharp";
import dotenv from "dotenv";
import { exec } from "child_process";
import { promisify } from "util";
import { CONFIG, formatSuccess, formatError, formatInfo } from "./config";

dotenv.config();

const execAsync = promisify(exec);
const OUTPUT_DIR = path.join(__dirname, "../public/images/games");

const STYLE =
  "Hand-painted children's picture-book illustration, soft gouache and " +
  "watercolour texture, bright luminous colours against deep night-blue space, " +
  "warm glow, wondrous and inviting. No text, no letters, no numbers, no " +
  "labels, no people, no spacecraft. Square composition, filling the whole frame.";

/** Not every card is set in space — a card may bring its own style. */
const READING_STYLE =
  "Hand-painted children's picture-book illustration, soft gouache and " +
  "watercolour texture, warm sunny colours, cosy and inviting. No text, no " +
  "letters, no numbers, no labels. Square composition, filling the whole frame.";

const CARDS: Array<{ id: string; prompt: string; style?: string }> = [
  {
    id: "solar-system",
    prompt:
      "The whole solar system seen from above and slightly to the side: a " +
      "radiant golden Sun at the centre with the eight planets strung around " +
      "it along delicate glowing orbit lines — a striped amber giant, a " +
      "ringed golden world, a small blue Earth, a red one, a turquoise one and " +
      "a deep blue one — scattered stars behind them.",
  },
  {
    id: "planet-quiz",
    prompt:
      "Three beautiful painted planets floating side by side in starry space — " +
      "a blue and green one, a striped amber giant and a ringed golden world — " +
      "each glowing softly, as if waiting to be named, with a scattering of " +
      "little sparkles between them.",
  },
  {
    id: "reading-sentences",
    style: READING_STYLE,
    prompt:
      "A young girl sitting cross-legged with a big open picture book on her " +
      "lap, reading out loud with a delighted face — and rising out of the " +
      "pages, a little green dragon, a rocket and a butterfly floating up as " +
      "if the sentences were coming true around her.",
  },
];

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

async function generateCard(
  prompt: string,
  outputPath: string,
  style: string = STYLE
): Promise<void> {
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
      contents: [{ role: "user", parts: [{ text: `${prompt} ${style}` }] }],
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
      await sharp(Buffer.from(part.inlineData.data, "base64"))
        .resize(512, 512, { fit: "cover" })
        .webp({ quality: 90, effort: 4 })
        .toFile(outputPath);
      return;
    }
  }
  throw new Error("No image data in response");
}

async function main() {
  const args = process.argv.slice(2);
  const onlyIndex = args.indexOf("--only");
  const only = onlyIndex >= 0 ? args[onlyIndex + 1] : null;

  try {
    await getAuth();
  } catch {
    console.error(formatError("gcloud auth unavailable — run: gcloud auth login"));
    process.exit(1);
  }
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  const targets = only ? CARDS.filter((c) => c.id === only) : CARDS;
  for (let i = 0; i < targets.length; i++) {
    const card = targets[i];
    const outputPath = path.join(OUTPUT_DIR, `${card.id}.webp`);
    const label = `[${i + 1}/${targets.length}] ${card.id}`;

    let success = false;
    for (let attempt = 1; attempt <= 8 && !success; attempt++) {
      try {
        await generateCard(card.prompt, outputPath, card.style);
        console.log(formatSuccess(label));
        success = true;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(formatError(`${label} attempt ${attempt}: ${message.slice(0, 140)}`));
        await new Promise((r) => setTimeout(r, message.includes("429") ? 60000 : 5000 * attempt));
      }
    }
    if (!success) console.error(formatError(`${label} gave up`));
    if (i < targets.length - 1) await new Promise((r) => setTimeout(r, 15000));
  }
  console.log(formatInfo("Done"));
}

main();
