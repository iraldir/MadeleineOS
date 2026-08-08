/**
 * Sanity check for the twice-daily drawing rotation.
 * Verifies each half-day yields 12 videos, that consecutive half-days differ,
 * that the picks aren't a contiguous slice of the list, and that the
 * channel/franchise caps hold.
 *
 * Run: npx tsx scripts/utils/check-drawing-rotation.ts
 */
import { youtubeService, halfDaySeed, Video } from "../../services/youtubeService";

const pool = youtubeService.getVideosByCategory("drawing");
const index = new Map(pool.map((v, i) => [v.id, i]));
const seen: string[][] = [];
let failures = 0;

function fail(msg: string) { console.error("FAIL " + msg); failures++; }

for (let day = 0; day < 20; day++) {
  for (const hour of [9, 18]) {
    const when = new Date(2026, 7, 8 + day, hour, 30);
    const seed = halfDaySeed(when);
    const picks = youtubeService.getVideosForDisplay("drawing", seed);

    if (picks.length !== 12) fail(`${seed}: got ${picks.length} videos`);
    if (new Set(picks.map(p => p.id)).size !== picks.length) fail(`${seed}: duplicates`);

    const chan = new Map<string, number>(), fran = new Map<string, number>();
    for (const p of picks) {
      chan.set(p.channel!, (chan.get(p.channel!) ?? 0) + 1);
      fran.set(p.franchise!, (fran.get(p.franchise!) ?? 0) + 1);
    }
    for (const [c, n] of chan) if (n > 3) fail(`${seed}: ${n} from channel ${c}`);
    for (const [f, n] of fran) if (n > 3) fail(`${seed}: ${n} from franchise ${f}`);

    const subjects = picks.map(p => p.subject).filter(Boolean);
    if (new Set(subjects).size !== subjects.length) fail(`${seed}: same character taught twice`);

    // Determinism: same seed, same answer.
    const again = youtubeService.getVideosForDisplay("drawing", seed);
    if (again.map(v => v.id).join() !== picks.map(v => v.id).join()) fail(`${seed}: not deterministic`);
    // Same half-day at a different minute is the same line-up.
    const later = youtubeService.getVideosForDisplay("drawing", halfDaySeed(new Date(2026, 7, 8 + day, hour, 59)));
    if (later.map(v => v.id).join() !== picks.map(v => v.id).join()) fail(`${seed}: drifts within the half-day`);

    // Shuffled, not a slice: positions in the source list should be scattered.
    const positions = picks.map(p => index.get(p.id)!).sort((a, b) => a - b);
    const span = positions[positions.length - 1] - positions[0];
    if (span < pool.length / 2) fail(`${seed}: picks span only ${span} of ${pool.length}`);

    seen.push(picks.map(v => v.id));
    const chans = [...chan.entries()].map(([c, n]) => `${c}x${n}`).join(", ");
    console.log(`${seed}  franchises=${fran.size} channels=${chan.size}  ${chans}`);
  }
}

// Consecutive half-days should look different from each other.
for (let i = 1; i < seen.length; i++) {
  const overlap = seen[i].filter(id => seen[i - 1].includes(id)).length;
  if (overlap > 6) fail(`half-day ${i} repeats ${overlap}/12 of the previous set`);
}
const uniqueSets = new Set(seen.map(s => [...s].sort().join()));
if (uniqueSets.size !== seen.length) fail(`only ${uniqueSets.size} distinct sets in ${seen.length} half-days`);

const coverage = new Set(seen.flat()).size;
console.log(`\n${seen.length} half-days, ${uniqueSets.size} distinct line-ups, ${coverage}/${pool.length} of the pool shown`);
console.log(failures === 0 ? "ALL CHECKS PASSED" : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);
