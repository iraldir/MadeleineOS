import { alignTranscript } from "../app/games/reading-sentences/matching";

const cases: [string, string, boolean][] = [
  // The exact failure from the log: leading "The" dropped, then read again.
  ["The sun is very hot today.",
   "sun is very hot today the  sun  is very hot today", true],
  // First attempt alone, never corrected — should still fail.
  ["The sun is very hot today.", "sun is very hot today", false],
  // Clean single read.
  ["The sun is very hot today.", "the sun is very hot today", true],
  // A mangled word she did say still counts.
  ["The dragon sat on a rock.", "the draggon sat on a rock", true],
  // Genuinely skipping a word still fails.
  ["The dragon sat on a rock.", "the dragon sat on rock", false],
  // Three false starts before getting it out.
  ["A big dog can run fast.", "big dog  a big  a big dog can run fast", true],
  // Reading a different sentence entirely.
  ["The sun is very hot today.", "the cat sat on the mat", false],
];

let ok = 0;
for (const [sentence, heard, expected] of cases) {
  const r = alignTranscript(sentence, heard);
  const good = r.passed === expected;
  if (good) ok++;
  console.log(
    `${good ? "ok  " : "BAD "} ${r.matchedCount}/${r.total} passed=${r.passed} (want ${expected})\n     "${heard}"`
  );
}
console.log(`\n${ok}/${cases.length} as expected`);

// Split/join must still work now that it is stricter.
const joins: [string, string, boolean][] = [
  ["I ate a cupcake.", "i ate a cup cake", true],
  ["She ran into the house.", "she ran intothe house", true],
  ["The dragon sat on a rock.", "the dragon sat on rock", false],
  ["A big dog can run fast.", "big dog can run fast", false],
];
let ok2 = 0;
for (const [sentence, heard, expected] of joins) {
  const r = alignTranscript(sentence, heard);
  const good = r.passed === expected;
  if (good) ok2++;
  console.log(`${good ? "ok  " : "BAD "} ${r.matchedCount}/${r.total} passed=${r.passed} (want ${expected})  "${heard}"`);
}
console.log(`${ok2}/${joins.length} split-join cases as expected`);

// Homophones: the recogniser cannot hear the difference, so neither should we.
const homophones: [string, string, boolean][] = [
  ["The rat ate all my jam.", "the rat eight all my jam", true],   // the real failure
  ["The rat ate all my jam.", "the rat ate all my jam", true],
  ["I can see the sea.", "i can sea the see", true],
  ["We went to the park.", "we went two the park", true],
  ["He has four red hats.", "he has for red hats", true],
  ["The knight rode at night.", "the night road at knight", true],
  ["The rat ate all my jam.", "the rat all my jam", false],        // genuinely skipped
];
let ok3 = 0;
for (const [sentence, heard, expected] of homophones) {
  const r = alignTranscript(sentence, heard);
  const good = r.passed === expected;
  if (good) ok3++;
  console.log(`${good ? "ok  " : "BAD "} ${r.matchedCount}/${r.total} passed=${r.passed} (want ${expected})  "${heard}"`);
}
console.log(`${ok3}/${homophones.length} homophone cases as expected`);
