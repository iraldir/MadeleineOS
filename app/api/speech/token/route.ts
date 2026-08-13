/**
 * Mints a short-lived token so the browser can talk to the recogniser directly.
 *
 * The games stream microphone audio straight to ElevenLabs over a WebSocket —
 * that is the only way to get words back while she is still speaking. The API
 * key must never travel to the browser to make that happen, so the browser asks
 * here instead and gets a single-use token that expires in fifteen minutes.
 *
 * A GET with no token available is not an error worth throwing over: it means
 * the games should say the microphone is unavailable rather than break.
 */
import { NextResponse } from "next/server";

const TOKEN_ENDPOINT =
  "https://api.elevenlabs.io/v1/single-use-token/realtime_scribe";
const TIMEOUT_MS = 8000;

export async function GET() {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    console.warn("[speech] ELEVENLABS_API_KEY is not set; listening is disabled");
    return NextResponse.json(
      { error: "Speech recognition is not configured", reason: "no-key" },
      { status: 503 }
    );
  }

  try {
    const response = await fetch(TOKEN_ENDPOINT, {
      method: "POST",
      headers: { "xi-api-key": apiKey },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!response.ok) {
      const detail = (await response.text()).slice(0, 300);
      console.warn(`[speech] token request failed: ${response.status} ${detail}`);
      // 401/403 here means the key lacks the speech-to-text permission, which
      // is worth saying plainly — it is the one failure a person can fix.
      const reason =
        response.status === 401 || response.status === 403
          ? "key-lacks-permission"
          : "upstream-error";
      return NextResponse.json(
        { error: `Could not get a speech token (${response.status})`, reason },
        { status: 502 }
      );
    }

    const body = await response.json();
    const token = typeof body?.token === "string" ? body.token : null;
    if (!token) {
      return NextResponse.json(
        { error: "No token in response", reason: "malformed" },
        { status: 502 }
      );
    }

    // Never cached: each token may be used once.
    return NextResponse.json(
      { token },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`[speech] token request threw: ${message}`);
    return NextResponse.json(
      { error: "Speech recognition unavailable", reason: "unreachable" },
      { status: 502 }
    );
  }
}
