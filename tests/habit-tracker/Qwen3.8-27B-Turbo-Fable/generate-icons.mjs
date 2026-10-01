import sharp from 'sharp';

async function generateIcon(size, filename) {
  // Create a simple icon with a circle and checkmark
  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" rx="32" fill="#F7F6F3"/>
      <circle cx="${size/2}" cy="${size/2}" r="${size*0.35}" fill="#3B82F6"/>
      <path d="M${size*0.35} ${size/2} L${size*0.48} ${size*0.63} L${size*0.65} ${size*0.4}" stroke="white" stroke-width="${size*0.08}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;

  await sharp(Buffer.from(svg))
    .resize(size, size)
    .png()
    .toFile(`public/${filename}`);

  console.log(`Generated ${filename} (${size}x${size})`);
}

async function main() {
  await generateIcon(192, 'icon-192.png');
  await generateIcon(512, 'icon-512.png');
}

main().catch(console.error);
