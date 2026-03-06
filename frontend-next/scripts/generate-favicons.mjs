import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const publicDir = join(root, 'public');
const appDir = join(root, 'app');

const sourceImage = join(publicDir, 'logo ac.png');

async function generateFavicons() {
  const input = readFileSync(sourceImage);

  // 1. Rename/copy original as logo.png (no spaces)
  const logoPng = await sharp(input)
    .resize(512, 512, { fit: 'contain', background: { r: 242, g: 235, b: 221, alpha: 1 } })
    .png({ quality: 90 })
    .toBuffer();
  writeFileSync(join(publicDir, 'logo.png'), logoPng);
  console.log('Created: public/logo.png (512x512)');

  // 2. favicon-16x16.png
  const f16 = await sharp(input)
    .resize(16, 16, { fit: 'contain', background: { r: 242, g: 235, b: 221, alpha: 1 } })
    .png()
    .toBuffer();
  writeFileSync(join(publicDir, 'favicon-16x16.png'), f16);
  console.log('Created: public/favicon-16x16.png');

  // 3. favicon-32x32.png
  const f32 = await sharp(input)
    .resize(32, 32, { fit: 'contain', background: { r: 242, g: 235, b: 221, alpha: 1 } })
    .png()
    .toBuffer();
  writeFileSync(join(publicDir, 'favicon-32x32.png'), f32);
  console.log('Created: public/favicon-32x32.png');

  // 4. favicon.ico (32x32 PNG works as ico in modern browsers)
  writeFileSync(join(publicDir, 'favicon.ico'), f32);
  console.log('Created: public/favicon.ico');

  // 5. apple-touch-icon.png (180x180)
  const apple = await sharp(input)
    .resize(180, 180, { fit: 'contain', background: { r: 242, g: 235, b: 221, alpha: 1 } })
    .png({ quality: 95 })
    .toBuffer();
  writeFileSync(join(publicDir, 'apple-touch-icon.png'), apple);
  console.log('Created: public/apple-touch-icon.png (180x180)');

  // 6. icon-192x192.png (for PWA/manifest)
  const i192 = await sharp(input)
    .resize(192, 192, { fit: 'contain', background: { r: 242, g: 235, b: 221, alpha: 1 } })
    .png({ quality: 95 })
    .toBuffer();
  writeFileSync(join(publicDir, 'icon-192x192.png'), i192);
  console.log('Created: public/icon-192x192.png');

  // 7. icon-512x512.png (for PWA splash)
  writeFileSync(join(publicDir, 'icon-512x512.png'), logoPng);
  console.log('Created: public/icon-512x512.png');

  // 8. og-image-logo.png (1200x630 with logo centered on deepGreen background)
  const ogLogo = await sharp({
    create: {
      width: 1200,
      height: 630,
      channels: 4,
      background: { r: 14, g: 59, b: 47, alpha: 1 },
    },
  })
    .composite([
      {
        input: await sharp(input)
          .resize(280, 280, { fit: 'contain', background: { r: 14, g: 59, b: 47, alpha: 0 } })
          .png()
          .toBuffer(),
        gravity: 'centre',
        top: 60,
        left: 460,
      },
    ])
    .png({ quality: 95 })
    .toBuffer();
  writeFileSync(join(publicDir, 'og-image-logo.png'), ogLogo);
  console.log('Created: public/og-image-logo.png (1200x630)');

  // 9. Next.js app/icon.png (for automatic favicon via metadata)
  const icon32 = await sharp(input)
    .resize(32, 32, { fit: 'contain', background: { r: 242, g: 235, b: 221, alpha: 1 } })
    .png()
    .toBuffer();
  writeFileSync(join(appDir, 'icon.png'), icon32);
  console.log('Created: app/icon.png (32x32)');

  // 10. Next.js app/apple-icon.png
  writeFileSync(join(appDir, 'apple-icon.png'), apple);
  console.log('Created: app/apple-icon.png (180x180)');

  console.log('\nAll favicons generated successfully!');
}

generateFavicons().catch(console.error);
