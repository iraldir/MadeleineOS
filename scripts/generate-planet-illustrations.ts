#!/usr/bin/env node
/**
 * Generates the illustrated planet cards used by the solar system tour
 * (public/images/planets/<id>.webp).
 *
 * These are drawings, not photographs — the 3D scene already shows the real
 * thing, so the cards are there to be inviting and easy to tell apart.
 * Generated on solid magenta and chroma-keyed to transparency so they sit on
 * the starfield. Already-generated files are skipped, so this is resumable.
 *
 * Usage: npm run planets:illustrate [-- --only <id>] [-- --force] [-- --best-of <n>]
 *
 * With --best-of, several drawings are made and the one whose average colour
 * is closest to the planet's 3D texture wins.
 */
import * as fs from "node:fs/promises";
import * as path from "node:path";
import sharp from "sharp";
import dotenv from "dotenv";
import { exec } from "child_process";
import { promisify } from "util";
import { ALL_BODIES } from "../types/planets";
import { CONFIG, formatSuccess, formatError, formatInfo } from "./config";

dotenv.config();

const execAsync = promisify(exec);
const OUTPUT_DIR = path.join(__dirname, "../public/images/planets");
const KEY_COLOR_HINT = "#FF00FF";

/** Optional colour correction per planet, applied after the background is cut. */
const TWEAKS: Record<string, { brightness: number; saturation: number }> = {};

/** What makes each world itself, in the words a picture book would use. */
const SUBJECTS: Record<string, string> = {
  sun:
    "the Sun as a brilliant ball of blazing yellow and orange fire, a dazzling white-gold heart fading to warm tangerine at the rim, molten currents rippling across it and soft flames licking outwards, radiant and joyful — bright yellow all over, never brown or dark",
  mercury:
    "the planet Mercury, a small pale dove-grey and silver rocky world softly dusted with craters, brightly sunlit so the whole globe glows warm grey — not brown, not rusty",
  venus:
    "the planet Venus, a luminous pale gold and cream world wrapped in bright peach and butterscotch clouds swirling in soft spirals, glowing evenly bright across the whole globe right out to the edges",
  earth:
    "the planet Earth, deep blue oceans with green and sandy continents, soft white swirls of cloud, a thin glowing blue halo of air around the edge",
  mars:
    "the planet Mars, a bright rust-red and orange desert world with pale apricot dunes, a few slim darker canyon lines and a gleaming white polar cap, warm and vivid",
  jupiter:
    "the planet Jupiter, an enormous world banded in bright cream, apricot, butterscotch and warm tan cloud stripes, luminous and softly glowing, with one great swirling red storm",
  saturn:
    "the planet Saturn, a pale golden banded world, encircled by one single wide flat elegant ring system lying in a single plane around its equator",
  uranus:
    "the planet Uranus, a smooth pale turquoise ice world, tipped right over on its side, with a faint thin ring",
  neptune:
    "the planet Neptune, a bright azure and cobalt blue globe with soft white wind-blown cloud streaks and one darker blue oval storm, luminous and clear — only blues and whites, no pink and no red",
};

const illustrationPrompt = (subject: string) =>
  `A children's picture-book illustration of ${subject}. ` +
  `Hand-painted storybook style with soft gouache and watercolour texture, ` +
  `bright luminous colours and a warm glow — beautiful and wondrous, cheerful ` +
  `rather than gloomy, not a photograph and not a cartoon with faces. The whole ` +
  `globe is brightly and evenly lit all the way to its edges, like a painted ` +
  `ball under a soft lamp — no dark rim, no shadow crescent, no black ` +
  `vignette, no gloomy corners. Bold simple shape, ` +
  `centered, filling most of the frame, seen as a whole round world. ` +
  `No text, no letters, no labels, no stars, no spacecraft, no people. ` +
  `The background is a completely solid, uniform, flat magenta colour ` +
  `(${KEY_COLOR_HINT}) with no shadows, no gradients and no texture.`;

/**
 * Turns the (sampled) background colour transparent, then crops to the artwork.
 * The key colour is sampled from the corners because the model rarely lands on
 * the exact hex it was asked for.
 */
async function chromaKeyToWebp(
  input: Buffer,
  outputPath: string,
  tweak?: { brightness: number; saturation: number }
): Promise<void> {
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const px = (x: number, y: number) => (y * width + x) * channels;
  const corners: Array<[number, number]> = [
    [2, 2],
    [width - 3, 2],
    [2, height - 3],
    [width - 3, height - 3],
  ];
  const key = [0, 1, 2].map(
    (c) =>
      corners.reduce((sum, [x, y]) => sum + data[px(x, y) + c], 0) /
      corners.length
  );
  const distanceToKey = (i: number) =>
    Math.sqrt(
      (data[i] - key[0]) ** 2 +
        (data[i + 1] - key[1]) ** 2 +
        (data[i + 2] - key[2]) ** 2
    );

  // The corners have to agree, or there is no flat background to remove.
  for (const [x, y] of corners) {
    if (distanceToKey(px(x, y)) > 60) {
      throw new Error("Background is not a flat, uniform colour");
    }
  }

  /**
   * Flood fill inwards from the corners rather than keying the whole image on
   * colour. A global key eats any part of the planet that happens to sit near
   * the background colour — which is what quietly hollowed out Mars, whose
   * reds are a short hop from magenta. The background is one connected region,
   * so filling it can only ever remove background.
   */
  // Kept deliberately tight: with a looser tolerance the fill creeps across
  // the anti-aliased rim and on into a planet whose colours are near the key.
  const FILL = 55; // how far a pixel may stray from the key and still be background
  const RAMP_END = 150; // pixels nearer than this soften the cut edge
  const background = new Uint8Array(width * height);
  const stack: number[] = [];
  for (const [x, y] of corners) stack.push(y * width + x);

  while (stack.length) {
    const cell = stack.pop()!;
    if (background[cell]) continue;
    const x = cell % width;
    const y = (cell - x) / width;
    if (distanceToKey(cell * channels) > FILL) continue;
    background[cell] = 1;
    if (x > 0) stack.push(cell - 1);
    if (x < width - 1) stack.push(cell + 1);
    if (y > 0) stack.push(cell - width);
    if (y < height - 1) stack.push(cell + width);
  }

  let minX = width, minY = height, maxX = 0, maxY = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const cell = y * width + x;
      const i = cell * channels;
      if (background[cell]) {
        data[i + 3] = 0;
        continue;
      }
      // Soften where the artwork meets the fill, so the edge is not a staircase
      const touchesBackground =
        (x > 0 && background[cell - 1]) ||
        (x < width - 1 && background[cell + 1]) ||
        (y > 0 && background[cell - width]) ||
        (y < height - 1 && background[cell + width]);
      if (touchesBackground) {
        const distance = distanceToKey(i);
        if (distance < RAMP_END) {
          data[i + 3] = Math.round(
            (255 * Math.max(distance - FILL, 0)) / (RAMP_END - FILL)
          );
        }
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
    throw new Error("Nothing left after removing the background");
  }

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
    .modulate(tweak ?? {})
    .webp({ quality: 92, effort: 4 })
    .toFile(outputPath);
}

/**
 * Average colour of an image, ignoring transparent pixels. Used to check a
 * drawing against the real thing.
 */
async function meanColour(file: string): Promise<[number, number, number]> {
  const { data, info } = await sharp(file)
    .resize(64, 64, { fit: "fill" })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const totals = [0, 0, 0];
  let counted = 0;
  for (let i = 0; i < data.length; i += info.channels) {
    if (data[i + 3] < 200) continue;
    totals[0] += data[i];
    totals[1] += data[i + 1];
    totals[2] += data[i + 2];
    counted++;
  }
  if (!counted) return [0, 0, 0];
  return [totals[0] / counted, totals[1] / counted, totals[2] / counted];
}

/**
 * How far a candidate drawing sits from the planet's real colours. Compared
 * against the 3D globe's own texture so the card and the scene agree.
 */
async function colourDistance(candidate: string, planetId: string): Promise<number> {
  const texture = path.join(
    __dirname,
    `../public/textures/planets/${planetId}.webp`
  );
  try {
    const [a, b] = await Promise.all([meanColour(candidate), meanColour(texture)]);
    return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
  } catch {
    return 0; // no texture to compare against — every candidate is equal
  }
}

/**
 * Calls gemini-2.5-flash-image through Vertex AI with the user's gcloud
 * credentials — the project's GEMINI_KEY API-key path is defunct.
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

async function generateIllustration(
  subject: string,
  outputPath: string,
  tweak?: { brightness: number; saturation: number }
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
      contents: [{ role: "user", parts: [{ text: illustrationPrompt(subject) }] }],
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
      await chromaKeyToWebp(
        Buffer.from(part.inlineData.data, "base64"),
        outputPath,
        tweak
      );
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
  const bestOfIndex = args.indexOf("--best-of");
  const bestOf = bestOfIndex >= 0 ? Number(args[bestOfIndex + 1]) || 1 : 1;

  try {
    await getAuth();
  } catch {
    console.error(formatError("gcloud auth unavailable — run: gcloud auth login"));
    process.exit(1);
  }
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  const targets = only ? ALL_BODIES.filter((b) => b.id === only) : ALL_BODIES;
  // Vertex quota for this model is tight (~10 req/min burst before 429s)
  const delayMs = 15000;

  let generated = 0;
  let failed = 0;

  for (let i = 0; i < targets.length; i++) {
    const body = targets[i];
    const outputPath = path.join(OUTPUT_DIR, `${body.id}.webp`);
    const label = `[${i + 1}/${targets.length}] ${body.id}`;

    if (!force) {
      try {
        await fs.access(outputPath);
        console.log(formatInfo(`${label} exists, skipping`));
        continue;
      } catch {
        // doesn't exist — generate it
      }
    }

    // Retry around each drawing rather than around the whole batch, so a
    // quota blip never throws away candidates that already came out well.
    const drawOnce = async (destination: string): Promise<boolean> => {
      for (let attempt = 1; attempt <= 8; attempt++) {
        try {
          await generateIllustration(SUBJECTS[body.id], destination, TWEAKS[body.id]);
          return true;
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          console.error(formatError(`${label} attempt ${attempt}: ${message.slice(0, 140)}`));
          await new Promise((r) =>
            setTimeout(r, message.includes("429") ? 60000 : 5000 * attempt)
          );
        }
      }
      return false;
    };

    let success = false;
    if (bestOf > 1) {
      // Draw several and keep whichever sits closest to the colours of the 3D
      // globe — the model's taste wanders between runs.
      const scored: Array<{ file: string; distance: number }> = [];
      for (let n = 0; n < bestOf; n++) {
        const candidate = `${outputPath}.candidate-${n}.webp`;
        if (await drawOnce(candidate)) {
          const distance = await colourDistance(candidate, body.id);
          console.log(
            formatInfo(`${label} candidate ${n + 1}: Δcolour ${distance.toFixed(1)}`)
          );
          scored.push({ file: candidate, distance });
        }
        if (n < bestOf - 1) await new Promise((r) => setTimeout(r, delayMs));
      }
      if (scored.length) {
        scored.sort((a, b) => a.distance - b.distance);
        await fs.rename(scored[0].file, outputPath);
        await Promise.all(scored.slice(1).map((c) => fs.unlink(c.file)));
        success = true;
      }
    } else {
      success = await drawOnce(outputPath);
    }

    if (success) {
      console.log(formatSuccess(label));
      generated++;
    }
    if (!success) failed++;

    if (i < targets.length - 1) await new Promise((r) => setTimeout(r, delayMs));
  }

  console.log(formatInfo(`Done — ${generated} generated, ${failed} failed`));
}

main();
