/**
 * Ad-hoc search helper for curating the drawing category.
 * Usage: tsx scripts/utils/search-drawing-candidates.ts "query one" "query two" ...
 * Prints one line per candidate with channel, duration and views so a human
 * (or an agent) can judge quality before adding anything.
 */
import axios from "axios";
import * as path from "node:path";
import * as fs from "node:fs/promises";
import * as dotenv from "dotenv";
dotenv.config({ path: path.join(process.cwd(), ".env") });

const API = "https://www.googleapis.com/youtube/v3";

async function search(q: string, key: string, n: number) {
  const r = await axios.get(`${API}/search`, {
    params: { key, part: "snippet", q, type: "video", maxResults: n, safeSearch: "strict", videoEmbeddable: "true" },
  });
  return (r.data.items || []).map((i: any) => i.id.videoId);
}

async function details(ids: string[], key: string) {
  const out: any[] = [];
  for (let i = 0; i < ids.length; i += 50) {
    const r = await axios.get(`${API}/videos`, {
      params: { key, part: "snippet,contentDetails,status,statistics", id: ids.slice(i, i + 50).join(",") },
    });
    out.push(...(r.data.items || []));
  }
  return out;
}

function secs(iso: string) {
  const m = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/.exec(iso || "");
  if (!m) return 0;
  return +(m[1] || 0) * 3600 + +(m[2] || 0) * 60 + +(m[3] || 0);
}

async function main() {
  const key = process.env.GEMINI_KEY!;
  const queries = process.argv.slice(2);
  const seen = new Map<string, string>();
  for (const q of queries) {
    const ids = await search(q, key, 12);
    for (const id of ids) if (!seen.has(id)) seen.set(id, q);
  }
  const items = await details([...seen.keys()], key);
  const rows = items.map((d: any) => ({
    youtubeId: d.id,
    title: d.snippet.title,
    channelTitle: d.snippet.channelTitle,
    duration: d.contentDetails.duration,
    seconds: secs(d.contentDetails.duration),
    embeddable: d.status.embeddable,
    views: Number(d.statistics?.viewCount || 0),
    thumbnail: d.snippet.thumbnails?.high?.url || `https://i.ytimg.com/vi/${d.id}/hqdefault.jpg`,
    query: seen.get(d.id),
    description: (d.snippet.description || "").slice(0, 200).replace(/\s+/g, " "),
  }));
  const outPath = process.env.OUT || "/tmp/candidates.json";
  let prev: any[] = [];
  try { prev = JSON.parse(await fs.readFile(outPath, "utf-8")); } catch {}
  const merged = [...prev, ...rows.filter(r => !prev.some((p: any) => p.youtubeId === r.youtubeId))];
  await fs.writeFile(outPath, JSON.stringify(merged, null, 2));
  for (const r of rows) {
    console.log(`${r.youtubeId} ${Math.round(r.seconds / 60)}m ${(r.views / 1000).toFixed(0)}k ${r.embeddable ? "E" : "NOEMBED"} [${r.channelTitle}] ${r.title}  <<${r.query}>>`);
  }
}
main().catch(e => { console.error(e.response?.data || e); process.exit(1); });
