#!/usr/bin/env node
/**
 * Derives Neptune's cloud layer from its own surface map
 * (public/textures/planets/neptune_clouds.webp).
 *
 * Solar System Scope publishes a cloud map for Earth but not for Neptune, so
 * rather than inventing clouds this pulls out the ones already in the surface
 * texture: Neptune's bright methane cirrus sits a little lighter than the
 * smooth banding around it, so a high-pass (the map minus a blurred copy of
 * itself) isolates the streaks while ignoring the bands and the Great Dark
 * Spot. The result is used as an alpha map on a second sphere, which drifts
 * the opposite way to the planet's spin — as Neptune's winds really do.
 *
 * Usage: npm run planets:clouds
 */
import * as path from "node:path";
import sharp from "sharp";
import { formatSuccess, formatInfo } from "./config";

const TEXTURE_DIR = path.join(__dirname, "../public/textures/planets");

/** How far the high-pass is amplified before being clamped to a mask. */
const GAIN = 22;
/** Light blur first, so JPEG banding in the source does not become "cloud". */
const DENOISE_BLUR = 1.6;
/** Radius of the blur that defines "the smooth background", in pixels. */
const BACKGROUND_BLUR = 24;

async function deriveNeptuneClouds() {
  const source = path.join(TEXTURE_DIR, "neptune.webp");
  const output = path.join(TEXTURE_DIR, "neptune_clouds.webp");

  const flat = sharp(source).greyscale().blur(DENOISE_BLUR);
  const { data: sharpData, info } = await flat
    .clone()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { data: blurred } = await flat
    .clone()
    .blur(BACKGROUND_BLUR)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const mask = Buffer.alloc(sharpData.length);
  for (let i = 0; i < sharpData.length; i++) {
    // Only brighter-than-background counts: darker patches are storms, not cloud
    mask[i] = Math.min(255, Math.max(0, (sharpData[i] - blurred[i]) * GAIN));
  }

  await sharp(mask, {
    raw: { width: info.width, height: info.height, channels: 1 },
  })
    .blur(1.5) // soften so the cloud edges are not speckled
    .webp({ quality: 88, effort: 5 })
    .toFile(output);

  console.log(formatSuccess(`neptune_clouds.webp  ${info.width}x${info.height}`));
}

async function main() {
  await deriveNeptuneClouds();
  console.log(formatInfo("Done"));
}

main();
