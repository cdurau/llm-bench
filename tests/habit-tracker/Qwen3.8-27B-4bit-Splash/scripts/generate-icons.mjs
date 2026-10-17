// Generates the Rhythm PWA icons as PNG files.
// Pure Node (zlib + hand-rolled PNG encoder), no dependencies.
// Design: warm bone tile, ink pulse line. Run: node scripts/generate-icons.mjs

import { deflateSync } from 'node:zlib'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'public', 'icons')
mkdirSync(outDir, { recursive: true })

// ---------------- minimal PNG encoder ----------------

const crcTable = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? (0xedb88320 ^ (c >>> 1)) >>> 0 : (c >>> 1) >>> 0
    t[n] = c
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
  len.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([len, body, crc])
}

function encodePng(size, rgba) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // color type: RGBA
  const rowBytes = size * 4
  const raw = Buffer.alloc(size * (rowBytes + 1))
  for (let y = 0; y < size; y++) {
    raw[y * (rowBytes + 1)] = 0 // filter: none
    rgba.copy(raw, y * (rowBytes + 1) + 1, y * rowBytes, (y + 1) * rowBytes)
  }
  const idat = deflateSync(raw, { level: 9 })
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))])
}

// ---------------- geometry (1024 master space) ----------------

function hex(h) {
  const n = parseInt(h.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

const M = 1024
const BG = hex('#F5F2EC')
const INK = hex('#17150F')
const CORNER = 230 // rounded corner radius in master space (~22.5%)

// Pulse line: flat -> small up -> deep down -> tall up -> flat (classic EKG)
const PTS = [
  [140, 512],
  [352, 512],
  [404, 376],
  [468, 624],
  [532, 256],
  [588, 512],
  [884, 512],
]
const THICK = 52

function pointSegDist(px, py, ax, ay, bx, by) {
  const vx = bx - ax
  const vy = by - ay
  const wx = px - ax
  const wy = py - ay
  const c1 = vx * wx + vy * wy
  if (c1 <= 0) return Math.hypot(px - ax, py - ay)
  const c2 = vx * vx + vy * vy
  if (c2 <= c1) return Math.hypot(px - bx, py - by)
  const t = c1 / c2
  return Math.hypot(px - (ax + t * vx), py - (ay + t * vy))
}

function lineCoverage(x, y) {
  let d = Infinity
  for (let i = 0; i < PTS.length - 1; i++) {
    d = Math.min(d, pointSegDist(x, y, PTS[i][0], PTS[i][1], PTS[i + 1][0], PTS[i + 1][1]))
  }
  return Math.min(1, Math.max(0, THICK / 2 - d + 0.5))
}

function roundedRectCoverage(x, y, radius) {
  const h = M / 2
  const qx = Math.abs(x - h) - (h - radius)
  const qy = Math.abs(y - h) - (h - radius)
  const ox = Math.max(qx, 0)
  const oy = Math.max(qy, 0)
  const sdf = Math.hypot(ox, oy) + Math.min(Math.max(qx, qy), 0) - radius
  return Math.min(1, Math.max(0, 0.5 - sdf))
}

// ---------------- render + downsample ----------------

function render(size, { rounded, glyphScale, opaque }) {
  const out = Buffer.alloc(size * size * 4)
  const sub = size >= 400 ? 3 : 2
  const c = M / 2
  for (let j = 0; j < size; j++) {
    for (let i = 0; i < size; i++) {
      let r = 0
      let g = 0
      let b = 0
      let a = 0
      for (let sy = 0; sy < sub; sy++) {
        for (let sx = 0; sx < sub; sx++) {
          const mx = (i + (sx + 0.5) / sub) * (M / size)
          const my = (j + (sy + 0.5) / sub) * (M / size)
          const tile = rounded ? roundedRectCoverage(mx, my, CORNER) : 1
          if (tile <= 0 && !opaque) continue
          const gx = c + (mx - c) / glyphScale
          const gy = c + (my - c) / glyphScale
          const lc = lineCoverage(gx, gy)
          const rr = BG[0] + (INK[0] - BG[0]) * lc
          const gg = BG[1] + (INK[1] - BG[1]) * lc
          const bb = BG[2] + (INK[2] - BG[2]) * lc
          const alpha = opaque ? 1 : tile
          r += rr * alpha
          g += gg * alpha
          b += bb * alpha
          a += alpha
        }
      }
      const n = sub * sub
      const o = (j * size + i) * 4
      out[o] = Math.round(r / n)
      out[o + 1] = Math.round(g / n)
      out[o + 2] = Math.round(b / n)
      out[o + 3] = Math.round((a / n) * 255)
    }
  }
  return out
}

function save(name, size, opts) {
  const png = encodePng(size, render(size, opts))
  writeFileSync(join(outDir, name), png)
  console.log(`icons/${name} (${size}x${size}, ${png.length} bytes)`)
}

// Manifest icons (rounded tile, glyph centered)
save('icon-192.png', 192, { rounded: true, glyphScale: 1, opaque: false })
save('icon-512.png', 512, { rounded: true, glyphScale: 1, opaque: false })
// Maskable (full-bleed, glyph inside the 80% safe zone)
save('icon-192-maskable.png', 192, { rounded: false, glyphScale: 0.62, opaque: false })
save('icon-512-maskable.png', 512, { rounded: false, glyphScale: 0.62, opaque: false })
// iOS home screen (full square, no transparency)
save('apple-touch-icon.png', 180, { rounded: false, glyphScale: 0.8, opaque: true })
// Browser favicon fallback
save('favicon-64.png', 64, { rounded: true, glyphScale: 1, opaque: false })
