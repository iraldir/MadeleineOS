"use client";
/**
 * The sound a word makes when she reads it.
 *
 * Synthesised rather than a recorded sample, because the point is that the
 * pitch *climbs*: word one is low, and each word after it steps up the scale,
 * so getting to the end of a sentence sounds like an ascending run resolving.
 * A single repeated "ding" would just be a metronome.
 *
 * A pentatonic scale is used so no two steps can clash, however many words the
 * sentence turns out to have.
 */

/** C major pentatonic, two octaves. Nothing in it can sound wrong together. */
const SCALE = [
  523.25, 587.33, 659.25, 783.99, 880.0, // C5 D5 E5 G5 A5
  1046.5, 1174.66, 1318.51, 1567.98, 1760.0, // C6 D6 E6 G6 A6
];

let ctx: AudioContext | null = null;

function context(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  // Browsers park the context until a gesture; the mic tap is that gesture.
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

/**
 * Play the chime for the nth word she has got right.
 *
 * Two detuned oscillators through a quick decay give it a marimba-ish knock
 * rather than the flat beep of a single sine.
 */
export function playWordChime(index: number): void {
  const audio = context();
  if (!audio) return;

  const now = audio.currentTime;
  const frequency = SCALE[Math.min(index, SCALE.length - 1)];

  const gain = audio.createGain();
  gain.connect(audio.destination);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.22, now + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.38);

  for (const [wave, detune, level] of [
    ["triangle", 0, 1],
    ["sine", 7, 0.6],
  ] as const) {
    const osc = audio.createOscillator();
    osc.type = wave;
    osc.frequency.setValueAtTime(frequency, now);
    osc.detune.setValueAtTime(detune, now);
    // A touch of downward bend, the way a struck bar settles.
    osc.frequency.exponentialRampToValueAtTime(frequency * 0.995, now + 0.38);

    const voice = audio.createGain();
    voice.gain.setValueAtTime(level, now);
    osc.connect(voice);
    voice.connect(gain);
    osc.start(now);
    osc.stop(now + 0.4);
  }
}

/** The flourish when the last word lands: the run, finished. */
export function playSentenceComplete(wordCount: number): void {
  const audio = context();
  if (!audio) return;
  const top = Math.min(wordCount, SCALE.length - 1);
  [top - 2, top, Math.min(top + 2, SCALE.length - 1)].forEach((step, i) => {
    if (step < 0) return;
    window.setTimeout(() => playWordChime(step), i * 70);
  });
}
