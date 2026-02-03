import { loadCatalog } from "../../../lib/catalog";

export default async function SkuDetailsPage({
  params
}: {
  params: { sku: string };
}) {
  const products = await loadCatalog();
  const product = products.find((item) => item.sku === params.sku);

  if (!product) {
    return <div className="card p-6">SKU not found.</div>;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <div className="card p-6">
        <h2 className="text-2xl font-semibold">{product.sku}</h2>
        <p className="text-sm text-slate-600">{product.name ?? "Unnamed"}</p>
        <div className="mt-4 grid gap-3 text-sm">
          <div className="flex flex-wrap gap-2">
            {product.tags.map((tag) => (
              <span key={tag} className="badge">
                {tag}
              </span>
            ))}
          </div>
          <div>
            <span className="section-title">Specs</span>
            <ul className="mt-2 list-disc pl-4 text-slate-700">
              <li>Form factor: {product.form_factor ?? "N/A"}</li>
              <li>CPU vendor: {product.cpu_vendor ?? "N/A"}</li>
              <li>CPU family: {product.cpu_family ?? "N/A"}</li>
              <li>Memory type: {product.memory_type ?? "N/A"}</li>
              <li>PCIe: {product.pcie_gen ?? "N/A"}</li>
            </ul>
          </div>
          <div>
            <span className="section-title">Source</span>
            <p className="text-sm text-slate-600">
              <a className="text-brand-700" href={product.source_url}>
                {product.source_url}
              </a>
            </p>
          </div>
        </div>
      </div>
      <aside className="card p-6">
        <span className="section-title">Data quality</span>
        <ul className="mt-2 list-disc pl-4 text-sm text-slate-600">
          {product.data_quality.missing_fields.length === 0 && (
            <li>No missing fields reported.</li>
          )}
          {product.data_quality.missing_fields.map((field) => (
            <li key={field}>Missing: {field}</li>
          ))}
        </ul>
        <a
          className="mt-4 inline-flex rounded bg-brand-700 px-3 py-2 text-sm text-white"
          href={`/config/${product.sku}`}
        >
          Start Config
        </a>
      </aside>
    </div>
  );
}
