"use client";
/**
 * Listening to her read — the one way the games do it.
 *
 * Audio streams to ElevenLabs Scribe over a WebSocket and words come back
 * *while she is still speaking*, roughly 150ms behind her. That timing is the
 * whole point: she will not move on to the next word until the one she just
 * read has chimed, so the feedback has to come from the recogniser that is
 * actually good at hearing a child, not from a faster but worse one.
 *
 * Give it the text she should read — one word or a whole sentence, it makes no
 * difference — and it reports which words have landed as they land, then a
 * verdict when the turn ends.
 *
 *   const speech = useSpeechRecognition({
 *     language: "en",
 *     onProgress: (matched) => setMatchedWords(matched),
 *     onResult: (result) => result.passed ? win() : tryAgain(),
 *   });
 *   speech.start("The cat sat on the mat.");
 *
 * Two rules matter here.
 *
 * Matches are **sticky**. Interim transcripts get revised as more audio
 * arrives, so a word can be heard and then un-heard. On screen that would mean
 * a word lighting up and going dark again, which for a child waiting on the
 * chime is worse than never lighting at all. Once a word has landed it stays
 * landed, and only the final transcript decides pass or fail.
 *
 * And there is no fallback. The browser's own recogniser used to stand behind
 * this and was removed on purpose — it was the thing driving the chimes, and it
 * was the thing getting them wrong. If the connection cannot be made the games
 * say so rather than quietly listening with something worse.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Scribe,
  RealtimeEvents,
  CommitStrategy,
  type RealtimeConnection,
} from "@elevenlabs/client";
import { alignTranscript, mergeSticky, type AlignmentResult } from "./matching";
import { DEFAULT_LANGUAGE, LANGUAGES, type SpeechLanguage } from "./languages";

const MODEL_ID = "scribe_v2_realtime";
const DEFAULT_TIMEOUT_MS = 60_000;

export type SpeechStatus =
  | "idle"
  | "connecting"
  | "listening"
  | "unavailable";

export interface SpeechTarget {
  /** What she is meant to read. */
  text: string;
  /**
   * Extra spellings to accept for a particular word, keyed by the normalised
   * word. For names, mostly — generic fuzziness is handled by the matcher.
   */
  alternates?: Record<string, string[]>;
}

export interface UseSpeechRecognitionOptions {
  language?: SpeechLanguage;
  /** How long a turn may last before it is judged on what was heard. */
  timeoutMs?: number;
  /**
   * A game's own verdict, replacing the shared matcher's.
   *
   * The phonics game needs this: it is teaching the difference between "cat"
   * and "cap", so a single short word must be read exactly, where the shared
   * matcher would forgive one letter. Highlighting still comes from the
   * matcher; only pass or fail is yours.
   */
  judge?: (transcript: string) => boolean;
  /** Called as words land, so the game can light them up. */
  onProgress?: (matched: boolean[], transcript: string) => void;
  /** Called once, when the turn ends. */
  onResult?: (result: AlignmentResult, transcript: string) => void;
  /** Called when listening is impossible, with something a person can read. */
  onUnavailable?: (reason: string) => void;
}

export interface SpeechRecognitionHandle {
  start: (target: string | SpeechTarget) => void;
  stop: () => void;
  isListening: boolean;
  status: SpeechStatus;
  /** Set when listening failed; cleared on the next successful start. */
  error: string | null;
}

const log = (message: string, ...rest: unknown[]) =>
  console.log(`%c[speech] ${message}`, "color:#0a7", ...rest);

async function fetchToken(): Promise<string> {
  const response = await fetch("/api/speech/token", { cache: "no-store" });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || !body?.token) {
    throw new Error(body?.reason ?? `token request failed (${response.status})`);
  }
  return body.token as string;
}

/** What to tell a child's grown-up when listening will not work. */
function explain(reason: string): string {
  switch (reason) {
    case "no-key":
      return "Speech recognition is not set up on this server.";
    case "key-lacks-permission":
      return "The speech key is missing its speech-to-text permission.";
    case "microphone-denied":
      return "The microphone is blocked for this site.";
    case "unreachable":
    case "upstream-error":
      return "Could not reach the speech service. Check the connection.";
    default:
      return "Speech recognition is unavailable right now.";
  }
}

export function useSpeechRecognition(
  options: UseSpeechRecognitionOptions = {}
): SpeechRecognitionHandle {
  const {
    language = DEFAULT_LANGUAGE,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    judge,
    onProgress,
    onResult,
    onUnavailable,
  } = options;

  const [status, setStatus] = useState<SpeechStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  // Callbacks are read through a ref so a re-render never restarts a turn.
  const cbRef = useRef({ judge, onProgress, onResult, onUnavailable });
  useEffect(() => {
    cbRef.current = { judge, onProgress, onResult, onUnavailable };
  }, [judge, onProgress, onResult, onUnavailable]);

  const connectionRef = useRef<RealtimeConnection | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const targetRef = useRef<SpeechTarget>({ text: "" });
  /** Transcript of segments the recogniser has finalised. */
  const committedRef = useRef("");
  /** The segment still being revised. */
  const partialRef = useRef("");
  /** Words that have landed. Only ever gains entries — see the note above. */
  const stickyRef = useRef<boolean[]>([]);
  const settledRef = useRef(false);
  /** Guards the turn against being ended twice by racing callbacks. */
  const turnRef = useRef(0);

  const heard = () => `${committedRef.current} ${partialRef.current}`.trim();

  const teardown = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    const connection = connectionRef.current;
    connectionRef.current = null;
    if (connection) {
      try {
        void connection.close();
      } catch {
        // already closed
      }
    }
    setStatus("idle");
  }, []);

  /** Merge a fresh alignment into the sticky one. Words never go dark. */
  const merge = useCallback((fresh: boolean[]): boolean[] => {
    const merged = mergeSticky(stickyRef.current, fresh);
    stickyRef.current = merged;
    return merged;
  }, []);

  const score = useCallback((): AlignmentResult => {
    const { text, alternates } = targetRef.current;
    const fresh = alignTranscript(text, heard(), alternates, language);
    const matched = merge(fresh.matched);
    const own = cbRef.current.judge;
    const passed = own ? own(heard()) : fresh.passed;
    // A game that says she got it has, by definition, heard every word.
    const shown = passed ? matched.map(() => true) : matched;
    if (passed) stickyRef.current = shown;
    const matchedCount = shown.filter(Boolean).length;
    const total = shown.length;
    return {
      matched: shown,
      matchedCount,
      total,
      score: total === 0 ? 0 : matchedCount / total,
      passed,
    };
  }, [language, merge]);

  const settle = useCallback(
    (result: AlignmentResult) => {
      if (settledRef.current) return;
      settledRef.current = true;
      log(
        `verdict: ${result.matchedCount}/${result.total} words — ` +
          `${result.passed ? "PASS" : "not yet"} — heard "${heard()}"`
      );
      teardown();
      cbRef.current.onResult?.(result, heard());
    },
    [teardown]
  );

  const fail = useCallback(
    (reason: string) => {
      if (settledRef.current) return;
      settledRef.current = true;
      const message = explain(reason);
      log(`unavailable: ${reason}`);
      teardown();
      setStatus("unavailable");
      setError(message);
      cbRef.current.onUnavailable?.(message);
    },
    [teardown]
  );

  const stop = useCallback(() => {
    if (settledRef.current) return;
    const connection = connectionRef.current;
    // Flush whatever is still buffered so the last word is not lost, then
    // judge on everything heard.
    try {
      void connection?.commit?.();
    } catch {
      // nothing to commit
    }
    // The commit may bring one final transcript; give it a moment to arrive.
    setTimeout(() => settle(score()), 400);
  }, [score, settle]);

  const start = useCallback(
    (input: string | SpeechTarget) => {
      const target = typeof input === "string" ? { text: input } : input;
      const turn = ++turnRef.current;

      teardown();
      targetRef.current = target;
      committedRef.current = "";
      partialRef.current = "";
      stickyRef.current = [];
      settledRef.current = false;
      setError(null);
      setStatus("connecting");
      log(`turn ${turn} (${language}) — she should read: "${target.text}"`);

      void (async () => {
        try {
          const token = await fetchToken();
          if (turnRef.current !== turn) return;

          const connection = Scribe.connect({
            token,
            modelId: MODEL_ID,
            languageCode: LANGUAGES[language].code,
            // Manual: a child pauses mid-sentence to work a word out, and
            // voice-activity commits would treat that as the end of the turn.
            commitStrategy: CommitStrategy.MANUAL,
            microphone: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            },
          });

          // She may have stopped, or moved on, while this was connecting.
          if (turnRef.current !== turn || settledRef.current) {
            void connection.close();
            return;
          }
          connectionRef.current = connection;
          setStatus("listening");

          connection.on(RealtimeEvents.OPEN, () => log("socket open"));
          connection.on(RealtimeEvents.SESSION_STARTED, () => log("session started — listening"));

          connection.on(RealtimeEvents.PARTIAL_TRANSCRIPT, (data) => {
            if (turnRef.current !== turn || settledRef.current) return;
            partialRef.current = data?.text ?? "";
            const result = score();
            cbRef.current.onProgress?.(result.matched, heard());
            log(`…hearing "${heard()}" (${result.matchedCount}/${result.total})`);
            // She has read it — do not make her wait out the timer.
            if (result.passed) settle(result);
          });

          connection.on(RealtimeEvents.COMMITTED_TRANSCRIPT, (data) => {
            if (turnRef.current !== turn || settledRef.current) return;
            committedRef.current = `${committedRef.current} ${data?.text ?? ""}`.trim();
            partialRef.current = "";
            const result = score();
            cbRef.current.onProgress?.(result.matched, heard());
            if (result.passed) settle(result);
          });

          connection.on(RealtimeEvents.AUTH_ERROR, () => fail("key-lacks-permission"));
          connection.on(RealtimeEvents.QUOTA_EXCEEDED, () => fail("quota"));
          connection.on(RealtimeEvents.ERROR, (data) => {
            log("recogniser error:", data);
          });
          connection.on(RealtimeEvents.CLOSE, () => {
            if (turnRef.current !== turn || settledRef.current) return;
            // Closed early without a verdict — judge on what was heard.
            settle(score());
          });

          timerRef.current = setTimeout(() => stop(), timeoutMs);
        } catch (caught) {
          if (turnRef.current !== turn) return;
          const message = caught instanceof Error ? caught.message : String(caught);
          fail(/permission|denied|NotAllowed/i.test(message) ? "microphone-denied" : message);
        }
      })();
    },
    [language, timeoutMs, teardown, score, settle, fail, stop]
  );

  useEffect(
    () => () => {
      settledRef.current = true;
      turnRef.current += 1;
      teardown();
    },
    [teardown]
  );

  return {
    start,
    stop,
    isListening: status === "listening" || status === "connecting",
    status,
    error,
  };
}
