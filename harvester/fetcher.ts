import fs from "node:fs/promises";
import path from "node:path";
import robotsParser from "robots-parser";
import { cachePath, ensureDir, sleep } from "./utils";

const userAgent = "MiTACCatalogHarvester/1.0";

export async function createFetcher(cacheDir: string, baseUrl: string) {
  await ensureDir(cacheDir);
  const robotsUrl = new URL("/robots.txt", baseUrl).toString();
  const robotsTxt = await fetch(robotsUrl, { headers: { "User-Agent": userAgent } })
    .then((res) => res.text())
    .catch(() => "");
  const robots = robotsParser(robotsUrl, robotsTxt);

  return async function fetchWithCache(url: string) {
    if (!robots.isAllowed(url, userAgent)) {
      throw new Error(`Blocked by robots.txt: ${url}`);
    }
    const filePath = cachePath(cacheDir, url);
    try {
      const cached = await fs.readFile(filePath, "utf-8");
      return { html: cached, fromCache: true };
    } catch {
      // continue
    }

    const response = await fetch(url, {
      headers: { "User-Agent": userAgent }
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status}`);
    }
    const html = await response.text();
    await fs.writeFile(filePath, html, "utf-8");
    await sleep(600 + Math.random() * 400);
    return { html, fromCache: false };
  };
}

export async function fetchWithRetry(fetcher: (url: string) => Promise<{ html: string }>, url: string) {
  let attempt = 0;
  let delay = 500;
  while (attempt < 4) {
    try {
      return await fetcher(url);
    } catch (error) {
      attempt += 1;
      if (attempt >= 4) throw error;
      await sleep(delay);
      delay *= 2;
    }
  }
  throw new Error("Unreachable");
}
