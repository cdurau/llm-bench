// Generiert die Fokusrad-Icons (PNG 192/512, Apple-Touch 180 + SVG-Favicon)
// als echte Dateien in public/. Reines Node, ohne Abhängigkeiten:
// minimale PNG-Kodierung (RGBA, Filter "None") mit zlib.deflateSync.
import { deflateSync } from 'node:zlib'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const out = (p) => resolve(root, p)

// ---- PNG-Kodierung -------------------------------------------------------
const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})

function crc32(buf) {
  let c = 0xffffffff
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8)
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

function encodePng(w, h, rgba) {
  const stride = 1 + w * 4
  const raw = Buffer.alloc(h * stride)
  for (let y = 0; y < h; y++) {
    raw[y * stride] = 0 // Filter: None
    rgba.copy(raw, y * stride + 1, y * w * 4, (y + 1) * w * 4)
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(w, 0)
  ihdr.writeUInt32BE(h, 4)
  ihdr[8] = 8 // Bit depth
  ihdr[9] = 6 // RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

// ---- Motiv: Fokusrad -----------------------------------------------------
const BG = [241, 235, 221] // warmer Sandton (full-bleed, maskable-tauglich)
const CENTER = [250, 247, 239]
const DOT = [62, 124, 116]
const SEG_A = [168, 199, 182] // Salbei
const SEG_B = [52, 110, 99] // Tiefes Teal

const lerp = (a, b, t) => Math.round(a + (b - a) * t)
const mix = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)]

// Farbe eines Punkts in Motiv-Koordinaten (-1..1); deckt BG zu, wenn null.
function motifColor(x, y) {
  const r = Math.hypot(x, y)
  if (r <= 0.05) return DOT
  if (r <= 0.13) return CENTER
  if (r <= 0.148) return mix(CENTER, SEG_B, 0.45) // dezente Zenterringlinie
  if (r < 0.16) return BG
  if (r <= 0.35) {
    const deg = ((Math.atan2(y, x) * 180) / Math.PI + 90 + 360) % 360
    const seg = Math.floor(deg / 45)
    const local = deg - seg * 45
    if (local < 2.2 || local > 42.8) return BG // Segment-Lücken
    return mix(SEG_A, SEG_B, seg / 7)
  }
  if (r <= 0.366) return mix(BG, SEG_B, 0.28) // sanfter Außenring-Schatten
  return null
}

function renderPng(size) {
  const rgba = Buffer.alloc(size * size * 4)
  const SS = 3 // 3x3-Supersampling für weiche Kanten
  const WEIGHTS = [0.167, 0.5, 0.833]
  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      let r = 0
      let g = 0
      let b = 0
      for (const sy of WEIGHTS) {
        for (const sx of WEIGHTS) {
          const c = motifColor(((px + sx) / size) * 2 - 1, ((py + sy) / size) * 2 - 1) ?? BG
          r += c[0]
          g += c[1]
          b += c[2]
        }
      }
      const i = (py * size + px) * 4
      rgba[i] = r / 9
      rgba[i + 1] = g / 9
      rgba[i + 2] = b / 9
      rgba[i + 3] = 255
    }
  }
  return encodePng(size, size, rgba)
}

// ---- SVG-Version (favicon + Manifest-Eintrag) ----------------------------
const S = 512
const CX = S / 2
const polar = (deg, r) => [CX + r * Math.cos((deg * Math.PI) / 180), CX + r * Math.sin((deg * Math.PI) / 180)]
const fmt = (n) => n.toFixed(2)

function sector(i) {
  const a0 = -90 + i * 45 + 2.2
  const a1 = -90 + (i + 1) * 45 - 2.2
  const [x0, y0] = polar(a0, 180)
  const [x1, y1] = polar(a1, 180)
  const [x2, y2] = polar(a1, 82)
  const [x3, y3] = polar(a0, 82)
  return `M ${fmt(x0)} ${fmt(y0)} A 180 180 0 0 1 ${fmt(x1)} ${fmt(y1)} L ${fmt(x2)} ${fmt(y2)} A 82 82 0 0 0 ${fmt(x3)} ${fmt(y3)} Z`
}

function svgIcon() {
  const segs = Array.from({ length: 8 }, (_, i) => {
    const c = mix(SEG_A, SEG_B, i / 7)
    return `  <path d="${sector(i)}" fill="rgb(${c.join(' ')})"/>`
  }).join('\n')
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${S} ${S}">
  <rect width="${S}" height="${S}" fill="rgb(${BG.join(' ')})"/>
${segs}
  <circle cx="${CX}" cy="${CX}" r="68" fill="rgb(${CENTER.join(' ')})" stroke="rgb(${mix(CENTER, SEG_B, 0.45).join(' ')})" stroke-width="7"/>
  <circle cx="${CX}" cy="${CX}" r="25" fill="rgb(${DOT.join(' ')})"/>
</svg>
`
}

mkdirSync(out('public/icons'), { recursive: true })
writeFileSync(out('public/icons/icon-512x512.png'), renderPng(512))
writeFileSync(out('public/icons/icon-192x192.png'), renderPng(192))
writeFileSync(out('public/apple-touch-icon.png'), renderPng(180))
writeFileSync(out('public/icons/icon.svg'), svgIcon())
console.log('Icons erzeugt: public/icons/icon-512x512.png, icon-192x192.png, icon.svg, public/apple-touch-icon.png')
