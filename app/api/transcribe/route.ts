/**
 * Speech-to-text through ElevenLabs Scribe.
 *
 * The browser's own Web Speech API is fine for a single word but drops and
 * invents words across a whole sentence, so the sentence game posts its
 * recording here for a better transcript. The API key stays on the server; it
 * is never sent to the browser.
 *
 * This is a best-effort upgrade, not a dependency: every failure below returns
 * a plain error and the game falls back to the transcript the browser already
 * produced. Do not make this route throw or hang — a dead route must still
 * leave a playable game.
 */
import { NextResponse } from "next/server";

const ENDPOINT = "https://api.elevenlabs.io/v1/speech-to-text";
const MODEL_ID = process.env.ELEVENLABS_STT_MODEL || "scribe_v1";
const MAX_BYTES = 10 * 1024 * 1024;
const TIMEOUT_MS = 15000;

/** A fifth of a second of silence — the smallest clip the API will look at. */
function silentWav(): Blob {
  const sampleRate = 16000;
  const samples = sampleRate / 5;
  const buffer = Buffer.alloc(44 + samples * 2);
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + samples * 2, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(1, 22); // mono
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(samples * 2, 40);
  return new Blob([new Uint8Array(buffer)], { type: "audio/wav" });
}

let probe: { usable: boolean; at: number } | null = null;
const PROBE_TTL_MS = 10 * 60 * 1000;

/**
 * Whether Scribe is actually reachable — not just whether a key exists.
 *
 * This matters: the key may be present but lack the `speech_to_text`
 * permission, and the client uses this answer to decide whether to open the
 * microphone for recording at all. Saying "yes" when the answer is no would
 * make every turn record audio that can never be transcribed. Re-probed every
 * ten minutes so enabling the permission takes effect without a restart.
 */
export async function GET() {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) return NextResponse.json({ configured: false, reason: "no-key" });

  if (probe && Date.now() - probe.at < PROBE_TTL_MS) {
    return NextResponse.json({ configured: probe.usable, cached: true });
  }

  try {
    const form = new FormData();
    form.append("file", silentWav(), "probe.wav");
    form.append("model_id", MODEL_ID);
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "xi-api-key": apiKey },
      body: form,
      signal: AbortSignal.timeout(8000),
    });
    // Anything but a rejection of the key itself means the door is open.
    const usable = response.status !== 401 && response.status !== 403;
    if (!usable) {
      console.warn(
        `[transcribe] key lacks speech-to-text permission (${response.status}); ` +
          "the sentence game will use the browser recogniser only"
      );
    }
    probe = { usable, at: Date.now() };
    return NextResponse.json({ configured: usable });
  } catch (error) {
    console.warn(
      `[transcribe] probe failed: ${error instanceof Error ? error.message : error}`
    );
    probe = { usable: false, at: Date.now() };
    return NextResponse.json({ configured: false, reason: "probe-failed" });
  }
}

export async function POST(request: Request) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ELEVENLABS_API_KEY is not configured" },
      { status: 503 }
    );
  }

  let audio: File | null = null;
  try {
    const form = await request.formData();
    const value = form.get("audio");
    if (value instanceof File) audio = value;
  } catch {
    return NextResponse.json({ error: "Malformed upload" }, { status: 400 });
  }

  // Only container headers, no audio. Kept low on purpose — Opus makes quiet
  // speech very small, and rejecting it here would look like a broken service.
  if (!audio || audio.size < 512) {
    return NextResponse.json({ error: "No usable audio in request" }, { status: 400 });
  }
  if (audio.size > MAX_BYTES) {
    return NextResponse.json({ error: "Audio too large" }, { status: 413 });
  }

  const upstream = new FormData();
  upstream.append("file", audio, audio.name || "speech.webm");
  upstream.append("model_id", MODEL_ID);
  upstream.append("language_code", "eng");
  // Nothing downstream uses speakers or timings, and both cost latency.
  upstream.append("diarize", "false");
  upstream.append("timestamps_granularity", "none");

  try {
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "xi-api-key": apiKey },
      body: upstream,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!response.ok) {
      const detail = (await response.text()).slice(0, 300);
      console.warn(`[transcribe] ElevenLabs ${response.status}: ${detail}`);
      return NextResponse.json(
        { error: `Speech-to-text failed (${response.status})` },
        { status: 502 }
      );
    }

    const result = await response.json();
    const text = typeof result?.text === "string" ? result.text : "";
    console.log(
      `[transcribe] ${audio.size} bytes (${audio.type || "no type"}) -> ` +
        (text ? `"${text}"` : "(nothing heard)")
    );
    // An empty transcript is an ordinary answer — she paused, or the clip
    // caught no speech. It is not a failure of the service, and reporting it as
    // one made the game treat a quiet moment as a broken microphone.
    return NextResponse.json({ text, source: "elevenlabs" });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`[transcribe] request failed: ${message}`);
    return NextResponse.json({ error: "Speech-to-text unavailable" }, { status: 502 });
  }
}
