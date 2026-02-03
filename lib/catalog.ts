import fs from "node:fs/promises";
import path from "node:path";
import type { ProductSku } from "./schema";
import { CatalogSchema } from "./schema";

const catalogRoot = path.join(process.cwd(), "catalog");

export async function loadCatalog(): Promise<ProductSku[]> {
  const filePath = path.join(catalogRoot, "products.json");
  const raw = await fs.readFile(filePath, "utf-8");
  const parsed = JSON.parse(raw);
  return CatalogSchema.parse(parsed);
}

export async function loadIndex() {
  const filePath = path.join(catalogRoot, "index.json");
  const raw = await fs.readFile(filePath, "utf-8");
  return JSON.parse(raw) as {
    index: unknown;
    facets: Record<string, Record<string, number>>;
  };
}

export async function loadUserTags() {
  const filePath = path.join(catalogRoot, "user_tags.json");
  const raw = await fs.readFile(filePath, "utf-8");
  return JSON.parse(raw) as Record<string, string[]>;
}

export async function loadManualComponents() {
  const filePath = path.join(catalogRoot, "manual_components.json");
  const raw = await fs.readFile(filePath, "utf-8");
  return JSON.parse(raw) as Record<string, unknown>;
}

export async function loadRules() {
  const filePath = path.join(catalogRoot, "rules.json");
  const raw = await fs.readFile(filePath, "utf-8");
  return JSON.parse(raw) as unknown[];
}
