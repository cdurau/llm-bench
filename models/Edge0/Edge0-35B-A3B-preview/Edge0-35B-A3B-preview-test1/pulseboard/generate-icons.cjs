const fs = require('fs');
const zlib = require('zlib');

const crcTable = [];
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let j = 0; j < 8; j++) {
    c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable.push(c >>> 0);
}

function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  }
  return (crc ^ -1) >>> 0;
}

function makeChunk(type, data) {
  // type and data are Buffers
  const chunk = Buffer.alloc(4 + type.length + data.length + 4);
  type.copy(chunk, 0);
  data.copy(chunk, 4);
  const crc = crc32(Buffer.concat([type, data]));
  chunk.writeUInt32BE(crc, 4 + type.length + data.length);
  return chunk;
}

function createPNG(size) {
  const pixels = [];
  const cornerR = Math.round(size * 0.17);
  const lineThick = Math.max(1, Math.round(size / 48));

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let r = 79, g = 70, b = 229, a = 255;

      // Clip to rounded rect
      const dx = Math.min(x, size - 1 - x);
      const dy = Math.min(y, size - 1 - y);
      if (dx < cornerR && dy < cornerR) {
        const cx = (x < size / 2) ? cornerR : size - cornerR;
        const cy = (y < size / 2) ? cornerR : size - cornerR;
        if (Math.sqrt((x - cx) ** 2 + (y - cy) ** 2) > cornerR) {
          a = 0;
        }
      }

      // Draw pulse waveform
      if (a > 0) {
        const pts = [
          [0.25, 0.50, 0.35, 0.50],
          [0.35, 0.50, 0.42, 0.28],
          [0.42, 0.28, 0.47, 0.72],
          [0.47, 0.72, 0.53, 0.28],
          [0.53, 0.28, 0.60, 0.55],
          [0.60, 0.55, 0.70, 0.55],
          [0.70, 0.55, 0.78, 0.48],
          [0.78, 0.48, 0.88, 0.48],
        ];
        for (const [x1, y1, x2, y2] of pts) {
          const dx2 = x2 - x1;
          const dy2 = y2 - y1;
          const len = Math.sqrt(dx2 * dx2 + dy2 * dy2);
          let found = false;
          for (let t = 0; t <= 1.01; t += 1 / (size * 2)) {
            const px = x1 + dx2 * t;
            const py = y1 + dy2 * t;
            const dist = Math.abs((py - y1) * dx2 - (px - x1) * dy2) / len;
            if (dist < (lineThick + 2) / size) {
              r = 255; g = 255; b = 255;
              found = true;
              break;
            }
          }
          if (found) break;
        }
      }

      pixels.push(r, g, b, a);
    }
  }

  const idat = zlib.deflateSync(Buffer.from(pixels));

  const sig = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 4);
  ihdr.writeUInt32BE(size, 8);
  ihdr[9] = 8;
  ihdr[10] = 6;

  const ihdrName = Buffer.from('IHDR');
  const idatName = Buffer.from('IDAT');
  const iendName = Buffer.from('IEND');

  const ihdrChunk = makeChunk(ihdrName, ihdr);
  const idatChunk = makeChunk(idatName, idat);
  const iendChunk = makeChunk(iendName, Buffer.alloc(0));

  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
}

const img192 = createPNG(192);
fs.writeFileSync('public/icons/icon-192.png', img192);
console.log('Created icon-192.png (' + img192.length + ' bytes)');

const img512 = createPNG(512);
fs.writeFileSync('public/icons/icon-512.png', img512);
console.log('Created icon-512.png (' + img512.length + ' bytes)');
