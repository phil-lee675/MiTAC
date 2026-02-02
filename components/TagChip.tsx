"use client";

import { useCatalogStore } from "../app/state/catalogStore";

export function TagChip({ tag }: { tag: string }) {
  const { selectedTags, toggleTag } = useCatalogStore();
  const active = selectedTags.includes(tag);
  return (
    <button
      type="button"
      className={`badge border ${
        active ? "border-brand-500 bg-brand-100 text-brand-700" : "border-transparent"
      }`}
      onClick={() => toggleTag(tag)}
      aria-pressed={active}
    >
      {tag}
    </button>
  );
}
