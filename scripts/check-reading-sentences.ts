/** Active difficulty, archive separation, and full-cycle repetition checks. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { SENTENCES, pickNextSentence } from "../app/games/reading-sentences/sentences";
import { ACCESSIBLE_SENTENCES } from "../app/games/reading-sentences/accessible-sentences";
import { ARCHIVED_SENTENCES } from "../app/games/reading-sentences/archived-sentences";

assert.equal(ACCESSIBLE_SENTENCES.length, 250);
assert.equal(SENTENCES.length, 274);
assert.equal(ARCHIVED_SENTENCES.length, 52);
assert(SENTENCES.every(s => s.level === "easy"));
assert(ARCHIVED_SENTENCES.every(s => s.level !== "easy"));
const all = [...SENTENCES, ...ARCHIVED_SENTENCES];
assert.equal(new Set(all.map(s => s.id)).size, all.length);
assert.equal(new Set(all.map(s => s.text.toLowerCase())).size, all.length);
assert(ACCESSIBLE_SENTENCES.every(s => s.imagePrompt && s.text.split(/\s+/).length <= 7));

// Retain every original entry, including image prompts and recognition aids.
const originalEntries = [...SENTENCES.slice(0, 24), ...ARCHIVED_SENTENCES];
assert.equal(originalEntries.length, 76);
assert.equal(
  createHash("sha256").update(JSON.stringify(originalEntries)).digest("hex"),
  "4de46455847a9f038422596be08c12209726d2bf44e82906f861ea3570c69b35",
  "Original sentences, ordering, illustration prompts and speech alternates must stay intact",
);
for (const streak of [0, 4, 8, 10, 100]) {
  const recent: string[] = [];
  for (let i = 0; i < SENTENCES.length; i++) {
    const next = pickNextSentence(streak, recent);
    assert(!recent.includes(next.id));
    assert.equal(next.level, "easy");
    recent.unshift(next.id);
  }
  assert.notEqual(pickNextSentence(streak, recent).id, recent[0]);
}
console.log("OK: 274 accessible sentences, 52 archived, unique full cycles at every streak.");
