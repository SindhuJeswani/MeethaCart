import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.resolve(__dirname, '../public');

// Master SVG source for icon generation (exact geometry with light background colors)
const iconSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="512" height="512">
  <path d="M100 14 L14 14 L14 60 L100 60 L100 106 L14 106" fill="none" stroke="#1A1A1A" stroke-width="13" stroke-linejoin="miter"/>
  <path d="M14 60 L14 106" fill="none" stroke="#B5372A" stroke-width="13"/>
</svg>
`;

// Helper to wrap PNG buffer into valid .ico format
function createIcoFromPng(pngBuffer, size = 32) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // 1 = ICO
  header.writeUInt16LE(1, 4); // 1 image

  const entry = Buffer.alloc(16);
  entry.writeUInt8(size === 256 ? 0 : size, 0); // Width
  entry.writeUInt8(size === 256 ? 0 : size, 1); // Height
  entry.writeUInt8(0, 2); // Colors
  entry.writeUInt8(0, 3); // Reserved
  entry.writeUInt16LE(1, 4); // Color planes
  entry.writeUInt16LE(32, 6); // Bits per pixel
  entry.writeUInt32LE(pngBuffer.length, 8); // Image size in bytes
  entry.writeUInt32LE(22, 12); // Offset to image data (6 + 16 = 22)

  return Buffer.concat([header, entry, pngBuffer]);
}

async function generateIcons() {
  console.log('🎨 Generating MeethaCart branded icons from SVG...');
  const svgBuffer = Buffer.from(iconSvg);

  // 1. Generate favicon 32x32 PNG and favicon.ico
  const png32 = await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toBuffer();
  const icoBuffer = createIcoFromPng(png32, 32);
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);
  console.log('✓ Created public/favicon.ico (32x32)');

  // 2. Generate apple-touch-icon.png (180x180)
  // Apple recommends a solid background or clean padded icon
  const appleTouchBg = await sharp({
    create: {
      width: 180,
      height: 180,
      channels: 4,
      background: { r: 255, g: 251, b: 243, alpha: 1 } // #FFFBF3
    }
  })
    .composite([
      {
        input: await sharp(svgBuffer).resize(140, 140).toBuffer(),
        gravity: 'center'
      }
    ])
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('✓ Created public/apple-touch-icon.png (180x180)');

  // 3. Generate icon-192.png (192x192)
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'icon-192.png'));
  console.log('✓ Created public/icon-192.png (192x192)');

  // 4. Generate icon-512.png (512x512)
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'icon-512.png'));
  console.log('✓ Created public/icon-512.png (512x512)');

  // 5. Generate logo-mark.png (for HTML emails)
  await sharp(svgBuffer)
    .resize(96, 96)
    .png()
    .toFile(path.join(publicDir, 'logo-mark.png'));
  console.log('✓ Created public/logo-mark.png (96x96 for emails)');

  console.log('✨ All icons generated successfully!');
}

generateIcons().catch((err) => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
