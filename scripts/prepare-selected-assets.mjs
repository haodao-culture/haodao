import { mkdir } from "node:fs/promises";
import { basename, join } from "node:path";
import sharp from "sharp";

const sourceDir =
  process.env.HAODAO_MEDIA_SOURCE_DIR ||
  "/private/tmp/haodao-media-staging";
const outputDir = new URL("../public/images/", import.meta.url).pathname;

const assets = [
  ["about-hero.jpg"],
  ["learning-hero.jpg"],
  ["events-hero.jpg"],
  // Keep the community page people-free until explicit publication consent is
  // available for identifiable partners.
  ["community-taichung.jpg", "community-hero.webp"],
  ["community-taipei.jpg", "community-activity.webp"],
  ["community-taipei.jpg"],
  ["community-taichung.jpg"],
  ["community-kaohsiung.jpg"],
  ["welfare-service.jpg"],
  ["welfare-culture.jpg"],
  ["welfare-care.jpg"],
  ["welfare-impact.jpg"],
  ["fazhou-calligraphy.jpg"],
];

await mkdir(outputDir, { recursive: true });

for (const [sourceFilename, explicitOutputFilename] of assets) {
  const outputFilename =
    explicitOutputFilename || `${basename(sourceFilename, ".jpg")}.webp`;
  await sharp(join(sourceDir, sourceFilename))
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
