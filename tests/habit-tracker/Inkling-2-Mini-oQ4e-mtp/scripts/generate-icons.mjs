// Dependency-free icon generator for the Rhythm PWA.
// Draws a rounded-square mark (warm charcoal canvas + rhythm bars) and
// rasterizes it to PNG using only Node's built-in zlib. No native deps.
import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const outDir = `${root}/public/icons`;
mkdirSync(outDir, { recursive: true });

// ---------- CRC32 ----------
const crcTable = new Int32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  crcTable[n] = c;
}
function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return ~c >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeBuf = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([len, typeBuf, data, crc]);
}

function writePng(path, width, height, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    const rowStart = y * (width * 4 + 1);
    raw[rowStart] = 0; // filter: none
    rgba.copy(raw, rowStart + 1, y * width * 4, (y + 1) * width * 4);
  }

  const png = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
  writeFileSync(path, png);
  console.log(`wrote ${path} (${width}x${height})`);
}

// ---------- Icon drawing (supersampled x2, then downsampled) ----------
const SS = 2;
function drawIcon(size, { maskable = false } = {}) {
  const S = size * SS;
  const px = new Float32Array(S * S * 4);

  const bg = [0x1c, 0x1b, 0x17, 255];   // deep warm charcoal
  const bone = [0xec, 0xe3, 0xd3, 255]; // warm bone
  const clay = [0xd9, 0x7b, 0x5f, 255]; // restrained clay accent

  // keep the glyph inside the maskable safe zone when requested
  const safe = maskable ? 0.85 : 0.9;
  const content = S * safe;
  const barW = Math.round(S * 0.035); // 18 on 512
  const gap = Math.round(S * 0.052);  // 26 on 512
  const total = 5 * barW + 4 * gap;
  const startX = (S - total) / 2 + barW / 2;
  const heights = [0.36, 0.56, 0.82, 0.5, 0.32].map((f) => content * f);
  const cy = S / 2;

  const bars = heights.map((h, i) => ({
    cx: startX + i * (barW + gap),
    cy,
    h,
    w: barW / 2,
    color: i === 2 ? clay : bone,
  }));

  const cornerR = maskable ? 0 : Math.round(S * 0.22);
  const corners = [
    [cornerR, cornerR, (x, y) => x < cornerR && y < cornerR],
    [S - 1 - cornerR, cornerR, (x, y) => x >= S - cornerR && y < cornerR],
    [cornerR, S - 1 - cornerR, (x, y) => x < cornerR && y >= S - cornerR],
    [S - 1 - cornerR, S - 1 - cornerR, (x, y) => x >= S - cornerR && y >= S - cornerR],
  ];

  function barCoverage(bx, by, bar) {
    const halfH = bar.h / 2;
    const r = bar.w;
    if (bx < bar.cx - r || bx > bar.cx + r) return 0;
    if (by < cy - halfH || by > cy + halfH) return 0;
    const innerTop = cy - halfH + r;
    const innerBottom = cy + halfH - r;
    if (by >= innerTop && by <= innerBottom) return 1;
    const capY = by < cy ? innerTop : innerBottom;
    return Math.hypot(bx - bar.cx, by - capY) <= r ? 1 : 0;
  }

  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const idx = (y * S + x) * 4;

      // background: full-bleed, with rounded corners for regular icons
      let inside = true;
      if (!maskable && cornerR > 0) {
        for (const [ccx, ccy, inQuad] of corners) {
          if (ccx <= 0 && ccy <= 0) continue;
          if (inQuad(x, y)) {
            const dx = x + 0.5 - ccx;
            const dy = y + 0.5 - ccy;
            if (dx * dx + dy * dy > cornerR * cornerR) inside = false;
            break;
          }
        }
      }
      if (inside) {
        px[idx] = bg[0]; px[idx + 1] = bg[1]; px[idx + 2] = bg[2]; px[idx + 3] = 255;
        for (const bar of bars) {
          const a = barCoverage(x + 0.5, y + 0.5, bar);
          if (a > 0) {
            px[idx] = px[idx] * (1 - a) + bar.color[0] * a;
            px[idx + 1] = px[idx + 1] * (1 - a) + bar.color[1] * a;
            px[idx + 2] = px[idx + 2] * (1 - a) + bar.color[2] * a;
            px[idx + 3] = 255;
          }
        }
      }
    }
  }

  // downsample SS -> 1x (box average)
  const rgba = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let r = 0, g = 0, b = 0, a = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const idx = ((y * SS + sy) * S + (x * SS + sx)) * 4;
          r += px[idx]; g += px[idx + 1]; b += px[idx + 2]; a += px[idx + 3];
        }
      }
      const n = SS * SS;
      const o = (y * size + x) * 4;
      rgba[o] = Math.round(r / n);
      rgba[o + 1] = Math.round(g / n);
      rgba[o + 2] = Math.round(b / n);
      rgba[o + 3] = Math.round(a / n);
    }
  }
  return rgba;
}

function gen(size, name, opts) {
  const rgba = drawIcon(size, opts);
  writePng(`${outDir}/${name}.png`, size, size, rgba);
}

gen(192, 'icon-192', { maskable: false });
gen(512, 'icon-512', { maskable: false });
gen(192, 'icon-maskable-192', { maskable: true });
gen(512, 'icon-maskable-512', { maskable: true });
gen(180, 'apple-touch-icon', { maskable: true });

console.log('icons done');
