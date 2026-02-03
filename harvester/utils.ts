import fs from "node:fs/promises";
import path from "node:path";

export async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

export async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function normalizeSku(input: string) {
  return input.replace(/\s+/g, " ").trim();
}

export function cachePath(cacheDir: string, url: string) {
  const safe = Buffer.from(url).toString("base64url");
  return path.join(cacheDir, `${safe}.html`);
}
