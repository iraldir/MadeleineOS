/**
 * Image generation through Vertex AI using the gcloud user credentials.
 *
 * The `GEMINI_KEY` API-key path in `media-generator.ts` is dead (Google returns
 * API_KEY_INVALID), so anything that needs a picture goes through here instead:
 * the same model, but authenticated with `gcloud auth print-access-token`
 * against the project in `GCLOUD_PROJECT`.
 *
 * The quota for this model is tight (roughly ten requests a minute before it
 * starts returning 429), hence `generateImageWithRetry`, which backs off for a
 * whole minute when it is throttled.
 */
import sharp from "sharp";
import { exec } from "child_process";
import { promisify } from "util";
import dotenv from "dotenv";
import { CONFIG } from "../config";

dotenv.config();

const execAsync = promisify(exec);

let cachedAuth: { token: string; project: string } | null = null;

export async function getVertexAuth(): Promise<{ token: string; project: string }> {
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

/**
 * The quota is counted per location, and they run out independently — when
 * `global` is exhausted a regional endpoint will usually still answer at once.
 * Rotating through these beats waiting out a backoff by a wide margin.
 */
export const LOCATIONS = [
  "us-central1",
  "us-east4",
  "europe-west4",
  "us-west1",
  "global",
];

export interface VertexImageOptions {
  prompt: string;
  outputPath: string;
  width?: number;
  height?: number;
  quality?: number;
  /** How the generated image is fitted into width x height. */
  fit?: "cover" | "contain";
  location?: string;
}

/** One shot at the model. Throws on anything that is not a picture. */
export async function generateImage(options: VertexImageOptions): Promise<void> {
  const {
    prompt,
    outputPath,
    width = 512,
    height = 512,
    quality = 88,
    fit = "cover",
    location = "global",
  } = options;

  const { token, project } = await getVertexAuth();
  const model = CONFIG.models.imageGeneration;
  const host =
    location === "global"
      ? "https://aiplatform.googleapis.com"
      : `https://${location}-aiplatform.googleapis.com`;
  const url =
    `${host}/v1/projects/${project}/locations/${location}` +
    `/publishers/google/models/${model}:generateContent`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
    }),
  });

  if (!response.ok) {
    const body = (await response.text()).slice(0, 300);
    throw new Error(`Vertex AI ${response.status}: ${body}`);
  }

  const result = await response.json();
  const parts = result.candidates?.[0]?.content?.parts ?? [];
  for (const part of parts) {
    if (part.inlineData?.data) {
      await sharp(Buffer.from(part.inlineData.data, "base64"))
        .resize(width, height, {
          fit,
          position: "center",
          background: { r: 255, g: 255, b: 255, alpha: 1 },
        })
        .webp({ quality, effort: 4 })
        .toFile(outputPath);
      return;
    }
  }
  throw new Error("No image data in response");
}

/** Where the last call succeeded — the next one starts there rather than at the top. */
let preferredLocation = 0;

/**
 * Tries each location in turn. A 429 is not worth sleeping over while another
 * region still has quota, so it moves straight on; only once every location has
 * refused does it wait, and even then not for long, because by the time it has
 * been round them all the first one has usually refilled.
 */
export async function generateImageWithRetry(
  options: VertexImageOptions,
  attempts = LOCATIONS.length * 2,
  onAttemptFailed?: (attempt: number, message: string) => void
): Promise<boolean> {
  for (let attempt = 1; attempt <= attempts; attempt++) {
    const index = (preferredLocation + attempt - 1) % LOCATIONS.length;
    const location = LOCATIONS[index];
    try {
      await generateImage({ ...options, location });
      preferredLocation = index;
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      onAttemptFailed?.(attempt, `${location}: ${message}`);
      if (attempt === attempts) return false;
      const throttled =
        message.includes("429") || message.includes("RESOURCE_EXHAUSTED");
      const wentRoundOnce = attempt % LOCATIONS.length === 0;
      if (throttled && !wentRoundOnce) continue;
      await new Promise((r) =>
        setTimeout(r, throttled ? 20000 : 4000 * Math.ceil(attempt / 2))
      );
    }
  }
  return false;
}
