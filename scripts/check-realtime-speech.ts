/**
 * End-to-end check of the realtime listening path.
 *
 * Speaks one of the game's own sentences, streams the audio into the same
 * WebSocket the browser uses, and runs the transcripts through the same matcher
 * the games use. This is the only way to verify the streaming path without a
 * child and a microphone.
 *
 * What it proves: the model id and language code are right, partial transcripts
 * really do arrive mid-sentence (the thing the chimes depend on), and a real
 * transcript passes the matcher.
 *
 * Run: pnpm speech:check-realtime
 */
import * as dotenv from "dotenv";
import { alignTranscript } from "../lib/speech/matching";
import { SENTENCES } from "../app/games/reading-sentences/sentences";

dotenv.config();

const KEY = process.env.ELEVENLABS_API_KEY;
const VOICE = "cgSgspJ2msm6clMCkdW9"; // "Jessica", as used elsewhere
const SAMPLE_RATE = 16000;
/** 100ms of 16-bit mono audio — roughly what a browser sends per tick. */
const CHUNK_BYTES = (SAMPLE_RATE * 2) / 10;

async function speakPcm(text: string): Promise<Buffer> {
  const url =
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE}` +
    `?output_format=pcm_${SAMPLE_RATE}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "xi-api-key": KEY!, "content-type": "application/json" },
    body: JSON.stringify({
      text,
      model_id: "eleven_multilingual_v2",
      voice_settings: { stability: 0.3, similarity_boost: 0.6, speed: 0.85 },
    }),
  });
  if (!res.ok) throw new Error(`TTS ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return Buffer.from(await res.arrayBuffer());
}

interface Outcome {
  partials: string[];
  committed: string;
  errors: string[];
}

function transcribeStreaming(pcm: Buffer): Promise<Outcome> {
  const params = new URLSearchParams({
    model_id: "scribe_v2_realtime",
    language_code: "eng",
    audio_format: `pcm_${SAMPLE_RATE}`,
    commit_strategy: "manual",
  });
  const url = `wss://api.elevenlabs.io/v1/speech-to-text/realtime?${params}`;

  return new Promise((resolve, reject) => {
    const outcome: Outcome = { partials: [], committed: "", errors: [] };
    // Node's WebSocket takes headers via the options bag; the browser uses a
    // single-use token instead, which is what /api/speech/token exists for.
    const socket = new WebSocket(url, {
      headers: { "xi-api-key": KEY! },
    } as unknown as string[]);

    const done = (error?: Error) => {
      try {
        socket.close();
      } catch {
        // already closed
      }
      error ? reject(error) : resolve(outcome);
    };

    socket.addEventListener("open", async () => {
      for (let offset = 0; offset < pcm.length; offset += CHUNK_BYTES) {
        const chunk = pcm.subarray(offset, offset + CHUNK_BYTES);
        socket.send(
          JSON.stringify({
            message_type: "input_audio_chunk",
            audio_base_64: chunk.toString("base64"),
            sample_rate: SAMPLE_RATE,
            commit: false,
          })
        );
        // Real time: 100ms of audio every 100ms, as a microphone delivers it.
        await new Promise((r) => setTimeout(r, 100));
      }
      socket.send(
        JSON.stringify({
          message_type: "input_audio_chunk",
          audio_base_64: "",
          sample_rate: SAMPLE_RATE,
          commit: true,
        })
      );
      setTimeout(() => done(), 4000);
    });

    socket.addEventListener("message", (event) => {
      const msg = JSON.parse(String(event.data));
      switch (msg.message_type) {
        case "partial_transcript":
          if (msg.text) outcome.partials.push(msg.text);
          break;
        case "committed_transcript":
          outcome.committed = `${outcome.committed} ${msg.text ?? ""}`.trim();
          break;
        case "session_started":
          break;
        default:
          if (String(msg.message_type).includes("error")) {
            outcome.errors.push(`${msg.message_type}: ${msg.error ?? ""}`);
          }
      }
    });

    socket.addEventListener("error", () => done(new Error("websocket error")));
    setTimeout(() => done(), 45000);
  });
}

async function main() {
  if (!KEY) throw new Error("ELEVENLABS_API_KEY is not set");

  const picks = [
    SENTENCES.find((s) => s.id === "rat-jam")!,
    SENTENCES.find((s) => s.id === "cat-mat")!,
    SENTENCES.find((s) => s.id === "dragon-rock")!,
  ].filter(Boolean);

  let passed = 0;
  for (const sentence of picks) {
    const pcm = await speakPcm(sentence.text);
    const outcome = await transcribeStreaming(pcm);
    const heard = `${outcome.committed || outcome.partials.at(-1) || ""}`.trim();
    const result = alignTranscript(sentence.text, heard, sentence.alternates);
    if (result.passed) passed++;

    console.log(`\n${result.passed ? "PASS" : "FAIL"}  ${sentence.id}`);
    console.log(`  said:     ${sentence.text}`);
    console.log(`  heard:    ${heard}`);
    console.log(`  score:    ${result.matchedCount}/${result.total}`);
    console.log(`  partials: ${outcome.partials.length} (the chimes depend on these)`);
    if (outcome.partials.length > 0) {
      console.log(`    first:  "${outcome.partials[0]}"`);
      console.log(`    last:   "${outcome.partials.at(-1)}"`);
    }
    if (outcome.errors.length) console.log(`  errors:   ${outcome.errors.join("; ")}`);
  }
  console.log(`\n${passed}/${picks.length} passed the matcher.`);
}

main();
