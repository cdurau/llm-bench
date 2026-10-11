// Generates the Rhythm app icons as PNG without any native image dependency.
// Draw: warm-bone rounded square with a charcoal pulse line ("Rhythm" mark).
// Usage: node tools/generate-icons.mjs
import { deflateSync } from 'node:zlib'
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'public', 'icons')
mkdirSync(outDir, { recursive: true })

const CRC_TABLE = (() => {
  const t = new Int32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c
  }
  return t
})()

function crc32(buf) {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([len, body, crc])
}

function encodePng(size, rgba) {
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // color type RGBA
  // 10..12 = 0 (compression, filter, interlace)
  const stride = size * 4
  const raw = Buffer.alloc(size * (stride + 1))
  for (let y = 0; y < size; y++) {
    raw[y * (stride + 1)] = 0 // filter: none
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride)
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]
const BG = hex('#F7F6F3') // warm bone
const INK = hex('#111111') // charcoal

// Pulse polyline in the 512 design space (y grows downwards).
const PTS = [
  [88, 292],
  [180, 292],
  [228, 178],
  [288, 376],
  [336, 292],
  [424, 292],
]
const STROKE = 30

function distToSegment(px, py, ax, ay, bx, by) {
  const vx = bx - ax
  const vy = by - ay
  const wx = px - ax
  const wy = py - ay
  const len2 = vx * vx + vy * vy || 1e-9
  const t = Math.max(0, Math.min(1, (wx * vx + wy * vy) / len2))
  const dx = px - (ax + t * vx)
  const dy = py - (ay + t * vy)
  return Math.hypot(dx, dy)
}

function pulseDistance(x, y, s) {
  // scale points into the actual raster size, then compute in raster space
  let d = Infinity
  for (let i = 0; i < PTS.length - 1; i++) {
    const [ax, ay] = PTS[i]
    const [bx, by] = PTS[i + 1]
    d = Math.min(d, distToSegment(x, y, ax * s, ay * s, bx * s, by * s))
  }
  return d
}

function sdRoundRect(x, y, size, radius) {
  const c = size / 2
  const hw = c - radius
  const qx = Math.abs(x - c) - hw
  const qy = Math.abs(y - c) - hw
  const ox = Math.max(qx, 0)
  const oy = Math.max(qy, 0)
  return Math.min(Math.max(qx, qy), 0) + Math.hypot(ox, oy) - radius
}

function coverage(d, halfWidth, aa = 1.25) {
  const t = (halfWidth - d) / aa + 0.5
  return Math.max(0, Math.min(1, t))
}

function render(size, { rounded }) {
  const s = size / 512
  const buf = Buffer.alloc(size * size * 4)
  const r = 115 * s // ~22.5% of the edge, inside the maskable safe zone
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const bgA = rounded ? coverage(sdRoundRect(x + 0.5, y + 0.5, size, r), 0) : 1
      // The pulse sits fully inside the background, so the line only tints it.
      const lineA = coverage(pulseDistance(x + 0.5, y + 0.5, s), (STROKE / 2) * s)
      const mixT = lineA * bgA
      const rr = BG[0] * (1 - mixT) + INK[0] * mixT
      const g = BG[1] * (1 - mixT) + INK[1] * mixT
      const b = BG[2] * (1 - mixT) + INK[2] * mixT
      const a = bgA
      const o = (y * size + x) * 4
      buf[o] = Math.round(rr)
      buf[o + 1] = Math.round(g)
      buf[o + 2] = Math.round(b)
      buf[o + 3] = Math.round(a * 255)
    }
  }
  return encodePng(size, buf)
}

const targets = [
  [join(outDir, 'icon-512.png'), 512, { rounded: true }],
  [join(outDir, 'icon-192.png'), 192, { rounded: true }],
  [join(root, 'public', 'apple-touch-icon.png'), 180, { rounded: false }], // iOS renders without alpha
]
for (const [file, size, opts] of targets) {
  writeFileSync(file, render(size, opts))
  console.log('wrote', file)
}
