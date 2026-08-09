/**
 * Whole-sentence speech matching.
 *
 * A six-year-old reading aloud in English with a French accent, through a
 * recogniser that guesses, will never produce the target string exactly. So we
 * never compare strings. Instead we align what was heard against the words of
 * the sentence, in order, allowing for:
 *
 *   - misspellings and mishearings   ("draggon" for "dragon")   — edit distance
 *   - words it split or joined       ("cup cake" / "cupcake")   — join/split
 *   - digits written as numerals     ("6" for "six")            — normalisation
 *
 * She has to read every word — skipping "the" is still not reading the
 * sentence. The forgiveness sits at the level of the individual word instead:
 * one she says but the recogniser garbles still counts, so she is never
 * punished for the microphone's mistakes, only for her own.
 */

const DIGIT_WORDS: Record<string, string> = {
  "0": "zero",
  "1": "one",
  "2": "two",
  "3": "three",
  "4": "four",
  "5": "five",
  "6": "six",
  "7": "seven",
  "8": "eight",
  "9": "nine",
  "10": "ten",
};

/** Words the recogniser drops or invents constantly; they cost nothing. */
const FILLER = new Set(["um", "uh", "er", "erm", "ah", "mm", "hmm"]);

/**
 * Homophones, folded onto one spelling.
 *
 * "The rat ate all my jam" kept being heard as "eight all my jam" and marked
 * wrong — but she read it perfectly. No recogniser can tell "ate" from "eight";
 * they are the same sound, and which spelling comes back is the recogniser's
 * guess about meaning, not a fact about what she said. So every group below
 * collapses to a single form before anything is compared, and she is never
 * marked down for a distinction that is not audible.
 *
 * Each line is one group; the first entry is arbitrary — only sameness matters.
 */
const HOMOPHONE_GROUPS = [
  ["ate", "eight"],
  ["to", "too", "two"],
  ["for", "four", "fore"],
  ["there", "their", "theyre"],
  ["here", "hear"],
  ["see", "sea"],
  ["be", "bee"],
  ["blue", "blew"],
  ["know", "no"],
  ["new", "knew"],
  ["one", "won"],
  ["right", "write", "rite"],
  ["sun", "son"],
  ["so", "sew"],
  ["tail", "tale"],
  ["wait", "weight"],
  ["way", "weigh"],
  ["week", "weak"],
  ["wood", "would"],
  ["our", "hour"],
  ["by", "buy", "bye"],
  ["flower", "flour"],
  ["hair", "hare"],
  ["made", "maid"],
  ["mail", "male"],
  ["meat", "meet"],
  ["pair", "pear", "pare"],
  ["plain", "plane"],
  ["rain", "reign", "rein"],
  ["road", "rode", "rowed"],
  ["sail", "sale"],
  ["some", "sum"],
  ["whole", "hole"],
  ["red", "read"],
  ["bear", "bare"],
  ["deer", "dear"],
  ["tea", "tee"],
  ["night", "knight"],
  ["not", "knot"],
  ["nose", "knows"],
  ["eye", "i"],
  ["ant", "aunt"],
  ["ball", "bawl"],
  ["break", "brake"],
  ["die", "dye"],
  ["fair", "fare"],
  ["flea", "flee"],
  ["great", "grate"],
  ["grown", "groan"],
  ["heel", "heal"],
  ["hi", "high"],
  ["in", "inn"],
  ["main", "mane"],
  ["peace", "piece"],
  ["poor", "pour", "pore", "paw"],
  ["real", "reel"],
  ["ring", "wring"],
  ["root", "route"],
  ["rose", "rows"],
  ["seem", "seam"],
  ["steal", "steel"],
  ["sweet", "suite"],
  ["threw", "through"],
  ["thrown", "throne"],
  ["toe", "tow"],
  ["waist", "waste"],
  ["which", "witch"],
  ["your", "youre"],
  ["its", "it's"],
  ["bored", "board"],
  ["cheap", "cheep"],
  ["chews", "choose"],
  ["hi", "high"],
  ["mist", "missed"],
  ["stair", "stare"],
  ["tide", "tied"],
];

const HOMOPHONES = new Map<string, string>();
for (const group of HOMOPHONE_GROUPS) {
  const canonical = group[0].replace(/[^a-z0-9]/g, "");
  for (const word of group) {
    HOMOPHONES.set(word.replace(/[^a-z0-9]/g, ""), canonical);
  }
}

export function normalizeWord(raw: string): string {
  const cleaned = raw
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]/g, "");
  const spelled = DIGIT_WORDS[cleaned] ?? cleaned;
  return HOMOPHONES.get(spelled) ?? spelled;
}

export function tokenize(text: string): string[] {
  return text
    .split(/\s+/)
    .map(normalizeWord)
    .filter((w) => w.length > 0 && !FILLER.has(w));
}

/** The words of the sentence exactly as they should be shown, with punctuation. */
export function displayWords(text: string): string[] {
  return text.split(/\s+/).filter(Boolean);
}

export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  let curr = new Array<number>(b.length + 1);

  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[b.length];
}

/** How wrong a word of this length is allowed to be and still count. */
function tolerance(length: number): number {
  if (length <= 3) return 1;
  if (length <= 5) return 1;
  if (length <= 8) return 2;
  return 3;
}

export function wordsMatch(
  target: string,
  spoken: string,
  alternates?: string[]
): boolean {
  if (!target || !spoken) return false;
  if (target === spoken) return true;
  if (alternates?.includes(spoken)) return true;

  // Plural / tense endings the recogniser adds or drops.
  if (target.length >= 3 && (spoken === `${target}s` || `${spoken}s` === target)) {
    return true;
  }

  // Long words that start the same are almost always the same word.
  if (target.length >= 5 && spoken.length >= 5) {
    const prefix = Math.min(target.length, spoken.length, 5);
    if (target.slice(0, prefix) === spoken.slice(0, prefix)) return true;
  }

  return levenshtein(target, spoken) <= tolerance(target.length);
}

/**
 * Comparison for the split/join cases, which have to be stricter than ordinary
 * word matching. The generous edit distance used elsewhere would happily glue a
 * skipped "a" onto the next word — "a"+"rock" is one edit from "rock" — and
 * credit her with a word she never said.
 */
function joinedMatch(target: string, spoken: string): boolean {
  if (!target || !spoken) return false;
  if (target === spoken) return true;
  return Math.min(target.length, spoken.length) >= 5 && levenshtein(target, spoken) <= 1;
}

export interface AlignmentResult {
  /** One entry per word of the sentence: was it heard? */
  matched: boolean[];
  matchedCount: number;
  total: number;
  /** Fraction of the sentence heard, 0..1. */
  score: number;
  passed: boolean;
}

/**
 * Walks the sentence and the transcript together from `start`, only ever moving
 * forwards. The small lookahead lets a stray extra word in the transcript slide
 * past without knocking everything after it out of alignment.
 */
function alignFrom(
  target: string[],
  spoken: string[],
  start: number,
  alternates?: Record<string, string[]>
): boolean[] {
  const matched = new Array<boolean>(target.length).fill(false);

  const LOOKAHEAD = 3;
  let cursor = start;

  for (let i = 0; i < target.length; i++) {
    const word = target[i];
    const alts = alternates?.[word]?.map(normalizeWord);
    const limit = Math.min(spoken.length, cursor + LOOKAHEAD + 1);

    for (let j = cursor; j < limit; j++) {
      if (wordsMatch(word, spoken[j], alts)) {
        matched[i] = true;
        cursor = j + 1;
        break;
      }
      // The recogniser split one word in two: "cup cake" for "cupcake".
      if (j + 1 < spoken.length && joinedMatch(word, spoken[j] + spoken[j + 1])) {
        matched[i] = true;
        cursor = j + 2;
        break;
      }
      // The recogniser joined two of ours into one: "intothe" for "into the".
      if (i + 1 < target.length && joinedMatch(word + target[i + 1], spoken[j])) {
        matched[i] = true;
        matched[i + 1] = true;
        cursor = j + 1;
        i++;
        break;
      }
    }
  }

  return matched;
}

/**
 * Score a transcript against the sentence.
 *
 * She often has a false start — reads "sun is very hot today", realises she
 * dropped "The", and goes again from the top. A single pass from the beginning
 * can never recover from that: the first word is missed and the cursor has
 * already moved past it. So every starting point in the transcript is tried and
 * the best reading wins, which means a clean second attempt counts for exactly
 * as much as getting it right first time.
 */
export function alignTranscript(
  sentenceText: string,
  transcript: string,
  alternates?: Record<string, string[]>
): AlignmentResult {
  const target = tokenize(sentenceText);
  const spoken = tokenize(transcript);

  let matched = new Array<boolean>(target.length).fill(false);
  let best = -1;
  for (let start = 0; start < Math.max(1, spoken.length); start++) {
    const attempt = alignFrom(target, spoken, start, alternates);
    const count = attempt.filter(Boolean).length;
    if (count > best) {
      best = count;
      matched = attempt;
      if (count === target.length) break; // Cannot do better than all of them.
    }
  }

  const matchedCount = matched.filter(Boolean).length;
  const total = target.length;
  const score = total === 0 ? 0 : matchedCount / total;

  // Every word has to be read. The tolerance lives one level down, in
  // `wordsMatch`: a word she reads but the recogniser mangles still counts, so
  // this is strict about *what* she read without being strict about spelling.
  const passed = total > 0 && matchedCount === total;

  return { matched, matchedCount, total, score, passed };
}
