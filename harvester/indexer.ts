import fs from "node:fs/promises";
import path from "node:path";
import MiniSearch from "minisearch";
import type { ProductSku } from "../lib/schema";

export async function writeCatalogArtifacts(
  catalogDir: string,
  products: ProductSku[]
) {
  const productsPath = path.join(catalogDir, "products.json");
  await fs.writeFile(productsPath, JSON.stringify(products, null, 2));

  const miniSearch = new MiniSearch({
    idField: "sku",
    fields: ["sku", "name", "family"],
    storeFields: ["sku", "tags", "solution_categories", "form_factor"]
  });
  miniSearch.addAll(products);

  const facets: Record<string, Record<string, number>> = { tags: {} };
  for (const product of products) {
    for (const tag of product.tags) {
      facets.tags[tag] = (facets.tags[tag] ?? 0) + 1;
    }
  }

  const indexPayload = {
    index: miniSearch.exportJSON(),
    facets
  };

  await fs.writeFile(
    path.join(catalogDir, "index.json"),
    JSON.stringify(indexPayload, null, 2)
  );

  const tagVocabulary = Object.entries(facets.tags)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);

  await fs.writeFile(
    path.join(catalogDir, "tags.json"),
    JSON.stringify(tagVocabulary, null, 2)
  );
}
