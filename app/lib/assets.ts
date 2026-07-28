const configuredAssetBase = process.env.NEXT_PUBLIC_ASSET_BASE_URL?.replace(
  /\/+$/,
  "",
);

function toR2Key(path: string) {
  const cleanPath = path.replace(/^\/+/, "");
  return cleanPath.split("/").at(-1) || cleanPath;
}

/**
 * Uses the public R2 custom domain when configured and the bundled file when
 * developing locally or before the R2 bucket is connected.
 */
export function assetUrl(path: string) {
  if (/^(?:https?:)?\/\//i.test(path) || path.startsWith("data:")) {
    return path;
  }

  if (!configuredAssetBase) {
    return path.startsWith("/") ? path : `/${path}`;
  }

  return `${configuredAssetBase}/${toR2Key(path)}`;
}
