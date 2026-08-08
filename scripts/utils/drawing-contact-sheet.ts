import sharp from "sharp";
import * as fs from "node:fs/promises";
const ids: string[] = process.argv.slice(3);
const out = process.argv[2];
const W = 320, H = 180, COLS = 5;
async function main() {
  const tiles: Buffer[] = [];
  for (const id of ids) {
    const r = await fetch(`https://i.ytimg.com/vi/${id}/hqdefault.jpg`);
    const b = Buffer.from(await r.arrayBuffer());
    tiles.push(await sharp(b).resize(W, H, { fit: "cover" }).png().toBuffer());
  }
  const rows = Math.ceil(tiles.length / COLS);
  const LBL = 22;
  const canvas = sharp({ create: { width: W * COLS, height: (H + LBL) * rows, channels: 3, background: "#111" } });
  const comps: any[] = [];
  for (let i = 0; i < tiles.length; i++) {
    const x = (i % COLS) * W, y = Math.floor(i / COLS) * (H + LBL);
    comps.push({ input: tiles[i], left: x, top: y + LBL });
    const svg = `<svg width="${W}" height="${LBL}"><rect width="${W}" height="${LBL}" fill="#111"/><text x="4" y="16" font-family="monospace" font-size="15" fill="#0f0">${i + 1}. ${ids[i]}</text></svg>`;
    comps.push({ input: Buffer.from(svg), left: x, top: y });
  }
  await canvas.composite(comps).png().toFile(out);
  console.log("wrote", out, tiles.length);
}
main();
