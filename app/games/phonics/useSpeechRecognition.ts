import { useCallback, useEffect, useRef, useState } from "react";

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  onresult: ((e: SpeechRecognitionResultEventLike) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

type SpeechRecognitionResultEventLike = {
  resultIndex: number;
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
};

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

interface UseSpeechRecognitionOptions {
  lang?: string;
  timeoutMs?: number;
  onInterim?: (transcript: string) => void;
  onMatch?: (transcript: string) => void;
  shouldMatch?: (transcript: string) => boolean;
  onFinish?: (matched: boolean, lastTranscript: string) => void;
}

export interface SpeechRecognitionHook {
  start: () => void;
  stop: () => void;
  isListening: boolean;
  isSupported: boolean;
  lastTranscript: string;
}

function getCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export function useSpeechRecognition(
  options: UseSpeechRecognitionOptions
): SpeechRecognitionHook {
  const { lang = "en-US", timeoutMs = 6000, onInterim, onMatch, shouldMatch, onFinish } = options;

  const [isListening, setIsListening] = useState(false);
  const [lastTranscript, setLastTranscript] = useState("");
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const matchedRef = useRef(false);
  const lastTranscriptRef = useRef("");

  const cbRef = useRef({ onInterim, onMatch, shouldMatch, onFinish });
  useEffect(() => {
    cbRef.current = { onInterim, onMatch, shouldMatch, onFinish };
  }, [onInterim, onMatch, shouldMatch, onFinish]);

  const isSupported = getCtor() !== null;

  const stop = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    const rec = recRef.current;
    if (rec) {
      try {
        rec.stop();
      } catch {
        // ignore
      }
    }
  }, []);

  const start = useCallback(() => {
    const Ctor = getCtor();
    if (!Ctor) return;
    if (recRef.current) {
      try {
        recRef.current.abort();
      } catch {
        // ignore
      }
      recRef.current = null;
    }

    matchedRef.current = false;
    lastTranscriptRef.current = "";
    setLastTranscript("");

    const rec = new Ctor();
    rec.lang = lang;
    rec.interimResults = true;
    rec.maxAlternatives = 3;
    rec.continuous = true;

    rec.onresult = (e) => {
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const result = e.results[i];
        for (let a = 0; a < result.length; a++) {
          const transcript = result[a].transcript;
          lastTranscriptRef.current = transcript;
          setLastTranscript(transcript);
          cbRef.current.onInterim?.(transcript);
          if (!matchedRef.current && cbRef.current.shouldMatch?.(transcript)) {
            matchedRef.current = true;
            cbRef.current.onMatch?.(transcript);
            try {
              rec.stop();
            } catch {
              // ignore
            }
            return;
          }
        }
      }
    };

    rec.onerror = (event) => {
      if (event.error !== "no-speech" && event.error !== "aborted") {
        console.warn("[useSpeechRecognition] error:", event.error);
      }
    };

    rec.onend = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setIsListening(false);
      const matched = matchedRef.current;
      cbRef.current.onFinish?.(matched, lastTranscriptRef.current);
      recRef.current = null;
    };

    recRef.current = rec;
    try {
      rec.start();
      setIsListening(true);
      timeoutRef.current = setTimeout(() => {
        try {
          rec.stop();
        } catch {
          // ignore
        }
      }, timeoutMs);
    } catch (err) {
      console.warn("[useSpeechRecognition] start failed:", err);
      setIsListening(false);
      recRef.current = null;
    }
  }, [lang, timeoutMs]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      const rec = recRef.current;
      if (rec) {
        try {
          rec.abort();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  return { start, stop, isListening, isSupported, lastTranscript };
}
