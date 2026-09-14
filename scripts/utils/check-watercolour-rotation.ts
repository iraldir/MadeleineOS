import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { halfDaySeed, youtubeService } from '../../services/youtubeService';

const pool = youtubeService.getVideosByCategory('watercolour');
assert.ok(pool.length >= 30, 'Keep at least 30 curated lessons');
assert.equal(new Set(pool.map(v => v.youtubeId)).size, pool.length);
assert.ok(existsSync(`public${youtubeService.getCategory('watercolour')!.icon}`));
assert.deepEqual(youtubeService.getVideosForDisplay('watercolour', null), pool);

const covered = new Set<string>();
let previous = '';
for (let halfDay = 0; halfDay < 180; halfDay++) {
  const date = new Date(2026, 8, 14 + Math.floor(halfDay / 2), halfDay % 2 ? 18 : 9);
  const seed = halfDaySeed(date);
  const picks = youtubeService.getVideosForDisplay('watercolour', seed);
  assert.equal(picks.length, 5);
  assert.equal(new Set(picks.map(v => v.id)).size, 5);
  assert.deepEqual(youtubeService.getVideosForDisplay('watercolour', seed), picks);
  date.setMinutes(59);
  assert.deepEqual(youtubeService.getVideosForDisplay('watercolour', halfDaySeed(date)), picks);
  const subjects = picks.map(v => v.subject).filter(Boolean);
  assert.equal(new Set(subjects).size, subjects.length, 'Avoid duplicate subjects');
  for (const [field, cap] of [['channel', 3], ['franchise', 2]] as const) {
    for (const pick of picks) {
      assert.ok(picks.filter(v => v[field] === pick[field]).length <= cap, `${seed}: ${field} cap`);
    }
  }
  for (const pick of picks) {
    assert.ok(pool.some(v => v.id === pick.id));
    covered.add(pick.id);
  }
  const signature = picks.map(v => v.id).sort().join();
  assert.notEqual(signature, previous, 'Consecutive half-days should have different selections');
  previous = signature;
}
assert.equal(covered.size, pool.length, 'Every lesson should appear across the sampled rotations');
for (const category of ['yoga', 'songs'] as const) {
  assert.deepEqual(youtubeService.getVideosForDisplay(category, '2026-09-14-am'), youtubeService.getVideosByCategory(category));
}
console.log(`Watercolour: 180 half-days checked; five per selection; ${covered.size}/${pool.length} lessons shown; all checks passed.`);
