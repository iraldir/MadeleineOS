#!/usr/bin/env node
/**
 * Records the solar system voice lines with ElevenLabs:
 *
 *   public/sounds/planets/<id>.mp3            the body's name, e.g. "The Earth"
 *   public/sounds/planets/facts/<id>-<n>.mp3  one line per fact in types/planets.ts
 *
 * The name is spoken when the child taps the name; a fact is picked at random
 * when they arrive at a planet.
 *
 * Usage: npm run planets:voices [-- --only <id>] [-- --names|--facts] [-- --force]
 */
import * as fs from "node:fs/promises";
import * as path from "node:path";
import dotenv from "dotenv";
import { ALL_BODIES } from "../types/planets";
import { formatSuccess, formatError, formatInfo } from "./config";

dotenv.config();

const SOUND_DIR = path.join(__dirname, "../public/sounds/planets");
const FACT_DIR = path.join(SOUND_DIR, "facts");

/** "Jessica — playful, bright, warm", a young female voice. */
const VOICE_ID = "cgSgspJ2msm6clMCkdW9";
const MODEL = "eleven_multilingual_v2";

/** Only the Sun and the Earth take an article in English. */
const spokenName = (id: string, name: string) =>
  id === "sun" || id === "earth" ? `The ${name}` : name;

async function speak(text: string, outputPath: string): Promise<void> {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) throw new Error("ELEVENLABS_API_KEY missing from .env");

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": key,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: MODEL,
        voice_settings: {
          stability: 0.4,
          similarity_boost: 0.75,
          // Warm and lively — the Google voices these replace sounded flat.
          style: 0.45,
          use_speaker_boost: true,
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(
      `ElevenLabs ${response.status}: ${(await response.text()).slice(0, 200)}`
    );
  }
  await fs.writeFile(outputPath, Buffer.from(await response.arrayBuffer()));
}

async function record(text: string, outputPath: string, label: string, force: boolean) {
  if (!force) {
    try {
      await fs.access(outputPath);
      console.log(formatInfo(`${label} exists, skipping`));
      return true;
    } catch {
      // not recorded yet
    }
  }
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      await speak(text, outputPath);
      console.log(formatSuccess(`${label}  "${text.slice(0, 60)}"`));
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(formatError(`${label} attempt ${attempt}: ${message.slice(0, 120)}`));
      await new Promise((r) => setTimeout(r, 3000 * attempt));
    }
  }
  return false;
}

async function main() {
  const args = process.argv.slice(2);
  const force = args.includes("--force");
  const onlyIndex = args.indexOf("--only");
  const only = onlyIndex >= 0 ? args[onlyIndex + 1] : null;
  const namesOnly = args.includes("--names");
  const factsOnly = args.includes("--facts");

  await fs.mkdir(FACT_DIR, { recursive: true });
  const targets = only ? ALL_BODIES.filter((b) => b.id === only) : ALL_BODIES;

  let done = 0;
  let failed = 0;

  for (const body of targets) {
    if (!factsOnly) {
      const ok = await record(
        spokenName(body.id, body.name),
        path.join(SOUND_DIR, `${body.id}.mp3`),
        `${body.id} name`,
        force
      );
      ok ? done++ : failed++;
    }

    if (!namesOnly) {
      for (let i = 0; i < body.facts.length; i++) {
        const ok = await record(
          body.facts[i],
          path.join(FACT_DIR, `${body.id}-${i + 1}.mp3`),
          `${body.id} fact ${i + 1}`,
          force
        );
        ok ? done++ : failed++;
      }
    }
  }

  console.log(formatInfo(`Done — ${done} recorded, ${failed} failed`));
}

main();
