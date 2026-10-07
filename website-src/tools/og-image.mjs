// Generates /og-image.jpg, the 1200×630 image shown when pages are shared.
// Layout: the homepage sunrise collage, with the logo and, below it, the
// slogan 明理・修煉・愿行 centred in the paper area.
// The slogan is stored as outlines from Noto Serif TC SemiBold (SIL Open Font
// License) in website-src/icons/og-slogan.svg, so rendering needs no fonts.
// Run manually after the artwork changes: node website-src/tools/og-image.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const src = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const root = path.resolve(src, '..');
const MEDIA = 'https://media.haodao.org/images/website-20261005/';
const W = 1200;
const H = 630;

async function download(file) {
  const response = await fetch(MEDIA + file);
  if (!response.ok) throw new Error(`Cannot download ${file}: ${response.status}`);
  return Buffer.from(await response.arrayBuffer());
}

// Zoom into the collage's top-left so its paper area reaches the centre.
// Chat apps (LINE, Slack) show only a centred square thumbnail, so the logo
// and slogan stay inside the middle 630×630.
const collage = await download('home-sunrise-collage-20261006.webp');
const { width: cw, height: ch } = await sharp(collage).metadata();
const scale = Math.max(W / cw, H / ch) * 1.25;
const cropHeight = Math.round(H / scale);
const cropWidth = Math.round(W / scale);
const background = await sharp(collage)
  .extract({
    left: 0,
    top: Math.round((ch - cropHeight) * 0.05),
    width: cropWidth,
    height: cropHeight,
  })
  .resize(W, H, { kernel: 'lanczos3' })
  .toBuffer();

const logoHeight = 200;
const logo = await sharp(await download('LOGO-v2.webp'))
  .resize({ height: logoHeight, kernel: 'lanczos3' })
  .png()
  .toBuffer();
const { width: logoWidth } = await sharp(logo).metadata();
// The wordmark makes the logo look right-heavy, so nudge it left of centre.
const logoLeft = Math.round((W - logoWidth) / 2) - 20;
const logoTop = 30;

// The slogan is centred below the logo.
const slogan = fs.readFileSync(path.join(src, 'icons/og-slogan.svg'));
const { width: sloganWidth } = await sharp(slogan).metadata();

const image = await sharp(background)
  .composite([
    { input: logo, left: logoLeft, top: logoTop },
    { input: slogan, left: Math.round((W - sloganWidth) / 2), top: logoTop + logoHeight + 26 },
  ])
  .jpeg({ quality: 86, mozjpeg: true })
  .toBuffer();
fs.writeFileSync(path.join(root, 'og-image.jpg'), image);
console.log(`og-image.jpg written: ${W}×${H}, ${Math.round(image.length / 1024)} KB`);
