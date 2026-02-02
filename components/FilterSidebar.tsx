"use client";

import { useState } from "react";
import { useCatalogStore } from "../app/state/catalogStore";

export function FilterSidebar({
  facets
}: {
  facets: Record<string, Record<string, number>>;
}) {
  const {
    selectedTags,
    filterMode,
    setFilterMode,
    savedViews,
    saveView,
    loadView,
    toggleTag
  } = useCatalogStore();
  const [viewName, setViewName] = useState("");

  return (
    <aside className="card flex h-full flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <span className="section-title">Filters</span>
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500">Mode</label>
          <select
            className="rounded border border-slate-200 px-2 py-1 text-xs"
            value={filterMode}
            onChange={(event) => setFilterMode(event.target.value as "and" | "or")}
            aria-label="Filter mode"
          >
            <option value="and">AND</option>
            <option value="or">OR</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="section-title">Tags</span>
        <div className="flex flex-wrap gap-2">
          {Object.entries(facets.tags ?? {}).map(([tag, count]) => (
            <button
              key={tag}
              type="button"
              className={`badge border ${
                selectedTags.includes(tag)
                  ? "border-brand-500 bg-brand-100 text-brand-700"
                  : "border-transparent"
              }`}
              onClick={() => toggleTag(tag)}
              aria-pressed={selectedTags.includes(tag)}
            >
              {tag} ({count})
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="section-title">Saved views</span>
        <div className="flex gap-2">
          <input
            value={viewName}
            onChange={(event) => setViewName(event.target.value)}
            className="w-full rounded border border-slate-200 px-2 py-1 text-xs"
            placeholder="View name"
          />
          <button
            type="button"
            className="rounded bg-brand-700 px-2 py-1 text-xs text-white"
            onClick={() => {
              if (!viewName.trim()) return;
              saveView(viewName.trim());
              setViewName("");
            }}
          >
            Save
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {savedViews.length === 0 && (
            <p className="text-xs text-slate-500">No saved views yet.</p>
          )}
          {savedViews.map((view) => (
            <button
              key={view.id}
              type="button"
              className="rounded border border-slate-200 px-2 py-1 text-left text-xs"
              onClick={() => loadView(view)}
            >
              {view.name}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
