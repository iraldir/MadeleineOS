/** Advertised artwork must exist; sentence reading also supports a star reward. */
import * as fs from "node:fs";
import { pickNextSentence, SENTENCES, hasSentenceImage } from "../app/games/reading-sentences/sentences";
import { pickNextWord, EASY, MEDIUM, HARD, imageFilename } from "../app/games/phonics/words";

let bad = 0;
for (let i = 0; i < 4000; i++) {
  const streak = i % 12;
  const s = pickNextSentence(streak, []);
  if (hasSentenceImage(s) && !fs.existsSync(`public/images/sentences/${s.id}.webp`)) {
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
console.log(`sentences illustrated: ${readyS}/${SENTENCES.length}`);
console.log(`words playable:     ${readyW}/${all.length}`);
console.log(bad === 0 ? "OK — available illustrations exist; unillustrated sentences use a star" : `${bad} problems`);
