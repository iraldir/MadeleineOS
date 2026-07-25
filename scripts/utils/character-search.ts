/**
 * Character image sourcing pipeline.
 *
 * search  – query DuckDuckGo Images (full-res URLs + dimensions, no scraping
 *           fights), save numbered candidate thumbnails plus a contact sheet
 *           (sheet.html + sheet.png) for visual review.
 * pick    – download the chosen candidates at full resolution and process them
 *           into the game's formats (1024x512 portrait, 2480x3508 A4 coloring page),
 *           staged under .character-search/<slug>/selected/ with a preview sheet.
 * install – copy staged images into public/images and register the character
 *           in types/characters.ts.
 */

import { chromium, Browser, Page } from "playwright-core";
import sharp from "sharp";
import axios from "axios";
import * as fs from "node:fs/promises";
import * as path from "node:path";

const STAGING_ROOT = path.join(process.cwd(), ".character-search");
const CHARACTERS_FILE = path.join(process.cwd(), "types", "characters.ts");
const PORTRAIT = { width: 1024, height: 512 };
const COLORING = { width: 2480, height: 3508 };
const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

export type SearchType = "thumbnail" | "coloring";

interface Candidate {
  index: number;
  thumbFile: string; // local numbered thumbnail file
  fullUrl: string; // full resolution URL
  width: number;
  height: number;
  title: string;
}

interface Manifest {
  slug: string;
  type: SearchType;
  query: string;
  candidates: Candidate[];
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function typeDir(slug: string, type: SearchType): string {
  return path.join(STAGING_ROOT, slug, type);
}

async function launchBrowser(): Promise<Browser> {
  return chromium.launch({ channel: "chrome", headless: true });
}

async function screenshotHtml(htmlPath: string, pngPath: string): Promise<void> {
  const browser = await launchBrowser();
  try {
    const page: Page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(`file://${htmlPath}`);
    await page.waitForTimeout(500);
    await page.screenshot({ path: pngPath, fullPage: true });
  } finally {
    await browser.close();
  }
}

interface DdgImage {
  title: string;
  image: string;
  thumbnail: string;
  width: number;
  height: number;
}

/** DuckDuckGo image search: fetch the vqd token, then the JSON results feed. */
async function ddgImageSearch(query: string, wanted: number): Promise<DdgImage[]> {
  const tokenPage = await axios.get("https://duckduckgo.com/", {
    params: { q: query, iax: "images", ia: "images" },
    headers: { "User-Agent": USER_AGENT },
  });
  const vqdMatch =
    tokenPage.data.match(/vqd=(["'])([^"']+)\1/) || tokenPage.data.match(/vqd=([0-9-]+)/);
  if (!vqdMatch) throw new Error("Could not obtain DuckDuckGo search token (vqd)");
  const vqd = vqdMatch[2] || vqdMatch[1];

  const results: DdgImage[] = [];
  let next = `i.js?l=en-gb&o=json&q=${encodeURIComponent(query)}&vqd=${vqd}&f=,,,&p=1`;
  while (results.length < wanted && next) {
    const response = await axios.get(`https://duckduckgo.com/${next}`, {
      headers: { "User-Agent": USER_AGENT, Referer: "https://duckduckgo.com/" },
      timeout: 20000,
    });
    results.push(...(response.data.results || []));
    next = response.data.next || null;
  }
  return results.slice(0, wanted);
}

export async function searchImages(
  name: string,
  type: SearchType,
  query: string,
  count: number
): Promise<{ dir: string; sheetPng: string; found: number }> {
  const slug = slugify(name);
  const dir = typeDir(slug, type);
  await fs.rm(dir, { recursive: true, force: true });
  await fs.mkdir(dir, { recursive: true });

  // Over-fetch so broken thumbnails can be skipped while still reaching `count`
  const images = await ddgImageSearch(query, count * 2);

  const candidates: Candidate[] = [];
  for (const image of images) {
    if (candidates.length >= count) break;
    const index = candidates.length + 1;
    try {
      const response = await axios.get(image.thumbnail, {
        responseType: "arraybuffer",
        timeout: 15000,
        headers: { "User-Agent": USER_AGENT },
      });
      const thumbFile = `thumb-${String(index).padStart(2, "0")}.jpg`;
      await sharp(Buffer.from(response.data)).jpeg({ quality: 85 }).toFile(path.join(dir, thumbFile));
      candidates.push({
        index,
        thumbFile,
        fullUrl: image.image,
        width: image.width,
        height: image.height,
        title: image.title || "",
      });
      console.log(`  [${index}] ${image.width}x${image.height} ${image.title.slice(0, 60)}`);
    } catch {
      // skip candidates whose thumbnail can't be fetched
    }
  }

  const manifest: Manifest = { slug, type, query, candidates };
  await fs.writeFile(path.join(dir, "manifest.json"), JSON.stringify(manifest, null, 2));

  const sheetPath = path.join(dir, "sheet.html");
  await fs.writeFile(sheetPath, buildContactSheet(name, type, query, candidates));
  const sheetPng = path.join(dir, "sheet.png");
  await screenshotHtml(sheetPath, sheetPng);

  return { dir, sheetPng, found: candidates.length };
}

function buildContactSheet(
  name: string,
  type: SearchType,
  query: string,
  candidates: Candidate[]
): string {
  const cells = candidates
    .map(
      (c) => `
      <div class="cell">
        <div class="num">${c.index}</div>
        <img src="${c.thumbFile}" alt="">
        <div class="meta">${c.width}×${c.height}</div>
      </div>`
    )
    .join("\n");
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
  body { font-family: sans-serif; margin: 16px; background: #fafafa; }
  h1 { font-size: 18px; } h2 { font-size: 13px; color: #666; font-weight: normal; }
  .grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; }
  .cell { position: relative; background: #fff; border: 1px solid #ddd; border-radius: 6px; overflow: hidden; }
  .cell img { width: 100%; height: 230px; object-fit: contain; display: block; background: #fff; }
  .num { position: absolute; top: 6px; left: 6px; background: #d32f2f; color: #fff;
         font-size: 20px; font-weight: bold; padding: 2px 10px; border-radius: 12px; z-index: 1; }
  .meta { font-size: 11px; color: #888; text-align: center; padding: 2px 0 4px; }
</style></head><body>
<h1>${name} — ${type} candidates</h1>
<h2>query: ${query}</h2>
<div class="grid">${cells}</div>
</body></html>`;
}

/** Download a candidate at full resolution, falling back to its thumbnail. */
async function fetchCandidate(dir: string, candidate: Candidate): Promise<Buffer> {
  try {
    const response = await axios.get(candidate.fullUrl, {
      responseType: "arraybuffer",
      timeout: 25000,
      headers: { "User-Agent": USER_AGENT },
      maxContentLength: 50 * 1024 * 1024,
    });
    const buffer = Buffer.from(response.data);
    await sharp(buffer).metadata(); // validate it decodes as an image
    return buffer;
  } catch (error) {
    console.log(
      `  ⚠ full-res download failed for #${candidate.index} (${error instanceof Error ? error.message : error}), falling back to thumbnail`
    );
    return fs.readFile(path.join(dir, candidate.thumbFile));
  }
}

/**
 * Convert to the 2:1 character portrait format. Default is a face-aware cover
 * crop; use contain for full-body-on-plain-background art (e.g. tall skinny
 * characters whose face a 2:1 crop would cut off).
 */
async function processPortrait(
  buffer: Buffer,
  outFile: string,
  fit: "cover" | "contain" = "cover",
  crop?: { left: number; top: number; width: number }
): Promise<void> {
  let image = sharp(buffer).flatten({ background: "#ffffff" });
  if (crop) {
    // Manual 2:1 window in source pixels, clamped to the image bounds
    const meta = await image.metadata();
    const width = Math.min(crop.width, meta.width!);
    const height = Math.round(width / 2);
    const left = Math.max(0, Math.min(crop.left, meta.width! - width));
    const top = Math.max(0, Math.min(crop.top, meta.height! - height));
    image = image.extract({ left, top, width, height });
    await image.resize(PORTRAIT.width, PORTRAIT.height).webp({ quality: 90 }).toFile(outFile);
    return;
  }
  await image
    .resize(PORTRAIT.width, PORTRAIT.height, {
      fit,
      ...(fit === "cover"
        ? { position: "attention" }
        : { background: "#ffffff" }),
    })
    .webp({ quality: 90 })
    .toFile(outFile);
}

/**
 * Fit onto an A4 white canvas for printing, with a small margin. Line art is
 * kept as-is; sharp's lanczos upscaling is fine for print at this size.
 */
async function processColoringPage(buffer: Buffer, outFile: string): Promise<void> {
  const inner = await sharp(buffer)
    .flatten({ background: "#ffffff" })
    .resize(COLORING.width - 200, COLORING.height - 200, {
      fit: "inside",
      withoutEnlargement: false,
    })
    .toBuffer();
  await sharp({
    create: {
      width: COLORING.width,
      height: COLORING.height,
      channels: 3,
      background: "#ffffff",
    },
  })
    .composite([{ input: inner, gravity: "centre" }])
    .webp({ quality: 90 })
    .toFile(outFile);
}

/** Experimental: convert a normal colour image into printable line art. */
export async function toLineArt(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .flatten({ background: "#ffffff" })
    .greyscale()
    .blur(1)
    .convolve({
      width: 3,
      height: 3,
      kernel: [-1, -1, -1, -1, 8, -1, -1, -1, -1], // Laplacian edge detection
    })
    .negate()
    .normalise()
    .threshold(200)
    .toBuffer();
}

export async function pickCandidates(
  slugOrName: string,
  thumbnailIndex: number | null,
  coloringIndexes: number[],
  options: {
    lineartIndexes?: number[];
    portraitFit?: "cover" | "contain";
    portraitCrop?: { left: number; top: number; width: number };
  } = {}
): Promise<{ dir: string; previewPng: string }> {
  const slug = slugify(slugOrName);
  const selectedDir = path.join(STAGING_ROOT, slug, "selected");
  await fs.mkdir(selectedDir, { recursive: true });

  const outputs: { label: string; file: string }[] = [];

  if (thumbnailIndex !== null) {
    const dir = typeDir(slug, "thumbnail");
    const manifest: Manifest = JSON.parse(
      await fs.readFile(path.join(dir, "manifest.json"), "utf-8")
    );
    const candidate = manifest.candidates.find((c) => c.index === thumbnailIndex);
    if (!candidate) throw new Error(`No thumbnail candidate #${thumbnailIndex}`);
    const buffer = await fetchCandidate(dir, candidate);
    await processPortrait(
      buffer,
      path.join(selectedDir, "character.webp"),
      options.portraitFit ?? "cover",
      options.portraitCrop
    );
    outputs.push({ label: `Portrait (from #${thumbnailIndex})`, file: "character.webp" });
    console.log(`  ✓ portrait from candidate #${thumbnailIndex}`);
  }

  if (coloringIndexes.length > 0) {
    const dir = typeDir(slug, "coloring");
    const manifest: Manifest = JSON.parse(
      await fs.readFile(path.join(dir, "manifest.json"), "utf-8")
    );
    for (let i = 0; i < coloringIndexes.length; i++) {
      const index = coloringIndexes[i];
      const candidate = manifest.candidates.find((c) => c.index === index);
      if (!candidate) throw new Error(`No coloring candidate #${index}`);
      let buffer = await fetchCandidate(dir, candidate);
      if (options.lineartIndexes?.includes(index)) {
        buffer = await toLineArt(buffer);
      }
      const fileName = `coloring${i + 1}.webp`;
      await processColoringPage(buffer, path.join(selectedDir, fileName));
      outputs.push({ label: `Coloring ${i + 1} (from #${index})`, file: fileName });
      console.log(`  ✓ coloring page ${i + 1} from candidate #${index}`);
    }
  }

  // Preview sheet of the final processed images
  const cells = outputs
    .map(
      (o) => `<div class="cell"><div class="num">${o.label}</div><img src="${o.file}"></div>`
    )
    .join("\n");
  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
  body { font-family: sans-serif; margin: 16px; background: #fafafa; }
  .grid { display: flex; flex-wrap: wrap; gap: 16px; }
  .cell { position: relative; background: #fff; border: 1px solid #ddd; }
  .cell img { height: 360px; display: block; }
  .num { position: absolute; top: 6px; left: 6px; background: #1976d2; color: #fff;
         font-size: 14px; font-weight: bold; padding: 2px 10px; border-radius: 12px; }
</style></head><body><div class="grid">${cells}</div></body></html>`;
  const previewHtml = path.join(selectedDir, "preview.html");
  await fs.writeFile(previewHtml, html);
  const previewPng = path.join(selectedDir, "preview.png");
  await screenshotHtml(previewHtml, previewPng);

  return { dir: selectedDir, previewPng };
}

export async function installCharacter(
  slugOrName: string,
  displayName: string,
  franchise: string
): Promise<void> {
  const slug = slugify(slugOrName);
  const selectedDir = path.join(STAGING_ROOT, slug, "selected");

  const portrait = path.join(selectedDir, "character.webp");
  await fs.copyFile(portrait, path.join(process.cwd(), "public", "images", "characters", `${slug}.webp`));

  const coloringPages: string[] = [];
  for (let i = 1; i <= 4; i++) {
    const source = path.join(selectedDir, `coloring${i}.webp`);
    try {
      await fs.access(source);
    } catch {
      break;
    }
    await fs.copyFile(source, path.join(process.cwd(), "public", "images", "coloring", `${slug}${i}.webp`));
    coloringPages.push(`/images/coloring/${slug}${i}.webp`);
  }

  const content = await fs.readFile(CHARACTERS_FILE, "utf-8");
  if (content.includes(`id: "${slug}"`)) {
    console.log(`  ${slug} already present in characters.ts, images updated only`);
    return;
  }
  const entry = `  // ${displayName}
  {
    id: "${slug}",
    name: "${displayName.toUpperCase()}",
    imageUrl: "/images/characters/${slug}.webp",
    franchise: "${franchise}",
    coloringPages: [
${coloringPages.map((p) => `      "${p}",`).join("\n")}
    ],
  },
];`;
  await fs.writeFile(CHARACTERS_FILE, content.replace(/^\];/m, entry));
  console.log(`  ✓ ${displayName} (${slug}) added to characters.ts with ${coloringPages.length} coloring pages`);
}
