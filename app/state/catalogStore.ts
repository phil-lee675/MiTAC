"use client";

import { create } from "zustand";

export type FilterMode = "and" | "or";

export type SavedView = {
  id: string;
  name: string;
  query: string;
  tags: string[];
  mode: FilterMode;
};

export type CatalogState = {
  query: string;
  selectedTags: string[];
  filterMode: FilterMode;
  compareMode: boolean;
  compareSet: string[];
  sortBy: "relevance" | "name" | "form_factor";
  savedViews: SavedView[];
  setQuery: (value: string) => void;
  toggleTag: (tag: string) => void;
  setFilterMode: (mode: FilterMode) => void;
  toggleCompareMode: () => void;
  toggleCompareSku: (sku: string) => void;
  setSortBy: (value: "relevance" | "name" | "form_factor") => void;
  saveView: (name: string) => void;
  loadView: (view: SavedView) => void;
};

export const useCatalogStore = create<CatalogState>((set, get) => ({
  query: "",
  selectedTags: [],
  filterMode: "and",
  compareMode: false,
  compareSet: [],
  sortBy: "relevance",
  savedViews: [],
  setQuery: (value) => set({ query: value }),
  toggleTag: (tag) => {
    const current = get().selectedTags;
    const next = current.includes(tag)
      ? current.filter((t) => t !== tag)
      : [...current, tag];
    set({ selectedTags: next });
  },
  setFilterMode: (mode) => set({ filterMode: mode }),
  toggleCompareMode: () => set({ compareMode: !get().compareMode }),
  toggleCompareSku: (sku) => {
    const current = get().compareSet;
    if (current.includes(sku)) {
      set({ compareSet: current.filter((item) => item !== sku) });
      return;
    }
    if (current.length >= 4) return;
    set({ compareSet: [...current, sku] });
  },
  setSortBy: (value) => set({ sortBy: value }),
  saveView: (name) => {
    const { query, selectedTags, filterMode } = get();
    const view: SavedView = {
      id: `${Date.now()}`,
      name,
      query,
      tags: selectedTags,
      mode: filterMode
    };
    set({ savedViews: [...get().savedViews, view] });
  },
  loadView: (view) => {
    set({
      query: view.query,
      selectedTags: view.tags,
      filterMode: view.mode
    });
  }
}));
