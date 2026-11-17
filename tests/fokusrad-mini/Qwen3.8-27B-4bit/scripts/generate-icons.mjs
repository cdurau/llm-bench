/**
 * Erzeugt die App-Icons für Fokusrad:
 *   public/favicon.svg
 *   public/icons/icon.svg
 *   public/icons/icon-192.png
 *   public/icons/icon-512.png
 *   public/icons/icon-maskable-512.png
 *   public/apple-touch-icon.png
 *
 * Reines Node-Setup (zlib + manuelles PNG-Format), damit keine
 * externen Bild-Tools nötig sind. Aufruf: `node scripts/generate-icons.mjs`
 */
import { deflateSync } from 'node:zlib'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const publicDir = join(root, 'public')
const iconsDir = join(publicDir, 'icons')
mkdirSync(iconsDir, { recursive: true })

/* ---------------- Farbpalettte (identisch mit src/index.css) ------- */

const hexToRgb = (hex) => [
  parseInt(hex.slice(1, 3), 16),
  parseInt(hex.slice(3, 5), 16),
  parseInt(hex.slice(5, 7), 16)
]

const BG = hexToRgb('#1f5e54') // tiefes Teal
const CREAM = hexToRgb('#f6f1e7') // Zentrum
const SEGMENTS = [
  '#4f9c88',
  '#5ca38d',
  '#69aa90',
  '#77b093',
  '#85b694',
  '#93bc92',
  '#a1c193',
  '#afc894'
].map(hexToRgb)

/* ---------------- Geometrie (0° = 12 Uhr, im Uhrzeigersinn) -------- */

function polar(radius, degrees) {
  const rad = ((degrees - 90) * Math.PI) / 180
  return [radius * Math.cos(rad), radius * Math.sin(rad)]
}

/**
 * Zeichnet ein Rad (Hintergrund optional rund/vollblutig) in ein
 * RGBA-Puffer und gibt es zurück. `size` ist die Seitenlänge.
 */
function paintWheel(size, { fullBleed }) {
  const buffer = Buffer.alloc(size * size * 4)
  const half = size / 2
  const cornerR = fullBleed ? 0 : size * 0.185
  // Maskable-Safe-Zone: Motiv bleibt in den mittleren 80 %.
  const outerR = size * (fullBleed ? 0.26 : 0.335)
  const centerR = outerR * 0.44
  const gapDeg = 2.8

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x + 0.5 - half
      const dy = y + 0.5 - half

      // Abgerundetes Rechteck (oder Vollblüte).
      let insideIcon = true
      if (cornerR > 0) {
        const limit = half
        const edge = limit - cornerR
        if ((Math.abs(dx) > edge || Math.abs(dy) > edge) && cornerR > 0) {
          const cdx = Math.abs(dx) > edge ? Math.abs(dx) - edge : 0
          const cdy = Math.abs(dy) > edge ? Math.abs(dy) - edge : 0
          // In der Ecke: nur innerhalb des Eckkreises
          if (Math.abs(dx) > edge && Math.abs(dy) > edge) {
            insideIcon = Math.hypot(cdx, cdy) <= cornerR
          } else {
            insideIcon = true
          }
        }
      }

      let [r, g, b] = BG
      const a = insideIcon ? 255 : 0
      if (insideIcon) {
        const dist = Math.hypot(dx, dy)
        if (dist <= centerR) {
          ;[r, g, b] = CREAM
        } else if (dist <= outerR) {
          const deg = ((Math.atan2(dy, dx) * 180) / Math.PI + 360 + 22.5) % 360
          const within = deg % 45
          if (within >= gapDeg && within <= 45 - gapDeg) {
            const segmentIndex = Math.floor(deg / 45) % 8
            ;[r, g, b] = SEGMENTS[segmentIndex]
          }
          // Lücken bleiben Hintergrundfarbe
        }
      }

      const offset = (y * size + x) * 4
      buffer[offset] = r
      buffer[offset + 1] = g
      buffer[offset + 2] = b
      buffer[offset + 3] = a
    }
  }
  return buffer
}

/* ---------------- PNG-Encoder (minimal, 8-bit RGBA) ---------------- */

const crcTable = (() => {
  const table = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    }
    table[n] = c >>> 0
  }
  return table
})()

function crc32(data) {
  let crc = 0xffffffff
  for (let i = 0; i < data.length; i++) {
    crc = crcTable[(crc ^ data[i]) & 0xff] ^ (crc >>> 8)
  }
  return (crc ^ 0xffffffff) >>> 0
}

function pngChunk(type, data) {
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length)
  const typeBuffer = Buffer.from(type, 'ascii')
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])))
  return Buffer.concat([length, typeBuffer, data, crc])
}

function encodePng(size, rgba) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // Bit-Tiefe
  ihdr[9] = 6 // RGBA
  // Roh-Scanlines mit Filter-Byte 0 (None)
  const stride = size * 4 + 1
  const raw = Buffer.alloc(size * stride)
  for (let y = 0; y < size; y++) {
    raw[y * stride] = 0
    rgba.copy(raw, y * stride + 1, y * size * 4, (y + 1) * size * 4)
  }
  return Buffer.concat([
    signature,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', deflateSync(raw, { level: 9 })),
    pngChunk('IEND', Buffer.alloc(0))
  ])
}

/* ---------------- SVG-Icons ---------------------------------------- */

function svgIcon(size, { fullBleed }) {
  const rx = fullBleed ? 0 : (size * 0.185).toFixed(2)
  const scale = size / 512
  const outerR = 168 * scale * (fullBleed ? 0.78 : 1)
  const innerR = outerR * 0.58
  const centerR = outerR * 0.44
  const c = size / 2
  const gap = 2.8

  const paths = SEGMENTS.map((color, i) => {
    const start = i * 45 + gap / 2
    const end = (i + 1) * 45 - gap / 2
    const [ox1, oy1] = polar(outerR, start)
    const [ox2, oy2] = polar(outerR, end)
    const [ix2, iy2] = polar(innerR, end)
    const [ix1, iy1] = polar(innerR, start)
    const f = (n) => (c + n).toFixed(2)
    return `    <path d="M ${f(ox1)} ${f(oy1)} A ${outerR.toFixed(2)} ${outerR.toFixed(2)} 0 0 1 ${f(ox2)} ${f(oy2)} L ${f(ix2)} ${f(iy2)} A ${innerR.toFixed(2)} ${innerR.toFixed(2)} 0 0 0 ${f(ix1)} ${f(iy1)} Z" fill="rgb(${color.join(' ')})" />`
  }).join('\n')

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${rx}" fill="#1f5e54" />
  <g>
${paths}
    <circle cx="${c}" cy="${c}" r="${centerR.toFixed(2)}" fill="#f6f1e7" />
  </g>
</svg>
`
}

/* ---------------- Auslieferung ------------------------------------- */

/**
 * 2x-Supersampling: rendert vergrößelt und mittelt mit
 * Prämultiplizierter Farbmischung, damit Kanten weich werden.
 */
function smoothIcon(size, options) {
  const factor = 2
  const big = paintWheel(size * factor, options)
  const out = Buffer.alloc(size * size * 4)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let r = 0
      let g = 0
      let b = 0
      let a = 0
      for (let sy = 0; sy < factor; sy++) {
        for (let sx = 0; sx < factor; sx++) {
          const o = ((y * factor + sy) * size * factor + (x * factor + sx)) * 4
          const sa = big[o + 3]
          r += big[o] * sa
          g += big[o + 1] * sa
          b += big[o + 2] * sa
          a += sa
        }
      }
      const o = (y * size + x) * 4
      if (a === 0) {
        out[o + 3] = 0
      } else {
        out[o] = Math.round(r / a)
        out[o + 1] = Math.round(g / a)
        out[o + 2] = Math.round(b / a)
        out[o + 3] = Math.round(a / (factor * factor))
      }
    }
  }
  return out
}

const write = (relativePath, data) => {
  const fullPath = join(publicDir, relativePath)
  mkdirSync(dirname(fullPath), { recursive: true })
  writeFileSync(fullPath, data)
  const bytes = data.length
  console.log(`  ${relativePath} (${bytes} Byte)`)
  if (bytes === 0) throw new Error(`Icon ist leer: ${relativePath}`)
}

console.log('Erzeuge Fokusrad-Icons …')
write('favicon.svg', svgIcon(512, { fullBleed: false }))
write(join('icons', 'icon.svg'), svgIcon(512, { fullBleed: false }))
write(
  join('icons', 'icon-192.png'),
  encodePng(192, smoothIcon(192, { fullBleed: false }))
)
write(
  join('icons', 'icon-512.png'),
  encodePng(512, smoothIcon(512, { fullBleed: false }))
)
write(
  join('icons', 'icon-maskable-512.png'),
  encodePng(512, smoothIcon(512, { fullBleed: true }))
)
write('apple-touch-icon.png', encodePng(180, smoothIcon(180, { fullBleed: true })))
console.log('Fertig.')
