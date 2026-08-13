/**
 * End-to-end check of the sentence game's speech path.
 *
 * Speaks a handful of the game's own sentences with ElevenLabs TTS, sends the
 * audio back through Scribe, and runs the transcript through the same matching
 * code the game uses. The owner cannot easily test this by hand, and the
 * failure that matters is not "does the API answer" but "does a real transcript
 * of a real sentence actually pass the matcher".
 *
 * Run: pnpm exec tsx scripts/check-scribe-matching.ts
 */
import * as dotenv from "dotenv";
import { alignTranscript } from "../lib/speech/matching";
import { SENTENCES } from "../app/games/reading-sentences/sentences";

dotenv.config();

const KEY = process.env.ELEVENLABS_API_KEY;
const STT = "https://api.elevenlabs.io/v1/speech-to-text";
// "Jessica" — the voice already used for the planet facts.
const VOICE = "cgSgspJ2msm6clMCkdW9";
const TTS = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE}`;

async function speak(text: string): Promise<Buffer> {
  const res = await fetch(TTS, {
    method: "POST",
    headers: { "xi-api-key": KEY!, "content-type": "application/json" },
    body: JSON.stringify({
      text,
      model_id: "eleven_multilingual_v2",
      // Pushed away from the default so it reads a little unevenly, closer to
      // a child sounding a sentence out than to a polished narrator.
      voice_settings: { stability: 0.3, similarity_boost: 0.6, speed: 0.8 },
    }),
  });
  if (!res.ok) throw new Error(`TTS ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return Buffer.from(await res.arrayBuffer());
}

async function transcribe(audio: Buffer): Promise<string> {
  const form = new FormData();
  form.append("file", new Blob([new Uint8Array(audio)], { type: "audio/mpeg" }), "speech.mp3");
  form.append("model_id", "scribe_v1");
  form.append("language_code", "eng");
  const res = await fetch(STT, { method: "POST", headers: { "xi-api-key": KEY! }, body: form });
  if (!res.ok) throw new Error(`STT ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return (await res.json()).text ?? "";
}

async function main() {
  if (!KEY) throw new Error("ELEVENLABS_API_KEY is not set");

  // A spread across the difficulty range, plus the two with proper nouns,
  // which are what the matcher is most likely to trip on.
  const picks = [
    SENTENCES[0],
    SENTENCES[19],
    SENTENCES[39],
    SENTENCES[59],
    SENTENCES[SENTENCES.length - 1],
    ...SENTENCES.filter((s) => /Mario|Elsa|Pikachu|Bluey/.test(s.text)).slice(0, 3),
  ].filter((s, i, a) => s && a.indexOf(s) === i);

  let passed = 0;
  for (const sentence of picks) {
    try {
      const heard = await transcribe(await speak(sentence.text));
      const result = alignTranscript(sentence.text, heard, sentence.alternates);
      const mark = result.passed ? "PASS" : "FAIL";
      if (result.passed) passed++;
      console.log(`${mark}  ${Math.round(result.score * 100)}%  ${sentence.id}`);
      console.log(`      said:  ${sentence.text}`);
      console.log(`      heard: ${heard.trim()}`);
    } catch (error) {
      console.log(`ERROR ${sentence.id}: ${error instanceof Error ? error.message : error}`);
    }
  }
  console.log(`\n${passed}/${picks.length} passed the matcher.`);
}

main();
