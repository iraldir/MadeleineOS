/**
 * Rebuild the `drawing` block of services/youtubeService.ts from a hand-curated
 * pick list.
 *
 * The picks below came out of a curation pass (2026-08-08): every drawing video
 * that was in the list was checked against the YouTube API for liveness and
 * embeddability, then judged on title + thumbnail + duration. Toddler/chibi/
 * "2 minute" tutorials, speedpaints, digital-only lessons and off-franchise
 * game merch (Fortnite, Minecraft, Brawl Stars) were dropped; proper long-form
 * step-by-step tutorials on paper were kept and topped up with the franchises
 * Madeleine actually watches.
 *
 * Each pick carries a franchise tag; the franchise + channel tags are what the
 * twice-daily rotation in youtubeService uses to keep its 12 picks varied.
 *
 * Run: npx tsx scripts/utils/rebuild-drawing-list.ts
 */
import axios from "axios";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as dotenv from "dotenv";
dotenv.config({ path: path.join(process.cwd(), ".env") });

const API = "https://www.googleapis.com/youtube/v3";
const SERVICE_PATH = path.join(process.cwd(), "services/youtubeService.ts");
const TODAY = "2026-08-08";

/** youtubeId -> franchise tag */
const PICKS: Array<[string, string]> = [
  // ---- Disney ----------------------------------------------------------
  ["jBfMs-YskHo", "Disney"], ["twAox47nBes", "Disney"], ["kvpkTj-6EZw", "Disney"],
  ["YBwoGTvsA2Q", "Disney"], ["hky2ggpPM88", "Disney"], ["Tg64kM4Q8ek", "Disney"],
  ["GcpXN_FFFVg", "Disney"], ["AbH7lCWaDX0", "Disney"], ["R4TgExfr12I", "Disney"],
  ["aeJQsbPAEhc", "Disney"], ["80mkqBe4TsQ", "Disney"], ["zrLIop2WukM", "Disney"],
  ["VlazaMYoIjs", "Disney"], ["7H1fm0SEVcY", "Disney"], ["CNb2cV24wr0", "Disney"],
  ["ZHZ5qrogCOE", "Disney"],
  // ---- Nintendo --------------------------------------------------------
  ["FObW5ynBbVg", "Nintendo"], ["OukDd4qFjM8", "Nintendo"], ["QGMz2e3MFxY", "Nintendo"],
  ["tWYhAy8K0Eg", "Nintendo"], ["Kchg3IK7mFM", "Nintendo"], ["iPJeemfinZ8", "Nintendo"],
  ["2yxnq_Q_bsI", "Nintendo"], ["JwSVs1aRs9A", "Nintendo"], ["q15P6OE0EGk", "Nintendo"],
  ["IrQ_BcEAR3A", "Nintendo"], ["4eIMePaqk5A", "Nintendo"], ["AQIx4UfYrJI", "Nintendo"],
  ["_aHGaUZnRJc", "Nintendo"], ["K0VSVYmPcbI", "Nintendo"], ["rA06Tpnx44E", "Nintendo"],
  ["7x5v_tt1az0", "Nintendo"], ["TDxVwg3BwAo", "Nintendo"], ["T-TqSyNKYfk", "Nintendo"],
  // ---- Pokemon ---------------------------------------------------------
  ["-RRw77w183w", "Pokemon"], ["1zX0hLFrlbQ", "Pokemon"], ["HXW6W1eVo3c", "Pokemon"],
  ["6IeaiSVU7Cc", "Pokemon"], ["hbo1WnqlMrc", "Pokemon"], ["8Hi-04JwsuM", "Pokemon"],
  ["K48siVDktpI", "Pokemon"], ["U4uf_F6JY1M", "Pokemon"], ["j3RafPJ3iWY", "Pokemon"],
  ["zsrFZMVxBs8", "Pokemon"], ["WoV4f1ncE7U", "Pokemon"], ["yLmPwjDtMnQ", "Pokemon"],
  ["aN-HP2z2MF4", "Pokemon"], ["jCCPBGOCo6Q", "Pokemon"], ["fqGlGkI6LAk", "Pokemon"],
  ["XtPfR_D8BC0", "Pokemon"], ["9wzr0PRok2w", "Pokemon"],
  // ---- Studio Ghibli ---------------------------------------------------
  ["NW20U356pmA", "Ghibli"], ["bpXEx0Ypeiw", "Ghibli"], ["Vg7wVaiSXJs", "Ghibli"],
  ["hutTbIT8pPc", "Ghibli"], ["Q3lsif7GkI0", "Ghibli"], ["_24oxPpE9kY", "Ghibli"],
  ["FM0n1aq1ROw", "Ghibli"],
  // ---- Toy Story -------------------------------------------------------
  ["2zZadXzXgKo", "Toy Story"], ["0srd_PwKUaU", "Toy Story"], ["bayiwrmYilg", "Toy Story"],
  ["9ilXZhSwRn4", "Toy Story"], ["QafsWEkdNlM", "Toy Story"], ["5F7XT-MFy_s", "Toy Story"],
  ["YCSieMazLi8", "Toy Story"],
  // ---- Avatar: The Last Airbender --------------------------------------
  ["5rEzWsuYXCc", "Avatar"], ["WsgEs8tIra0", "Avatar"], ["XAtY402mTlY", "Avatar"],
  ["qhE3w81K4LU", "Avatar"], ["8dZJK8i-KFM", "Avatar"], ["WiW0t9ic7_s", "Avatar"],
  // ---- Winx Club -------------------------------------------------------
  ["KO2yNtHs5lg", "Winx Club"], ["7ryzgt0XN6s", "Winx Club"], ["UJ2EfvqWn9I", "Winx Club"],
  ["q3DGqCBnuco", "Winx Club"], ["qz5I8OXMW-o", "Winx Club"], ["qc5uz9uXNj4", "Winx Club"],
  // ---- Bluey -----------------------------------------------------------
  ["lSSYciuiKSA", "Bluey"], ["5mA03XDIRUg", "Bluey"], ["l_4ZAq5zyJM", "Bluey"],
  ["yGIUAkEbwpY", "Bluey"],
  // ---- Mythical creatures ----------------------------------------------
  ["eFHwTD9eHyw", "Mythical"], ["TzifMl12ahk", "Mythical"], ["ANcwbdO-QYM", "Mythical"],
  ["TBH3-tjHNHY", "Mythical"], ["14L8XVjus3U", "Mythical"], ["KUXOQfh0ZKY", "Mythical"],
  ["9U1zQ_oX5LU", "Mythical"], ["KRAarF177Y4", "Mythical"],
  // ---- Everything else -------------------------------------------------
  ["LNJqyHm95w0", "Harry Potter"], ["T37o30V69YQ", "Sonic"], ["fgr9KZ64TXc", "Dinosaurs"],
];

/**
 * Videos that teach the same character. Only these need tagging — anything
 * absent is the only lesson in the list for its subject, and the rotation
 * falls back to the video id.
 */
const SUBJECTS: Record<string, string> = {
  "Tg64kM4Q8ek": "Elsa", "80mkqBe4TsQ": "Elsa",
  "twAox47nBes": "Moana", "VlazaMYoIjs": "Moana",
  "CNb2cV24wr0": "Mirabel", "ZHZ5qrogCOE": "Mirabel",
  "FObW5ynBbVg": "Peach", "_aHGaUZnRJc": "Peach",
  "OukDd4qFjM8": "Rosalina", "K0VSVYmPcbI": "Rosalina", "TDxVwg3BwAo": "Rosalina",
  "rA06Tpnx44E": "Daisy", "T-TqSyNKYfk": "Daisy",
  "AQIx4UfYrJI": "Link", "4eIMePaqk5A": "Link", "7x5v_tt1az0": "Link",
  "-RRw77w183w": "Charizard", "yLmPwjDtMnQ": "Charizard",
  "HXW6W1eVo3c": "Eevee", "aN-HP2z2MF4": "Eevee",
  "NW20U356pmA": "Totoro", "Q3lsif7GkI0": "Totoro",
  "2zZadXzXgKo": "Woody", "9ilXZhSwRn4": "Woody", "YCSieMazLi8": "Woody",
  "bayiwrmYilg": "Jessie", "QafsWEkdNlM": "Jessie",
  "5rEzWsuYXCc": "Aang", "qhE3w81K4LU": "Aang",
  "WsgEs8tIra0": "Katara", "8dZJK8i-KFM": "Katara",
  "KO2yNtHs5lg": "Bloom", "7ryzgt0XN6s": "Bloom",
  "lSSYciuiKSA": "Bluey", "5mA03XDIRUg": "Bluey", "l_4ZAq5zyJM": "Bluey", "yGIUAkEbwpY": "Bluey",
};

function fmtDuration(iso: string): string {
  const m = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/.exec(iso || "");
  if (!m) return "";
  const h = +(m[1] || 0), mi = +(m[2] || 0), s = +(m[3] || 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return h ? `${h}:${pad(mi)}:${pad(s)}` : `${mi}:${pad(s)}`;
}

const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/'/g, "\\'");

/** Existing addedDate per youtubeId, so kept videos don't all look brand new. */
function existingAddedDates(content: string): Map<string, string> {
  const out = new Map<string, string>();
  let cur: { yt?: string; d?: string } = {};
  for (const line of content.split("\n")) {
    const yt = line.match(/youtubeId:\s*'([^']+)'/);
    if (yt) cur.yt = yt[1];
    const d = line.match(/addedDate:\s*'([^']+)'/);
    if (d) cur.d = d[1];
    if (line.includes("}") && cur.yt) {
      if (cur.d) out.set(cur.yt, cur.d);
      cur = {};
    }
  }
  return out;
}

async function main() {
  const key = process.env.GEMINI_KEY;
  if (!key) throw new Error("GEMINI_KEY missing (used as the YouTube Data API v3 key)");

  const content = await fs.readFile(SERVICE_PATH, "utf-8");
  const prevDates = existingAddedDates(content);

  const ids = PICKS.map(p => p[0]);
  const details = new Map<string, any>();
  for (let i = 0; i < ids.length; i += 50) {
    const resp = await axios.get(`${API}/videos`, {
      params: { key, part: "snippet,contentDetails,status", id: ids.slice(i, i + 50).join(",") },
    });
    for (const item of resp.data.items || []) details.set(item.id, item);
  }

  const entries: string[] = [];
  let n = 0;
  for (const [youtubeId, franchise] of PICKS) {
    const d = details.get(youtubeId);
    if (!d) throw new Error(`${youtubeId} is gone from YouTube — remove it from PICKS`);
    if (d.status.embeddable === false) throw new Error(`${youtubeId} is not embeddable`);
    if (d.status.privacyStatus !== "public") throw new Error(`${youtubeId} is ${d.status.privacyStatus}`);
    n += 1;
    const subject = SUBJECTS[youtubeId];
    entries.push([
      "    {",
      `      id: 'drawing-${n}',`,
      `      youtubeId: '${youtubeId}',`,
      `      title: '${esc(d.snippet.title)}',`,
      `      thumbnail: 'https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg',`,
      `      duration: '${fmtDuration(d.contentDetails.duration)}',`,
      "      category: 'drawing',",
      `      channel: '${esc(d.snippet.channelTitle.trim())}',`,
      `      franchise: '${esc(franchise)}',`,
      ...(subject ? [`      subject: '${esc(subject)}',`] : []),
      `      addedDate: '${prevDates.get(youtubeId) ?? TODAY}'`,
      "    }",
    ].join("\n"));
  }

  // Splice the new drawing block in place of every existing drawing entry.
  const start = content.indexOf("private readonly videos: Video[] = [");
  if (start < 0) throw new Error("videos array not found");
  const openBracket = content.indexOf("= [", start) + 2;
  const close = content.indexOf("\n  ];", openBracket);
  const body = content.slice(openBracket + 1, close);

  // Split the array body into top-level object literals.
  const objects: string[] = [];
  let depth = 0, buf = "";
  for (const ch of body) {
    if (ch === "{") depth++;
    if (depth > 0) buf += ch;
    if (ch === "}") {
      depth--;
      if (depth === 0) { objects.push(buf); buf = ""; }
    }
  }
  const kept = objects.filter(o => !/category:\s*'drawing'/.test(o)).map(o => "    " + o.trim());
  const newBody = "\n" + [...entries, ...kept].join(",\n") + "\n";
  const out = content.slice(0, openBracket + 1) + newBody + content.slice(close + 1);
  await fs.writeFile(SERVICE_PATH, out, "utf-8");
  console.log(`drawing: ${entries.length} entries; other categories kept: ${kept.length}`);
}

main().catch(e => { console.error(e.response?.data || e); process.exit(1); });
