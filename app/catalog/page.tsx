import { loadCatalog } from "../../lib/catalog";

export default async function CatalogDataPage() {
  const products = await loadCatalog();
  const missing = products.map((product) => ({
    sku: product.sku,
    missing: product.data_quality.missing_fields.length
  }));

  return (
    <div className="card p-6">
      <h2 className="text-lg font-semibold">Catalog Data Overview</h2>
      <p className="text-sm text-slate-600">
        {products.length} SKUs loaded from the harvested catalog.
      </p>
      <div className="mt-4 overflow-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b text-slate-500">
              <th className="py-2">SKU</th>
              <th className="py-2">Missing fields</th>
            </tr>
          </thead>
          <tbody>
            {missing.map((entry) => (
              <tr key={entry.sku} className="border-b">
                <td className="py-2 font-medium">{entry.sku}</td>
                <td className="py-2 text-slate-600">{entry.missing}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
