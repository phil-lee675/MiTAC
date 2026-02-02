import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";
import { load } from "cheerio";
import { createFetcher, fetchWithRetry } from "./fetcher";
import { ensureDir } from "./utils";
import { parseSkuPage } from "./parser";
import { writeCatalogArtifacts } from "./indexer";
import { seedUrls } from "./seeds";

const catalogDir = path.join(process.cwd(), "catalog");
const rawDir = path.join(catalogDir, "raw");
const logDir = path.join(catalogDir, "logs");
const cacheDir = path.join(process.cwd(), "harvester", "cache");

async function shouldUsePlaywright(html: string) {
  return html.includes("data-reactroot") || html.includes("__NEXT_DATA__");
}

async function fetchWithPlaywright(url: string) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle" });
  const content = await page.content();
  await browser.close();
  return content;
}

function extractLinks(html: string, baseUrl: string) {
  const $ = load(html);
  const links = new Set<string>();
  $("a[href]").each((_, element) => {
    const href = $(element).attr("href");
    if (!href) return;
    const url = new URL(href, baseUrl).toString();
    if (!url.includes("mitaccomputing.com")) return;
    links.add(url.split("#")[0]);
  });
  return [...links];
}

function isProductUrl(url: string) {
  return /mitaccomputing\.com\/(products|product|solutions)\//.test(url);
}

async function main() {
  await ensureDir(catalogDir);
  await ensureDir(rawDir);
  await ensureDir(logDir);

  const fetcher = await createFetcher(cacheDir, "https://www.mitaccomputing.com");
  const visited = new Set<string>();
  const productUrls = new Set<string>();
  const queue = [...seedUrls];

  while (queue.length > 0) {
    const url = queue.shift();
    if (!url || visited.has(url)) continue;
    visited.add(url);

    try {
      const { html } = await fetchWithRetry(fetcher, url);
      const links = extractLinks(html, url);
      for (const link of links) {
        if (!visited.has(link)) queue.push(link);
        if (isProductUrl(link)) productUrls.add(link);
      }
    } catch (error) {
      await fs.appendFile(
        path.join(logDir, "crawl.log"),
        `[${new Date().toISOString()}] ${url} ${String(error)}\n`
      );
    }
  }

  const products = [];
  const timestamp = new Date().toISOString();
  const userTagsPath = path.join(catalogDir, "user_tags.json");
  let userTags: Record<string, string[]> = {};
  try {
    userTags = JSON.parse(await fs.readFile(userTagsPath, "utf-8"));
  } catch {
    userTags = {};
  }
  for (const url of [...productUrls]) {
    try {
      const { html } = await fetchWithRetry(fetcher, url);
      const usePlaywright = await shouldUsePlaywright(html);
      const finalHtml = usePlaywright ? await fetchWithPlaywright(url) : html;
      const product = parseSkuPage(finalHtml, url, timestamp);
      const extraTags = userTags[product.sku] ?? [];
      product.tags = Array.from(new Set([...product.tags, ...extraTags]));
      products.push(product);
      await fs.writeFile(path.join(rawDir, `${product.sku}.html`), finalHtml, "utf-8");
      await fs.appendFile(
        path.join(logDir, "parse.log"),
        `[${new Date().toISOString()}] ${product.sku} parsed from ${url}\n`
      );
    } catch (error) {
      await fs.appendFile(
        path.join(logDir, "parse.log"),
        `[${new Date().toISOString()}] ${url} failed: ${String(error)}\n`
      );
    }
  }

  products.sort((a, b) => a.sku.localeCompare(b.sku));
  await writeCatalogArtifacts(catalogDir, products);

  const manualComponentsPath = path.join(catalogDir, "manual_components.json");
  const rulesPath = path.join(catalogDir, "rules.json");

  if (!(await exists(manualComponentsPath))) {
    await fs.writeFile(manualComponentsPath, JSON.stringify({}, null, 2));
  }
  if (!(await exists(userTagsPath))) {
    await fs.writeFile(userTagsPath, JSON.stringify({}, null, 2));
  }
  if (!(await exists(rulesPath))) {
    await fs.writeFile(
      rulesPath,
      JSON.stringify(
        [
          {
            id: "gpu-requires-power",
            match_tags: ["gpu:4"],
            requires: ["power:redundant"],
            auto_add: ["power-check"]
          }
        ],
        null,
        2
      )
    );
  }
}

async function exists(filePath: string) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
