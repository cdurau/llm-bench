// scripts/gen-icons.mjs
// Erzeugt die PWA-Icons (192 und 512) als PNG mit einem eigenen,
// dependency-freien PNG-Encoder. Motiv: ruhige Teal-Fläche mit einer
// weißen „Rhythmus"-Puls-Welle.
import { deflateSync } from 'node:zlib'
import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = join(__dirname, '..', 'public', 'icons')
mkdirSync(outDir, { recursive: true })

// --- CRC32 ---
const crcTable = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c >>> 0
  }
  return t
})()
function crc32(buf) {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length, 0)
  const typeBuf = Buffer.from(type, 'ascii')
  const crcBuf = Buffer.alloc(4)
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0)
  return Buffer.concat([len, typeBuf, data, crcBuf])
}

function encodePNG(width, height, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]) // PNG signature
  // IHDR
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // color type RGBA
  ihdr[10] = 0 // compression
  ihdr[11] = 0 // filter
  ihdr[12] = 0 // interlace
  // IDAT: prepend filter byte 0 per scanline
  const stride = width * 4
  const raw = Buffer.alloc((stride + 1) * height)
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride)
  }
  const idat = deflateSync(raw, { level: 9 })
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

// --- Zeichenhilfen ---
const TEAL = [63, 122, 116]
const WHITE = [255, 255, 255]

function blend(buf, w, x, y, [r, g, b], a) {
  if (x < 0 || y < 0 || x >= w || y >= w) return
  const i = (y * w + x) * 4
  if (a >= 255) { buf[i] = r; buf[i + 1] = g; buf[i + 2] = b; buf[i + 3] = 255; return }
  const inv = 255 - a
  buf[i] = (r * a + buf[i] * inv) / 255
  buf[i + 1] = (g * a + buf[i + 1] * inv) / 255
  buf[i + 2] = (b * a + buf[i + 2] * inv) / 255
  buf[i + 3] = (255 * a + buf[i + 3] * inv) / 255
}

function smooth(t) { // coverage 0..1
  return t < 0 ? 0 : t > 1 ? 1 : t * t * (3 - 2 * t)
}

function drawRoundedRect(buf, w, color) {
  const r = Math.round(w * 0.18) // corner radius
  for (let y = 0; y < w; y++) {
    for (let x = 0; x < w; x++) {
      let cover = 1
      const cx = x < r ? r - x : x > w - 1 - r ? x - (w - 1 - r) : 0
      const cy = y < r ? r - y : y > w - 1 - r ? y - (w - 1 - r) : 0
      const d = Math.sqrt(cx * cx + cy * cy)
      cover = smooth(r - d)
      if (cover <= 0) continue
      blend(buf, w, x, y, color, Math.round(cover * 255))
    }
  }
}

function drawCircle(buf, w, cx, cy, radius, [r, g, b]) {
  for (let y = 0; y < w; y++) {
    for (let x = 0; x < w; x++) {
      const d = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2)
      const cover = smooth(radius - d)
      if (cover <= 0) continue
      blend(buf, w, x, y, [r, g, b], Math.round(cover * 255))
    }
  }
}

function drawPulse(buf, w) {
  const x0 = Math.round(w * 0.16)
  const x1 = Math.round(w * 0.84)
  const cy = Math.round(w * 0.52)
  const half = Math.round(w * 0.045) // stroke half-width
  for (let x = x0; x <= x1; x++) {
    // Puls: flache Basislinie mit einem scharfen Herzschlag-Peak in der Mitte
    const t = (x - x0) / (x1 - x0)
    let dy = 0
    const mid = 0.5
    const span = 0.16
    if (Math.abs(t - mid) < span) {
      const p = (t - mid) / span
      dy = -w * 0.16 * Math.cos(p * Math.PI) // Aufwärts-Peak
    }
    const yc = cy + dy
    for (let y = Math.max(0, Math.round(yc - half)); y <= Math.min(w - 1, Math.round(yc + half)); y++) {
      const cover = smooth(half - Math.abs(y - yc))
      if (cover <= 0) continue
      blend(buf, w, x, y, WHITE, Math.round(cover * 255))
    }
  }
}

function render(size) {
  const buf = Buffer.alloc(size * size * 4) // transparent
  drawRoundedRect(buf, size, TEAL)
  drawPulse(buf, size)
  drawCircle(buf, size, Math.round(size * 0.5), Math.round(size * 0.5), Math.round(size * 0.055), WHITE)
  return encodePNG(size, size, buf)
}

for (const [size, name] of [[512, 'icon-512.png'], [192, 'icon-192.png']]) {
  const png = render(size)
  writeFileSync(join(outDir, name), png)
  console.log(`Icon ${name}: ${png.length} Bytes`)
}