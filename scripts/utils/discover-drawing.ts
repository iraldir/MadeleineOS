/**
 * Discover candidate drawing videos.
 *
 * Strategy:
 *   1. Read existing drawing videos from services/youtubeService.ts
 *   2. Look up their channelIds via the YouTube API
 *   3. For each channel that contributed ≥ N videos, fetch recent uploads
 *   4. Also run thematic keyword searches
 *   5. Deduplicate, score, and emit JSON suggestions
 *
 * Output: writes scripts/utils/discover-drawing.suggestions.json
 */
import axios from "axios";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { CONFIG } from "../config";

const SERVICE_PATH = path.join(__dirname, "../../services/youtubeService.ts");
const OUT_PATH = path.join(__dirname, "discover-drawing.suggestions.json");
const API = "https://www.googleapis.com/youtube/v3";

interface ExistingVideo {
  id: string;
  youtubeId: string;
  title: string;
}

interface Candidate {
  youtubeId: string;
  title: string;
  channelId: string;
  channelTitle: string;
  publishedAt: string;
  thumbnail: string;
  duration?: string;
  viewCount?: number;
  reason: string;
}

function parseExistingDrawing(content: string): ExistingVideo[] {
  const lines = content.split("\n");
  const out: ExistingVideo[] = [];
  let inArray = false;
  let cur: Partial<ExistingVideo> & { category?: string } = {};
  for (const line of lines) {
    if (line.includes("private readonly videos: Video[]")) { inArray = true; continue; }
    if (!inArray) continue;
    if (line.trim() === "];") break;
    const id = line.match(/id:\s*'([^']+)'/);
    if (id) cur.id = id[1];
    const yt = line.match(/youtubeId:\s*'([^']+)'/);
    if (yt) cur.youtubeId = yt[1];
    const t = line.match(/title:\s*'((?:[^'\\]|\\.)*)'/);
    if (t) cur.title = t[1];
    const c = line.match(/category:\s*'([^']+)'/);
    if (c) cur.category = c[1];
    if (line.includes("}") && cur.id) {
      if (cur.category === "drawing" && cur.youtubeId && cur.title) {
        out.push({ id: cur.id, youtubeId: cur.youtubeId, title: cur.title });
      }
      cur = {};
    }
  }
  return out;
}

async function getVideoChannels(ids: string[], apiKey: string): Promise<Map<string, { channelId: string; channelTitle: string }>> {
  const result = new Map<string, { channelId: string; channelTitle: string }>();
  for (let i = 0; i < ids.length; i += 50) {
    const batch = ids.slice(i, i + 50);
    const resp = await axios.get(`${API}/videos`, {
      params: { key: apiKey, part: "snippet", id: batch.join(",") },
    });
    for (const item of resp.data.items || []) {
      result.set(item.id, {
        channelId: item.snippet.channelId,
        channelTitle: item.snippet.channelTitle,
      });
    }
  }
  return result;
}

async function getChannelUploadsPlaylist(channelId: string, apiKey: string): Promise<string | null> {
  const resp = await axios.get(`${API}/channels`, {
    params: { key: apiKey, part: "contentDetails", id: channelId },
  });
  const item = resp.data.items?.[0];
  return item?.contentDetails?.relatedPlaylists?.uploads ?? null;
}

async function getPlaylistVideos(playlistId: string, apiKey: string, max = 100): Promise<{ videoId: string; title: string; publishedAt: string }[]> {
  const out: { videoId: string; title: string; publishedAt: string }[] = [];
  let pageToken: string | undefined;
  while (out.length < max) {
    const resp: any = await axios.get(`${API}/playlistItems`, {
      params: {
        key: apiKey,
        part: "snippet",
        playlistId,
        maxResults: 50,
        pageToken,
      },
    });
    for (const item of resp.data.items || []) {
      if (item.snippet.title === "Deleted video" || item.snippet.title === "Private video") continue;
      out.push({
        videoId: item.snippet.resourceId.videoId,
        title: item.snippet.title,
        publishedAt: item.snippet.publishedAt,
      });
    }
    pageToken = resp.data.nextPageToken;
    if (!pageToken) break;
  }
  return out;
}

async function searchKeyword(query: string, apiKey: string, max = 15): Promise<{ videoId: string; title: string; channelId: string; channelTitle: string; publishedAt: string }[]> {
  const resp = await axios.get(`${API}/search`, {
    params: {
      key: apiKey,
      part: "snippet",
      q: query,
      type: "video",
      maxResults: max,
      safeSearch: "strict",
      relevanceLanguage: "en",
      videoEmbeddable: "true",
      videoSyndicated: "true",
    },
  });
  return (resp.data.items || []).map((item: any) => ({
    videoId: item.id.videoId,
    title: item.snippet.title,
    channelId: item.snippet.channelId,
    channelTitle: item.snippet.channelTitle,
    publishedAt: item.snippet.publishedAt,
  }));
}

async function hydrateDetails(videoIds: string[], apiKey: string): Promise<Map<string, { duration: string; viewCount: number; thumbnail: string; description: string }>> {
  const m = new Map<string, { duration: string; viewCount: number; thumbnail: string; description: string }>();
  for (let i = 0; i < videoIds.length; i += 50) {
    const batch = videoIds.slice(i, i + 50);
    const resp = await axios.get(`${API}/videos`, {
      params: { key: apiKey, part: "snippet,contentDetails,statistics", id: batch.join(",") },
    });
    for (const item of resp.data.items || []) {
      m.set(item.id, {
        duration: formatDuration(item.contentDetails.duration),
        viewCount: parseInt(item.statistics?.viewCount ?? "0"),
        thumbnail: item.snippet.thumbnails?.maxresdefault?.url || item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url || "",
        description: item.snippet.description || "",
      });
    }
  }
  return m;
}

function formatDuration(iso: string): string {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return "0:00";
  const h = parseInt(m[1] || "0");
  const min = parseInt(m[2] || "0");
  const sec = parseInt(m[3] || "0");
  if (h > 0) return `${h}:${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

const THEMES: { name: string; queries: string[] }[] = [
  {
    name: "nature",
    queries: [
      "how to draw a tree easy for kids",
      "how to draw flowers easy for kids step by step",
      "how to draw a butterfly easy for kids",
      "how to draw a bird easy for kids",
      "how to draw a forest easy for kids",
      "how to draw mushrooms cute for kids",
    ],
  },
  {
    name: "princesses",
    queries: [
      "how to draw Disney princess easy for kids",
      "how to draw Elsa easy for kids step by step",
      "how to draw Rapunzel easy for kids",
      "how to draw Moana easy for kids",
      "how to draw Belle easy for kids",
      "how to draw Cinderella easy for kids",
      "how to draw Tiana easy for kids",
    ],
  },
  {
    name: "nintendo",
    queries: [
      "how to draw Mario easy for kids",
      "how to draw Luigi easy for kids",
      "how to draw Princess Peach easy for kids",
      "how to draw Yoshi easy for kids",
      "how to draw Kirby easy for kids",
      "how to draw Pikachu easy for kids",
      "how to draw Eevee easy for kids",
      "how to draw Link Zelda easy for kids",
      "how to draw Bowser easy for kids",
      "how to draw Toad Mario easy for kids",
    ],
  },
  {
    name: "general",
    queries: [
      "how to draw a house easy for kids",
      "how to draw a rainbow easy for kids",
      "how to draw a castle easy for kids",
      "how to draw a unicorn easy for kids",
      "how to draw a cake easy for kids",
      "how to draw an ice cream easy for kids",
      "how to draw a cute cat easy for kids",
    ],
  },
];

async function main() {
  const apiKey = CONFIG.api.geminiKey;
  if (!apiKey) throw new Error("GEMINI_KEY missing");

  console.log("Loading existing drawing videos...");
  const content = await fs.readFile(SERVICE_PATH, "utf-8");
  const existing = parseExistingDrawing(content);
  const existingIds = new Set(existing.map(v => v.youtubeId));
  console.log(`  ${existing.length} existing drawing videos`);

  console.log("Fetching channel info for existing videos...");
  const idToChannel = await getVideoChannels(existing.map(v => v.youtubeId), apiKey);

  const channelCounts = new Map<string, { title: string; count: number }>();
  for (const { channelId, channelTitle } of idToChannel.values()) {
    const prev = channelCounts.get(channelId) || { title: channelTitle, count: 0 };
    prev.count += 1;
    channelCounts.set(channelId, prev);
  }
  const topChannels = [...channelCounts.entries()]
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 8);
  console.log("Top channels:");
  for (const [id, { title, count }] of topChannels) console.log(`  ${count.toString().padStart(3)} ${title}  (${id})`);

  const candidates = new Map<string, Candidate>();

  console.log("Fetching recent uploads from top channels...");
  for (const [channelId, { title }] of topChannels) {
    try {
      const uploads = await getChannelUploadsPlaylist(channelId, apiKey);
      if (!uploads) continue;
      const items = await getPlaylistVideos(uploads, apiKey, 60);
      for (const v of items) {
        if (existingIds.has(v.videoId) || candidates.has(v.videoId)) continue;
        candidates.set(v.videoId, {
          youtubeId: v.videoId,
          title: v.title,
          channelId,
          channelTitle: title,
          publishedAt: v.publishedAt,
          thumbnail: "",
          reason: `recent upload from existing channel "${title}"`,
        });
      }
    } catch (e: any) {
      console.warn(`  channel ${title} failed: ${e.message}`);
    }
  }

  console.log("Running thematic searches...");
  for (const theme of THEMES) {
    for (const q of theme.queries) {
      try {
        const results = await searchKeyword(q, apiKey, 8);
        for (const r of results) {
          if (existingIds.has(r.videoId) || candidates.has(r.videoId)) continue;
          candidates.set(r.videoId, {
            youtubeId: r.videoId,
            title: r.title,
            channelId: r.channelId,
            channelTitle: r.channelTitle,
            publishedAt: r.publishedAt,
            thumbnail: "",
            reason: `theme:${theme.name} query:"${q}"`,
          });
        }
      } catch (e: any) {
        console.warn(`  query "${q}" failed: ${e.message}`);
      }
    }
  }

  console.log(`Total raw candidates: ${candidates.size}`);

  console.log("Hydrating with duration/views/thumbnail...");
  const details = await hydrateDetails([...candidates.keys()], apiKey);
  for (const [id, c] of candidates) {
    const d = details.get(id);
    if (d) {
      c.duration = d.duration;
      c.viewCount = d.viewCount;
      c.thumbnail = d.thumbnail;
    }
  }

  const list = [...candidates.values()];
  // Sort: existing-channel videos first, then by view count
  list.sort((a, b) => {
    const aFromChannel = a.reason.startsWith("recent upload");
    const bFromChannel = b.reason.startsWith("recent upload");
    if (aFromChannel !== bFromChannel) return aFromChannel ? -1 : 1;
    return (b.viewCount ?? 0) - (a.viewCount ?? 0);
  });

  await fs.writeFile(OUT_PATH, JSON.stringify(list, null, 2), "utf-8");
  console.log(`\nWrote ${list.length} candidates to ${OUT_PATH}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
