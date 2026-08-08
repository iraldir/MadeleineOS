/** Nothing the games can offer should be missing its illustration. */
import * as fs from "node:fs";
import { pickNextSentence, SENTENCES } from "../app/games/reading-sentences/sentences";
import { pickNextWord, EASY, MEDIUM, HARD, imageFilename } from "../app/games/phonics/words";

let bad = 0;
for (let i = 0; i < 4000; i++) {
  const streak = i % 12;
  const s = pickNextSentence(streak, []);
  if (!fs.existsSync(`public/images/sentences/${s.id}.webp`)) {
    console.log(`MISSING sentence illustration: ${s.id}`); bad++;
  }
  const w = pickNextWord(streak, []);
  if (!fs.existsSync(`public/images/phonics/${imageFilename(w)}`)) {
    console.log(`MISSING word illustration: ${w.word}`); bad++;
  }
  if (bad > 5) break;
}
const readyS = SENTENCES.filter(s => fs.existsSync(`public/images/sentences/${s.id}.webp`)).length;
const all = [...EASY, ...MEDIUM, ...HARD];
const readyW = all.filter(w => fs.existsSync(`public/images/phonics/${imageFilename(w)}`)).length;
console.log(`sentences playable: ${readyS}/${SENTENCES.length}`);
console.log(`words playable:     ${readyW}/${all.length}`);
console.log(bad === 0 ? "OK — every item offered has its picture" : `${bad} problems`);
