/**
 * Erzeugt die PWA-Icons als Platzhalter-PNGs komplett lokal (kein externes
 * Webdienst, keine Bild-Bibliothek): reines zlib + handgerollter PNG-Encoder.
 *
 * Motiv: Teal-Fläche, weiße Pulslinie (EKG-Spike) – dieselbe Linie wie in der
 * App (src/components/PulseLine.tsx).
 *
 * Aufruf: node scripts/generate-icons.mjs  →  public/icons/icon-{192,512}.png, maskable-512.png
 */
import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'public', 'icons');

/* ---------- PNG-Encoder (8-bit RGB) ---------- */

const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeBuf = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([len, typeBuf, data, crc]);
}

function encodePng(width, height, pixelFn) {
  // RGBA, 8-bit pro Kanal; pixelFn(x, y) → [r, g, b, a]
  const raw = Buffer.alloc((width * 4 + 1) * height);
  let o = 0;
  for (let y = 0; y < height; y++) {
    raw[o++] = 0; // Filter: none
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = pixelFn(x, y);
      raw[o++] = r;
      raw[o++] = g;
      raw[o++] = b;
      raw[o++] = a;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // Bitstärke
  ihdr[9] = 6; // color type: truecolor + alpha
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/* ---------- Zeichen-Hilfen ---------- */

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function inRoundedRect(x, y, size, radius) {
  if (x < 0 || y < 0 || x >= size || y >= size) return false;
  if (x >= radius && x <= size - radius) return true;
  if (y >= radius && y <= size - radius) return true;
  const cx = x < radius ? radius : size - radius;
  const cy = y < radius ? radius : size - radius;
  const dx = x - cx;
  const dy = y - cy;
  return dx * dx + dy * dy <= radius * radius;
}

/** Distanz Punkt → Streckenabschnitt, Punkte als [x, y]. */
function distToSegment(px, py, ax, ay, bx, by) {
  const vx = bx - ax;
  const vy = by - ay;
  const wx = px - ax;
  const wy = py - ay;
  const len2 = vx * vx + vy * vy;
  const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, (wx * vx + wy * vy) / len2));
  const dx = px - (ax + t * vx);
  const dy = py - (ay + t * vy);
  return Math.sqrt(dx * dx + dy * dy);
}

// Relative Wegpunkte der Pulslinie (wie in der App, viewBox 240×44, Basis y=26).
const PULSE_POINTS = [
  [0.2, 0.59],
  [0.4, 0.59],
  [0.47, 0.16],
  [0.56, 0.9],
  [0.63, 0.59],
  [0.8, 0.59],
];

function makeIcon(size, { rounded, safeZone = 1 }) {
  const bg = hexToRgb('#0e7a66');
  const fg = hexToRgb('#f4f4f1');
  const radius = rounded ? size * 0.22 : 0;
  const strokeWidth = size * 0.045 * safeZone;
  // Skalierung in den Safe Zone (maskable: 0.8), zentriert.
  const scale = safeZone;
  const off = (1 - scale) / 2;

  const segments = [];
  for (let i = 0; i < PULSE_POINTS.length - 1; i++) {
    const [x1, y1] = PULSE_POINTS[i];
    const [x2, y2] = PULSE_POINTS[i + 1];
    segments.push([
      (off + x1 * scale) * size,
      (off + y1 * scale) * size,
      (off + x2 * scale) * size,
      (off + y2 * scale) * size,
    ]);
  }

  return encodePng(size, size, (x, y) => {
    const inside = rounded ? inRoundedRect(x + 0.5, y + 0.5, size, radius) : true;
    if (!inside) return [bg[0], bg[1], bg[2], 0]; // transparente Ecken
    const onLine = segments.some(
      ([ax, ay, bx, by]) => distToSegment(x + 0.5, y + 0.5, ax, ay, bx, by) <= strokeWidth / 2,
    );
    const color = onLine ? fg : bg;
    return [color[0], color[1], color[2], 255];
  });
}

/* ---------- Ausgeben ---------- */

mkdirSync(outDir, { recursive: true });

const outputs = [
  [join(outDir, 'icon-192.png'), () => makeIcon(192, { rounded: true })],
  [join(outDir, 'icon-512.png'), () => makeIcon(512, { rounded: true })],
  [
    join(outDir, 'maskable-512.png'),
    () => makeIcon(512, { rounded: false, safeZone: 0.78 }),
  ],
];

for (const [file, fn] of outputs) {
  writeFileSync(file, fn());
  console.log(`✓ ${file}`);
}
console.log('Icons erzeugt.');
