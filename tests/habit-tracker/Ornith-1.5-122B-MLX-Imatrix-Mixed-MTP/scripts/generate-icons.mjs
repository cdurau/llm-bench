import { readFile, mkdir, writeFile } from 'node:fs/promises'
import sharp from 'sharp'

const SOURCE = 'public/icon.svg'
const OUT = 'public/icons'

const svg = await readFile(SOURCE)

await mkdir(OUT, { recursive: true })

// Transparente App-Icons (192 & 512) — das Herzstück des Manifests.
const transparent = [192, 512]
// Apple Touch Icon.
const apple = [180]
// Favicon als ICO (aus einem 48x48 PNG).
const favicon = [48]

const written = []

for (const size of transparent) {
  const buf = await sharp(svg).resize({ width: size, height: size }).png().toBuffer()
  const name = `icon-${size}x${size}.png`
  await writeFile(`${OUT}/${name}`, buf)
  written.push(name)
}

for (const size of apple) {
  const buf = await sharp(svg).resize({ width: size, height: size }).png().toBuffer()
  const name = `apple-touch-icon-${size}x${size}.png`
  await writeFile(`${OUT}/${name}`, buf)
  written.push(name)
}

for (const size of favicon) {
  const buf = await sharp(svg).resize({ width: size, height: size }).png().toBuffer()
  await writeFile(`${OUT}/favicon-${size}x${size}.png`, buf)
  written.push(`favicon-${size}x${size}.png`)
}

console.log(`Generierte Icons: ${written.join(', ')}`)
