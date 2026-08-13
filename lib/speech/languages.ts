/**
 * The languages the games can listen in.
 *
 * Only English is used today — both reading games are English — but the
 * recogniser handles 90-odd languages and Madeleine is also read to in French
 * and Italian, so a game that wants either should not have to reopen this
 * machinery. A language is a recogniser code plus the small amount of local
 * knowledge the matcher needs to be fair.
 */

export type SpeechLanguage = "en" | "fr" | "it";

export interface LanguageConfig {
  /** ISO-639 code handed to the recogniser. */
  code: string;
  /** Numerals as the child would read them aloud. */
  digits: Record<string, string>;
  /** Noises the recogniser invents or drops; they cost nothing either way. */
  filler: string[];
  /**
   * Words that sound identical. Each line is one group and collapses onto its
   * first entry before anything is compared, because no recogniser can tell
   * them apart — which spelling comes back is its guess at meaning, not a fact
   * about what was said.
   */
  homophones: string[][];
}

const EN_DIGITS: Record<string, string> = {
  "0": "zero", "1": "one", "2": "two", "3": "three", "4": "four",
  "5": "five", "6": "six", "7": "seven", "8": "eight", "9": "nine", "10": "ten",
};

const FR_DIGITS: Record<string, string> = {
  "0": "zero", "1": "un", "2": "deux", "3": "trois", "4": "quatre",
  "5": "cinq", "6": "six", "7": "sept", "8": "huit", "9": "neuf", "10": "dix",
};

const IT_DIGITS: Record<string, string> = {
  "0": "zero", "1": "uno", "2": "due", "3": "tre", "4": "quattro",
  "5": "cinque", "6": "sei", "7": "sette", "8": "otto", "9": "nove", "10": "dieci",
};

/** English homophones — the set that earns its keep today. */
const EN_HOMOPHONES: string[][] = [
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

/**
 * French and Italian starter sets.
 *
 * Deliberately short: these are the ones certain to matter (French especially,
 * where whole verb endings are silent), not an attempt at a complete list. Add
 * to them when a game in that language actually starts failing on a word.
 */
const FR_HOMOPHONES: string[][] = [
  ["a", "à"],
  ["et", "est"],
  ["ou", "où"],
  ["son", "sont"],
  ["ces", "ses", "c'est", "s'est", "sait", "sais"],
  ["mes", "mais", "met", "mets"],
  ["on", "ont"],
  ["se", "ce"],
  ["la", "là", "l'a"],
  ["peu", "peux", "peut"],
  ["vert", "verre", "vers", "ver"],
  ["mer", "mère", "maire"],
  ["père", "paire", "perd"],
  ["cent", "sang", "sans", "s'en"],
  ["vin", "vingt", "vain"],
  ["eau", "haut", "au"],
  ["foie", "fois", "foi"],
  ["temps", "tant", "t'en"],
  ["voie", "voix", "vois", "voit"],
  ["tout", "toux"],
];

const IT_HOMOPHONES: string[][] = [
  ["a", "ha"],
  ["ai", "hai"],
  ["anno", "hanno"],
  ["o", "ho"],
  ["e", "è"],
  ["li", "lì"],
  ["la", "là"],
  ["si", "sì"],
  ["da", "dà"],
  ["ne", "né"],
  ["se", "sé"],
  ["ce", "c'è"],
];

export const LANGUAGES: Record<SpeechLanguage, LanguageConfig> = {
  en: { code: "eng", digits: EN_DIGITS, filler: ["um", "uh", "er", "erm", "ah", "mm", "hmm"], homophones: EN_HOMOPHONES },
  fr: { code: "fra", digits: FR_DIGITS, filler: ["euh", "heu", "hum", "ben", "bah"], homophones: FR_HOMOPHONES },
  it: { code: "ita", digits: IT_DIGITS, filler: ["ehm", "eh", "mmm", "boh"], homophones: IT_HOMOPHONES },
};

export const DEFAULT_LANGUAGE: SpeechLanguage = "en";
