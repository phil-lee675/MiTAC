import { loadCatalog, loadManualComponents, loadRules } from "../../../lib/catalog";
import { Configurator } from "../../../components/Configurator";
import type { Rule } from "../../../lib/rules";

export default async function ConfiguratorPage({
  params
}: {
  params: { sku: string };
}) {
  const [products, manualComponents, rules] = await Promise.all([
    loadCatalog(),
    loadManualComponents(),
    loadRules()
  ]);
  const product = products.find((item) => item.sku === params.sku);

  if (!product) {
    return <div className="card p-6">SKU not found.</div>;
  }

  return (
    <Configurator
      product={product}
      components={manualComponents as Record<string, { id: string; label: string; tags: string[] }[]>}
      rules={rules as Rule[]}
    />
  );
}
