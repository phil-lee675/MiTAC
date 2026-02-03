import { loadCatalog, loadIndex } from "../lib/catalog";
import { CatalogBrowser } from "../components/CatalogBrowser";

export default async function CatalogPage() {
  const [products, indexPayload] = await Promise.all([
    loadCatalog(),
    loadIndex()
  ]);

  return <CatalogBrowser products={products} indexPayload={indexPayload} />;
}
