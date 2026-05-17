/**
 * Add a curated list of drawing videos to youtubeService.ts.
 * One-off: the 30 picks from the discovery + curation pass on 2026-05-17.
 *
 * Pulls full metadata (thumbnail, duration) from the discovery JSON cache so
 * we don't have to re-hit the YouTube API.
 */
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { youtubeManager } from "./youtube-manager";

interface DiscoveryEntry {
  youtubeId: string;
  title: string;
  channelTitle: string;
  duration?: string;
  viewCount?: number;
  thumbnail: string;
}

const PICKS: string[] = [
  // Nature
  "zY1269CaCFk", "NLWNOafqfh0", "jkkJNhsrhKo", "i_pQWFkZJrc", "Dt4SD4e2Z6E", "hTOnVBgpPNE",
  // Princesses
  "jBfMs-YskHo", "R4TgExfr12I", "twAox47nBes", "kvpkTj-6EZw", "s9c_ZISjh-8", "YBwoGTvsA2Q",
  // Nintendo
  "ySdXMv7PY6I", "aN-HP2z2MF4", "x7cVh0ddaCs", "_aHGaUZnRJc", "2iUpNsSaWds", "mDqV3sFDpcU", "YwV9I9RbvAw", "7x5v_tt1az0",
  // General
  "UW6H5dAPuhY", "WonItzkHl9g", "WLoPNgIp6go", "iBcLL9y3FSw", "OF2Oe7_QFdU",
  // Channel uploads
  "7fTwIhTI2q8", "bmYHe083qt4", "QlPxeBM1ioE", "F6fzGD2aOmg", "wdNcCvRvsUQ",
];

async function main() {
  const cachePath = path.join(__dirname, "discover-drawing.suggestions.json");
  const allCandidates: DiscoveryEntry[] = JSON.parse(await fs.readFile(cachePath, "utf-8"));
  const byId = new Map(allCandidates.map(c => [c.youtubeId, c]));

  const videos = PICKS.map(id => {
    const c = byId.get(id);
    if (!c) throw new Error(`Pick ${id} not found in discovery cache`);
    return {
      youtubeId: c.youtubeId,
      title: c.title,
      thumbnail: c.thumbnail || `https://i.ytimg.com/vi/${c.youtubeId}/hqdefault.jpg`,
      duration: c.duration,
    };
  });

  // Reverse so the first pick on the list ends up topmost in the array
  // (the manager prepends each entry one-by-one to the top).
  // Actually addVideos inserts them as a block in given order — the first in the
  // block is topmost. So we keep the order as-is to put nature picks first.
  await youtubeManager.addVideos(videos, "drawing");
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
