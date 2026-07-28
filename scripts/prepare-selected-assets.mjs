import { mkdir } from "node:fs/promises";
import { basename, join } from "node:path";
import sharp from "sharp";

const sourceDir =
  process.env.HAODAO_MEDIA_SOURCE_DIR ||
  "/private/tmp/haodao-media-staging";
const outputDir = new URL("../public/images/", import.meta.url).pathname;

const assets = [
  "about-hero.jpg",
  "learning-hero.jpg",
  "events-hero.jpg",
  "community-hero.jpg",
  "community-activity.jpg",
  "community-taipei.jpg",
  "community-taichung.jpg",
  "community-kaohsiung.jpg",
  "welfare-service.jpg",
  "welfare-culture.jpg",
  "welfare-care.jpg",
  "welfare-impact.jpg",
  "fazhou-calligraphy.jpg",
];

await mkdir(outputDir, { recursive: true });

for (const filename of assets) {
  const outputFilename = `${basename(filename, ".jpg")}.webp`;
  await sharp(join(sourceDir, filename))
    .rotate()
    .resize({
      width: 2200,
      height: 1600,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 84, effort: 5 })
    .toFile(join(outputDir, outputFilename));

  console.log(`Prepared ${outputFilename}`);
}
