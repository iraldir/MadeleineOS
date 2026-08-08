"use client";
/**
 * Listening for a whole sentence.
 *
 * Two recognisers run at once, because they are good at different things:
 *
 *  - The browser's Web Speech API streams partial results, which is what lights
 *    up the words as she reads them. It is also the safety net: it needs no
 *    network and no API key, so the game works even when everything else fails.
 *  - ElevenLabs Scribe, behind /api/transcribe, gets a far better transcript of
 *    a child reading, but only once the recording is finished.
 *
 * So: Web Speech drives the live highlighting and can end the turn early the
 * moment it has heard enough; otherwise the recording goes to Scribe and the
 * turn is won if *either* recogniser thinks she read it. If the route is
 * missing, erroring, or the key has no speech-to-text permission, the first
 * failure switches recording off for the rest of the session and the Web Speech
 * verdict stands.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { alignTranscript, type AlignmentResult } from "./matching";

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  onresult: ((e: SpeechResultEventLike) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

type SpeechResultEventLike = {
  resultIndex: number;
  results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }>;
};

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

export type TranscriptSource = "browser" | "elevenlabs";

/**
 * Deliberately loud. Whether a turn was judged on the browser's guess or on
 * Scribe's, and what each of them actually heard, is impossible to work out
 * from the outside — the game only ever shows a tick or a cross.
 */
const log = (message: string, ...rest: unknown[]) =>
  console.log(`%c[reading] ${message}`, "color:#0a7", ...rest);

interface UseSentenceSpeechOptions {
  lang?: string;
  timeoutMs?: number;
  /** Called continuously while she reads, so the UI can light words up. */
  onProgress?: (matched: boolean[], transcript: string) => void;
  onResult?: (
    result: AlignmentResult,
    transcript: string,
    source: TranscriptSource
  ) => void;
}

export interface SentenceSpeechHook {
  start: (sentenceText: string, alternates?: Record<string, string[]>) => void;
  stop: () => void;
  isListening: boolean;
  isSupported: boolean;
}

function getCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

function canRecord(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.MediaRecorder !== "undefined" &&
    Boolean(navigator.mediaDevices?.getUserMedia)
  );
}

/**
 * Whether the server has a key at all. Asked once per page load; a failure here
 * simply means "don't bother recording".
 */
let scribeProbe: Promise<boolean> | null = null;
/**
 * Whether to keep trying Scribe. One failure means nothing — a single recording
 * can come out unusable — so we only give up after it fails repeatedly, and any
 * success resets the count. Giving up for the session on the first hiccup would
 * silently drop her back to the weaker recogniser for the rest of the sitting.
 */
let scribeUsable = true;
let scribeFailures = 0;
const SCRIBE_GIVE_UP_AFTER = 3;

function noteScribeFailure() {
  scribeFailures += 1;
  if (scribeFailures >= SCRIBE_GIVE_UP_AFTER) scribeUsable = false;
}

function probeScribe(): Promise<boolean> {
  if (!scribeProbe) {
    scribeProbe = fetch("/api/transcribe")
      .then((r) => (r.ok ? r.json() : { configured: false }))
      .then((j) => {
        log(
          j?.configured
            ? "ElevenLabs Scribe is available"
            : `Scribe unavailable (${j?.reason ?? "not configured"}) — browser recogniser only`
        );
        return Boolean(j?.configured);
      })
      .catch((error) => {
        log("Scribe probe failed, browser recogniser only:", error);
        return false;
      });
  }
  return scribeProbe;
}

/**
 * Below this a blob holds no audio at all, only container headers.
 *
 * Kept deliberately low: Opus compresses quiet audio so hard that five seconds
 * of a child reading softly can come to well under two kilobytes, and a higher
 * floor silently denied her the better recogniser exactly when she most needed
 * it. An empty transcript is handled gracefully, so it is cheaper to ask and be
 * told nothing than to guess there was nothing to hear.
 */
const MIN_AUDIO_BYTES = 512;

/**
 * Safari records mp4, everything else webm. Send the container the recorder
 * actually produced — labelling an mp4 as webm is asking to be misread, and
 * Madeleine reads on an iPad.
 */
/**
 * The best container this browser will actually record. Chrome gives webm/opus,
 * Safari mp4; asking explicitly means we know what we are sending rather than
 * discovering the recorder reported nothing at all.
 */
function preferredMimeType(): string {
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
  ];
  const supported = candidates.find((type) =>
    typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported?.(type)
  );
  return supported ?? "";
}

function extensionFor(mimeType: string): string {
  if (mimeType.includes("mp4")) return "mp4";
  if (mimeType.includes("ogg")) return "ogg";
  if (mimeType.includes("wav")) return "wav";
  return "webm";
}

async function transcribeWithScribe(blob: Blob): Promise<string | null> {
  const form = new FormData();
  form.append("audio", blob, `speech.${extensionFor(blob.type)}`);
  try {
    const started = performance.now();
    const response = await fetch("/api/transcribe", { method: "POST", body: form });
    const ms = Math.round(performance.now() - started);
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      log(
        `Scribe request failed: HTTP ${response.status} after ${ms}ms ${detail.slice(0, 200)}`
      );
      // 503 is the server saying it has no key at all; nothing will change that.
      if (response.status === 503) scribeUsable = false;
      else noteScribeFailure();
      if (!scribeUsable) log("giving up on Scribe for this session");
      return null;
    }
    const json = await response.json();
    const text = typeof json?.text === "string" && json.text ? json.text : null;
    if (text) scribeFailures = 0;
    log(`Scribe replied in ${ms}ms:`, text === null ? "(nothing heard)" : `"${text}"`);
    return text;
  } catch (error) {
    log("Scribe request threw:", error);
    noteScribeFailure();
    return null;
  }
}

export function useSentenceSpeech(
  options: UseSentenceSpeechOptions
): SentenceSpeechHook {
  const { lang = "en-US", timeoutMs = 12000, onProgress, onResult } = options;

  const [isListening, setIsListening] = useState(false);

  const cbRef = useRef({ onProgress, onResult });
  useEffect(() => {
    cbRef.current = { onProgress, onResult };
  }, [onProgress, onResult]);

  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  /** The container the recorder chose, so the upload is labelled honestly. */
  const mimeRef = useRef("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const targetRef = useRef<{ text: string; alternates?: Record<string, string[]> }>({
    text: "",
  });
  const finalRef = useRef("");
  const interimRef = useRef("");
  const settledRef = useRef(false);
  const recordingRef = useRef(false);
  /** Held while a verdict is being worked out, so only one attempt runs. */
  const finishingRef = useRef(false);
  /**
   * Which turn we are on. Every recorder callback checks this before touching
   * anything: a turn that ends early leaves a recorder mid-flush, and without
   * this guard its trailing chunk lands in the *next* turn's audio. That makes a
   * headerless fragment which Scribe rejects, and the turn dies on a 502.
   */
  const turnRef = useRef(0);

  const [isSupported] = useState(() => getCtor() !== null || canRecord());

  const releaseMic = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  /**
   * Silence the recorder and stop it, in that order — stopping fires one last
   * `ondataavailable`, and by then nobody must be listening.
   */
  const detachRecorder = useCallback(() => {
    const recorder = recorderRef.current;
    recorderRef.current = null;
    recordingRef.current = false;
    if (!recorder) return;
    recorder.ondataavailable = null;
    recorder.onstop = null;
    try {
      if (recorder.state !== "inactive") recorder.stop();
    } catch {
      // already stopped
    }
  }, []);

  const teardown = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    const rec = recRef.current;
    recRef.current = null;
    if (rec) {
      rec.onresult = null;
      rec.onend = null;
      rec.onerror = null;
      try {
        rec.abort();
      } catch {
        // already stopped
      }
    }
    setIsListening(false);
  }, []);

  const settle = useCallback(
    (result: AlignmentResult, transcript: string, source: TranscriptSource) => {
      if (settledRef.current) return;
      settledRef.current = true;
      teardown();
      detachRecorder();
      releaseMic();
      cbRef.current.onResult?.(result, transcript, source);
    },
    [teardown, detachRecorder, releaseMic]
  );

  const browserTranscript = () =>
    `${finalRef.current} ${interimRef.current}`.trim();

  /**
   * Everything has stopped and Web Speech alone was not convinced — give the
   * recording to Scribe, and take the kinder of the two verdicts.
   */
  const finishWithRecording = useCallback(async () => {
    // Both the recogniser ending and the recorder stopping call this, and they
    // race. Without this guard the second call runs while the first is still
    // waiting on Scribe, finds the chunks already taken, and settles the turn on
    // the browser's verdict — so Scribe's better answer arrives too late to
    // count and she is marked wrong for a sentence she read.
    if (settledRef.current || finishingRef.current) return;
    finishingRef.current = true;
    const { text, alternates } = targetRef.current;
    const heard = browserTranscript();
    const browserResult = alignTranscript(text, heard, alternates);

    const blob =
      chunksRef.current.length > 0
        ? new Blob(chunksRef.current, { type: mimeRef.current || "audio/webm" })
        : null;
    chunksRef.current = [];

    log(
      `browser heard "${heard}" — ${browserResult.matchedCount}/${browserResult.total} words, ` +
        `${Math.round(browserResult.score * 100)}%, ${browserResult.passed ? "PASS" : "fail"}`
    );

    if (!blob) {
      log("no audio was recorded, so Scribe cannot be asked");
    } else if (blob.size < MIN_AUDIO_BYTES) {
      log(`recording too short to send (${blob.size} bytes of ${blob.type})`);
    } else if (!scribeUsable) {
      log("Scribe is switched off for this session");
    } else {
      log(`sending ${blob.size} bytes of ${blob.type} to Scribe`);
      const scribeText = await transcribeWithScribe(blob);
      if (scribeText) {
        const scribeResult = alignTranscript(text, scribeText, alternates);
        log(
          `Scribe scored ${scribeResult.matchedCount}/${scribeResult.total} words, ` +
            `${Math.round(scribeResult.score * 100)}%, ${scribeResult.passed ? "PASS" : "fail"}`
        );
        if (scribeResult.passed || !browserResult.passed) {
          log(`verdict from Scribe: ${scribeResult.passed ? "correct" : "not correct"}`);
          settle(scribeResult, scribeText, "elevenlabs");
          return;
        }
      }
    }

    log(`verdict from the browser: ${browserResult.passed ? "correct" : "not correct"}`);
    settle(browserResult, heard, "browser");
  }, [settle]);

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    try {
      recRef.current?.stop();
    } catch {
      // already stopped
    }
    // Stopping the recorder flushes the last chunk and its `onstop` finishes the
    // turn. Any other state means no audio is coming, so judge on what the
    // browser heard — otherwise the turn would wait for a callback that never
    // arrives and she would be stuck looking at a dead microphone.
    if (recordingRef.current && recorderRef.current?.state === "recording") {
      try {
        recorderRef.current.stop();
      } catch {
        recordingRef.current = false;
        void finishWithRecording();
      }
    } else {
      void finishWithRecording();
    }
  }, [finishWithRecording]);

  const start = useCallback(
    (sentenceText: string, alternates?: Record<string, string[]>) => {
      // Anything still running belongs to the turn before this one.
      detachRecorder();
      releaseMic();
      const turn = ++turnRef.current;
      log(`turn ${turn} — she should read: "${sentenceText}"`);

      targetRef.current = { text: sentenceText, alternates };
      finalRef.current = "";
      interimRef.current = "";
      chunksRef.current = [];
      settledRef.current = false;
      recordingRef.current = false;
      finishingRef.current = false;
      setIsListening(true);

      const Ctor = getCtor();
      if (Ctor) {
        const rec = new Ctor();
        rec.lang = lang;
        rec.interimResults = true;
        rec.maxAlternatives = 1;
        rec.continuous = true;

        rec.onresult = (event) => {
          let interim = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            const text = result[0]?.transcript ?? "";
            if (result.isFinal) finalRef.current += ` ${text}`;
            else interim += ` ${text}`;
          }
          interimRef.current = interim.trim();

          const heard = browserTranscript();
          const { text, alternates: alts } = targetRef.current;
          const progress = alignTranscript(text, heard, alts);
          cbRef.current.onProgress?.(progress.matched, heard);
          log(
            `…hearing "${heard}" (${progress.matchedCount}/${progress.total} words)`
          );

          // She has clearly read it — don't make her wait out the timer.
          if (progress.passed) {
            log("browser is convinced already — ending the turn early");
            settle(progress, heard, "browser");
          }
        };

        rec.onerror = (event) => {
          // Logged even when harmless: "not-allowed" here is the single most
          // likely reason the game appears to do nothing at all.
          log(`browser recogniser error: ${event.error}`);
        };

        rec.onend = () => {
          if (settledRef.current) return;
          // If we are recording, the recorder's onstop finishes the turn so the
          // audio is complete; otherwise judge on what the browser heard.
          if (recordingRef.current && recorderRef.current?.state === "recording") {
            try {
              recorderRef.current.stop();
            } catch {
              void finishWithRecording();
            }
          } else if (!recordingRef.current) {
            void finishWithRecording();
          }
        };

        recRef.current = rec;
        try {
          rec.start();
          log("browser recogniser listening");
        } catch (error) {
          log("browser recogniser refused to start:", error);
          recRef.current = null;
        }
      } else {
        log("this browser has no Web Speech API — Scribe only, no live highlighting");
      }

      // Recording is the optional half — never let it break the turn.
      if (canRecord() && scribeUsable) {
        void (async () => {
          const configured = await probeScribe();
          if (!configured) {
            scribeUsable = false;
            return;
          }
          if (settledRef.current || turnRef.current !== turn) return;
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            // She may have finished, or moved on to the next sentence, while the
            // permission prompt was up.
            if (settledRef.current || turnRef.current !== turn) {
              stream.getTracks().forEach((t) => t.stop());
              return;
            }
            streamRef.current = stream;
            // Ask for a container we know Scribe reads, rather than accepting
            // whatever the browser defaults to and having to guess afterwards.
            const preferred = preferredMimeType();
            const recorder = preferred
              ? new MediaRecorder(stream, { mimeType: preferred })
              : new MediaRecorder(stream);
            recorder.ondataavailable = (event) => {
              if (turnRef.current !== turn) return;
              if (event.data.size > 0) chunksRef.current.push(event.data);
            };
            recorder.onstop = () => {
              if (turnRef.current !== turn) return;
              recordingRef.current = false;
              void finishWithRecording();
            };
            recorderRef.current = recorder;
            recordingRef.current = true;
            mimeRef.current = recorder.mimeType || "";
            recorder.start();
            log(`recording for Scribe as ${recorder.mimeType || "unknown format"}`);
          } catch (error) {
            log("microphone unavailable, so no Scribe this turn:", error);
            recordingRef.current = false;
          }
        })();
      }

      timerRef.current = setTimeout(() => stop(), timeoutMs);
    },
    [lang, timeoutMs, settle, stop, finishWithRecording, detachRecorder, releaseMic]
  );

  useEffect(() => {
    return () => {
      settledRef.current = true;
      if (timerRef.current) clearTimeout(timerRef.current);
      try {
        recRef.current?.abort();
      } catch {
        // nothing to abort
      }
      try {
        if (recorderRef.current?.state === "recording") recorderRef.current.stop();
      } catch {
        // nothing to stop
      }
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return { start, stop, isListening, isSupported };
}
