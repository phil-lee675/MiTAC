"use client";

import { useEffect, useMemo, useState } from "react";
import MiniSearch from "minisearch";
import type { ProductSku } from "../lib/schema";
import { useCatalogStore } from "../app/state/catalogStore";
import { FilterSidebar } from "./FilterSidebar";
import { SkuCard } from "./SkuCard";
import { CompareTable } from "./CompareTable";

export type CatalogIndexPayload = {
  index: MiniSearch.Index;
  facets: Record<string, Record<string, number>>;
};

export function CatalogBrowser({
  products,
  indexPayload
}: {
  products: ProductSku[];
  indexPayload: CatalogIndexPayload;
}) {
  const {
    query,
    selectedTags,
    filterMode,
    setQuery,
    compareMode,
    compareSet,
    sortBy,
    setSortBy,
    toggleCompareMode
  } = useCatalogStore();
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [selectedSku, setSelectedSku] = useState<ProductSku | null>(null);

  useEffect(() => {
    const handle = window.setTimeout(() => setDebouncedQuery(query), 250);
    return () => window.clearTimeout(handle);
  }, [query]);

  const miniSearch = useMemo(() => {
    const search = new MiniSearch({
      fields: ["sku", "name", "family"],
      storeFields: ["sku"],
      searchOptions: {
        prefix: true,
        fuzzy: 0.2
      }
    });
    try {
      search.importJSON(indexPayload.index as unknown as string);
    } catch {
      // fallback to empty index
    }
    return search;
  }, [indexPayload.index]);

  const filteredProducts = useMemo(() => {
    const candidateSkus = debouncedQuery
      ? miniSearch.search(debouncedQuery).map((result) => result.sku as string)
      : products.map((product) => product.sku);

    const scoped = products.filter((product) => {
      if (!candidateSkus.includes(product.sku)) return false;
      if (selectedTags.length === 0) return true;
      const matches = selectedTags.map((tag) => product.tags.includes(tag));
      return filterMode === "and"
        ? matches.every(Boolean)
        : matches.some(Boolean);
    });

    return [...scoped].sort((a, b) => {
      if (sortBy === "name") return (a.name ?? "").localeCompare(b.name ?? "");
      if (sortBy === "form_factor") {
        return (a.form_factor ?? "").localeCompare(b.form_factor ?? "");
      }
      return candidateSkus.indexOf(a.sku) - candidateSkus.indexOf(b.sku);
    });
  }, [products, debouncedQuery, miniSearch, selectedTags, filterMode, sortBy]);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr_320px]">
      <FilterSidebar facets={indexPayload.facets} />
      <section className="flex flex-col gap-4">
        <div className="card flex flex-col gap-3 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-1 flex-col gap-1">
              <label className="text-xs text-slate-500" htmlFor="search">
                Search
              </label>
              <input
                id="search"
                className="rounded border border-slate-200 px-3 py-2 text-sm"
                placeholder="Search SKU, name, family"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-500" htmlFor="sort">
                Sort
              </label>
              <select
                id="sort"
                className="rounded border border-slate-200 px-2 py-2 text-xs"
                value={sortBy}
                onChange={(event) =>
                  setSortBy(event.target.value as "relevance" | "name" | "form_factor")
                }
              >
                <option value="relevance">Relevance</option>
                <option value="name">Name</option>
                <option value="form_factor">Form factor</option>
              </select>
              <button
                type="button"
                className={`rounded border px-3 py-2 text-sm ${
                  compareMode
                    ? "border-brand-500 bg-brand-100 text-brand-700"
                    : "border-slate-200"
                }`}
                onClick={toggleCompareMode}
              >
                Compare
              </button>
              <span className="text-xs text-slate-500">
                {filteredProducts.length} results
              </span>
            </div>
          </div>
        </div>
        {compareMode && compareSet.length > 0 && (
          <CompareTable
            products={products.filter((product) => compareSet.includes(product.sku))}
          />
        )}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredProducts.map((product) => (
            <SkuCard key={product.sku} sku={product} onSelect={setSelectedSku} />
          ))}
        </div>
      </section>
      <aside className="card h-fit p-4">
        <span className="section-title">SKU details</span>
        {selectedSku ? (
          <div className="mt-3 flex flex-col gap-3 text-sm text-slate-600">
            <div>
              <p className="text-base font-semibold text-slate-900">{selectedSku.sku}</p>
              <p>{selectedSku.name ?? "Unnamed SKU"}</p>
              <p className="text-xs text-slate-500">{selectedSku.family ?? "No family"}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedSku.tags.slice(0, 8).map((tag) => (
                <span key={tag} className="badge">
                  {tag}
                </span>
              ))}
            </div>
            <a
              className="rounded bg-brand-700 px-3 py-2 text-center text-sm text-white"
              href={`/config/${selectedSku.sku}`}
            >
              Start Config
            </a>
          </div>
        ) : (
          <p className="mt-3 text-sm text-slate-500">
            Select a SKU card to view details here.
          </p>
        )}
      </aside>
    </div>
  );
}
