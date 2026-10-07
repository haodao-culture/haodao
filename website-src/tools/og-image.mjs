// Generates /og-image.jpg, the 1200×630 image shown when pages are shared.
// Layout: the homepage sunrise collage, with the logo and the slogan
// 明理・修煉・愿行 in the paper area at the top left.
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

// Cover the frame with the collage, keeping its upper part where the paper is.
const collage = await download('home-sunrise-collage-20261006.webp');
const { width: cw, height: ch } = await sharp(collage).metadata();
const scale = Math.max(W / cw, H / ch);
const cropHeight = Math.round(H / scale);
const cropWidth = Math.round(W / scale);
const background = await sharp(collage)
  .extract({
    left: Math.round((cw - cropWidth) / 2),
    top: Math.round((ch - cropHeight) * 0.2),
    width: cropWidth,
    height: cropHeight,
  })
  .resize(W, H, { kernel: 'lanczos3' })
  .toBuffer();

const logoHeight = 215;
const logo = await sharp(await download('LOGO-v2.webp'))
  .resize({ height: logoHeight, kernel: 'lanczos3' })
  .png()
  .toBuffer();
const { width: logoWidth } = await sharp(logo).metadata();
const logoLeft = 60;
const logoTop = 45;

// The slogan sits right of the logo, vertically centred on it, left of the sun.
const slogan = fs.readFileSync(path.join(src, 'icons/og-slogan.svg'));
const { height: sloganHeight } = await sharp(slogan).metadata();

const image = await sharp(background)
  .composite([
    { input: logo, left: logoLeft, top: logoTop },
    {
      input: slogan,
      left: logoLeft + logoWidth + 36,
      top: Math.round(logoTop + logoHeight / 2 - sloganHeight / 2),
    },
  ])
  .jpeg({ quality: 86, mozjpeg: true })
  .toBuffer();
fs.writeFileSync(path.join(root, 'og-image.jpg'), image);
console.log(`og-image.jpg written: ${W}×${H}, ${Math.round(image.length / 1024)} KB`);
