import { readdirSync, statSync } from "node:fs";
import { basename, join } from "node:path";
import { spawnSync } from "node:child_process";

const bucket = process.env.R2_BUCKET || "haodao-media";
const prefix = (process.env.R2_PREFIX || "development/website-mvp").replace(
  /^\/+|\/+$/g,
  "",
);

const projectRoot = new URL("..", import.meta.url).pathname;
const sources = [
  join(projectRoot, "public", "home-hero.png"),
  join(projectRoot, "public", "images"),
];

function collect(path) {
  if (statSync(path).isDirectory()) {
    return readdirSync(path).flatMap((entry) => collect(join(path, entry)));
  }
  return [path];
}

const files = sources.flatMap(collect);

for (const file of files) {
  const objectKey = `${prefix}/${basename(file)}`;
  const result = spawnSync(
    "npx",
    [
      "wrangler",
      "r2",
      "object",
      "put",
      `${bucket}/${objectKey}`,
      "--file",
      file,
      "--remote",
    ],
    { cwd: projectRoot, stdio: "inherit" },
  );

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

console.log(`Uploaded ${files.length} assets to ${bucket}/${prefix}/`);
