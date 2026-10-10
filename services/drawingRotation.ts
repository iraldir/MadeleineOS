import type { Video } from './youtubeService';

/** Balanced quotas are hard constraints; creator/theme caps are preferences. */
export function pickBalancedDrawingRotation(
  shuffled: readonly Video[],
  size: number,
  maxPerChannel: number,
  maxPerFranchise: number,
): Video[] {
  const kinds = ['character', 'generic'] as const;
  const pool = shuffled.filter(v => v.drawingKind && v.subject);
  const available = kinds.map(kind => new Set(pool.filter(v => v.drawingKind === kind).map(v => v.subject)).size);
  const quota = Math.min(Math.floor(size / 2), ...available);

  // Backtracking avoids a greedy early choice needlessly breaking global caps.
  // Search is bounded to keep the category screen responsive on small devices.
  for (let target = quota; target > 0; target--) {
    for (const relaxation of [0, 1, Infinity]) {
      const picked: Video[] = [];
      const ids = new Set<string>();
      const youtubeIds = new Set<string>();
      const subjects = new Set<string>();
      const counts = { character: 0, generic: 0 };
      const channels = new Map<string, number>();
      const themes = new Map<string, number>();
      let attempts = 0;
      const bump = (map: Map<string, number>, key: string, delta: number) => map.set(key, (map.get(key) ?? 0) + delta);
      const search = (start: number): boolean => {
        if (picked.length === target * 2) return true;
        if (++attempts > 20000) return false;
        for (const kind of kinds) {
          const remaining = new Set(pool.slice(start)
            .filter(v => v.drawingKind === kind && !subjects.has(v.subject!))
            .map(v => v.subject));
          if (remaining.size < target - counts[kind]) return false;
        }
        for (let i = start; i < pool.length; i++) {
          const video = pool[i];
          const kind = video.drawingKind!;
          const subject = video.subject!;
          const channel = video.channel ?? video.id;
          const theme = video.franchise ?? video.id;
          if (counts[kind] >= target || ids.has(video.id) || youtubeIds.has(video.youtubeId) || subjects.has(subject)) continue;
          if ((channels.get(channel) ?? 0) >= maxPerChannel + relaxation) continue;
          if ((themes.get(theme) ?? 0) >= maxPerFranchise + relaxation) continue;
          picked.push(video);
          counts[kind]++;
          ids.add(video.id); youtubeIds.add(video.youtubeId); subjects.add(subject);
          bump(channels, channel, 1); bump(themes, theme, 1);
          if (search(i + 1)) return true;
          picked.pop();
          counts[kind]--;
          ids.delete(video.id); youtubeIds.delete(video.youtubeId); subjects.delete(subject);
          bump(channels, channel, -1); bump(themes, theme, -1);
          if (attempts > 20000) return false;
        }
        return false;
      };
      if (search(0)) return picked;
    }
  }
  return [];
}
