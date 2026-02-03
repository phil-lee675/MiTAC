"use client";

import type { ProductSku } from "../lib/schema";
import { useCatalogStore } from "../app/state/catalogStore";

export function SkuCard({
  sku,
  onSelect
}: {
  sku: ProductSku;
  onSelect?: (sku: ProductSku) => void;
}) {
  const { compareMode, compareSet, toggleCompareSku } = useCatalogStore();
  const inCompare = compareSet.includes(sku.sku);

  return (
    <div className="card flex h-full flex-col gap-3 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{sku.sku}</h3>
          <p className="text-sm text-slate-600">
            {sku.name ?? "Unnamed SKU"}
          </p>
          <p className="text-xs text-slate-500">{sku.family ?? "No family"}</p>
        </div>
        {compareMode && (
          <button
            type="button"
            className={`badge border ${
              inCompare
                ? "border-brand-500 bg-brand-100 text-brand-700"
                : "border-slate-200"
            }`}
            onClick={() => toggleCompareSku(sku.sku)}
            aria-pressed={inCompare}
          >
            {inCompare ? "Compared" : "Compare"}
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2 text-xs text-slate-700">
        <span className="badge">{sku.form_factor ?? "Form factor N/A"}</span>
        <span className="badge">{sku.cpu_vendor ?? "CPU N/A"}</span>
        <span className="badge">Sockets: {sku.sockets ?? "N/A"}</span>
        <span className="badge">Memory: {sku.memory_type ?? "N/A"}</span>
        <span className="badge">PCIe: {sku.pcie_gen ?? "N/A"}</span>
      </div>
      <div className="mt-auto flex flex-wrap gap-2">
        {sku.tags.slice(0, 6).map((tag) => (
          <span key={tag} className="badge">
            {tag}
          </span>
        ))}
      </div>
      <a
        href={`/sku/${sku.sku}`}
        className="text-sm font-medium text-brand-700 hover:text-brand-500"
      >
        View details →
      </a>
      {onSelect && (
        <button
          type="button"
          className="text-left text-xs text-slate-500 hover:text-slate-700"
          onClick={() => onSelect(sku)}
        >
          Quick view
        </button>
      )}
    </div>
  );
}
