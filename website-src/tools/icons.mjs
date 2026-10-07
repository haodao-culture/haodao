// Generates the site icons from the brand logo's calligraphy mark.
// Run manually after the logo changes: node website-src/tools/icons.mjs
// Outputs are committed; the regular build does not regenerate them.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const LOGO = 'https://media.haodao.org/images/website-20261005/LOGO-v2.webp';
const PAPER = '#f7f5ef';

const response = await fetch(LOGO);
if (!response.ok) throw new Error(`Cannot download logo: ${response.status}`);
const logo = sharp(Buffer.from(await response.arrayBuffer())).ensureAlpha();
const { data, info } = await logo.clone().raw().toBuffer({ resolveWithObject: true });

// The calligraphy mark sits on the left; the first fully transparent column
// after it separates it from the 昊道文化 wordmark.
const opaque = x => {
  for (let y = 0; y < info.height; y++) if (data[(y * info.width + x) * 4 + 3] > 8) return true;
  return false;
};
let gap = Math.floor(info.width * 0.2);
while (gap < info.width && opaque(gap)) gap++;
if (gap >= info.width * 0.6) throw new Error('Cannot find the gap between mark and wordmark');
// The gold dash before "HAODAO CULTURE" falls inside the mark's columns.
// Erase it, after checking its box is isolated so no calligraphy is cut.
const dash = { left: 240, top: 508, right: 305, bottom: 534 };
for (let x = dash.left; x <= dash.right; x++)
  for (const y of [dash.top, dash.bottom])
    if (data[(y * info.width + x) * 4 + 3] > 8) throw new Error('Dash box touches the mark');
for (let y = dash.top; y <= dash.bottom; y++)
  for (const x of [dash.left, dash.right])
    if (data[(y * info.width + x) * 4 + 3] > 8) throw new Error('Dash box touches the mark');
for (let y = dash.top; y <= dash.bottom; y++)
  for (let x = dash.left; x <= dash.right; x++) data[(y * info.width + x) * 4 + 3] = 0;
const cleaned = sharp(data, { raw: info });

// sharp runs trim before extract within one pipeline, so crop first.
const cropped = await cleaned
  .clone()
  .extract({ left: 0, top: 0, width: gap, height: info.height })
  .png()
  .toBuffer();
const mark = await sharp(cropped).trim({ threshold: 8 }).png().toBuffer();
const markInfo = await sharp(mark).metadata();

async function icon(size, { rounded, scale }) {
  const height = Math.round(size * scale);
  const width = Math.round((height * markInfo.width) / markInfo.height);
  const resized = await sharp(mark).resize({ width, height, kernel: 'lanczos3' }).png().toBuffer();
  const radius = rounded ? size * 0.18 : 0;
  const background = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${radius}" fill="${PAPER}"/></svg>`,
  );
  return sharp(background)
    .composite([
      {
        input: resized,
        left: Math.round((size - width) / 2),
        top: Math.round((size - height) / 2),
      },
    ])
    .png({ compressionLevel: 9 })
    .toBuffer();
}

// ICO files may contain PNG images directly; each entry is 16 bytes.
function ico(images) {
  const header = Buffer.alloc(6 + images.length * 16);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = header.length;
  images.forEach(({ size, png }, i) => {
    const entry = 6 + i * 16;
    header.writeUInt8(size, entry);
    header.writeUInt8(size, entry + 1);
    header.writeUInt16LE(1, entry + 4);
    header.writeUInt16LE(32, entry + 6);
    header.writeUInt32LE(png.length, entry + 8);
    header.writeUInt32LE(offset, entry + 12);
    offset += png.length;
  });
  return Buffer.concat([header, ...images.map(image => image.png)]);
}

// Browser tabs use a rounded tile; iOS applies its own mask to a full square.
const tab = { rounded: true, scale: 0.9 };
const sizes = await Promise.all(
  [16, 32, 48].map(async size => ({ size, png: await icon(size, tab) })),
);
fs.writeFileSync(path.join(root, 'favicon.ico'), ico(sizes));
const svgPng = (await icon(192, tab)).toString('base64');
fs.writeFileSync(
  path.join(root, 'favicon.svg'),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><image width="192" height="192" href="data:image/png;base64,${svgPng}"/></svg>\n`,
);
fs.writeFileSync(
  path.join(root, 'apple-touch-icon.png'),
  await icon(180, { rounded: false, scale: 0.8 }),
);
console.log(
  `Icons written from ${markInfo.width}×${markInfo.height} mark: favicon.ico, favicon.svg, apple-touch-icon.png`,
);
