"use client";

import { useEffect, useMemo, useState } from "react";
import type { ProductSku } from "../lib/schema";
import { applyRules, type Rule } from "../lib/rules";

const steps = [
  "Base",
  "CPU",
  "Memory",
  "Storage",
  "Network/AOC",
  "GPU",
  "PSU/Cooling",
  "Services",
  "Summary"
];

export function Configurator({
  product,
  components,
  rules
}: {
  product: ProductSku;
  components: Record<string, { id: string; label: string; tags: string[] }[]>;
  rules: Rule[];
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const [selected, setSelected] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const cfg = params.get("cfg");
    if (!cfg) return;
    try {
      const decoded = JSON.parse(atob(cfg));
      if (decoded?.sku === product.sku && decoded?.selected) {
        setSelected(decoded.selected as Record<string, string[]>);
      }
    } catch {
      // ignore invalid configs
    }
  }, [product.sku]);

  const selectedTags = useMemo(() => {
    const tags = new Set(product.tags);
    Object.values(selected).flat().forEach((value) => tags.add(value));
    return [...tags];
  }, [product.tags, selected]);

  const ruleResult = useMemo(() => {
    return applyRules(selectedTags, { storage_bays: product.storage_bays.length }, rules);
  }, [selectedTags, product.storage_bays.length, rules]);

  const stepKey = steps[stepIndex].toLowerCase();
  const availableOptions = components[stepKey] ?? [];

  const toggleOption = (option: string) => {
    setSelected((prev) => {
      const current = prev[stepKey] ?? [];
      const next = current.includes(option)
        ? current.filter((item) => item !== option)
        : [...current, option];
      return { ...prev, [stepKey]: next };
    });
  };

  const exportCsv = () => {
    const rows = [["item_id", "description", "qty", "notes"]];
    rows.push([product.sku, product.name ?? "Base system", "1", "Base SKU"]);
    Object.entries(selected).forEach(([key, values]) => {
      values.forEach((value) => rows.push([value, `${key} option`, "1", ""]));
    });
    const csv = rows.map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
    downloadFile(`config-${product.sku}.csv`, csv);
  };

  const exportJson = async () => {
    const hash = await createConfigHash(product.sku, selected);
    const payload = {
      sku: product.sku,
      selections: selected,
      derived_tags: ruleResult.derivedTags,
      warnings: ruleResult.warnings,
      config_hash: hash,
      timestamp: new Date().toISOString()
    };
    downloadFile(`config-${product.sku}.json`, JSON.stringify(payload, null, 2));
  };

  const shareLink = async () => {
    const hash = await createConfigHash(product.sku, selected);
    const encoded = btoa(JSON.stringify({ sku: product.sku, selected, hash }));
    const url = `${window.location.origin}/config/${product.sku}?cfg=${encodeURIComponent(encoded)}`;
    navigator.clipboard.writeText(url);
    alert("Shareable link copied to clipboard.");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <section className="card p-6">
        <h2 className="text-xl font-semibold">Configure {product.sku}</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {steps.map((step, index) => (
            <button
              key={step}
              type="button"
              className={`rounded-full px-3 py-1 text-xs ${
                index === stepIndex
                  ? "bg-brand-700 text-white"
                  : "bg-slate-100 text-slate-600"
              }`}
              onClick={() => setStepIndex(index)}
            >
              {step}
            </button>
          ))}
        </div>
        <div className="mt-6">
          <h3 className="text-sm font-semibold uppercase text-slate-500">{steps[stepIndex]}</h3>
          {availableOptions.length === 0 && (
            <p className="mt-4 text-sm text-slate-500">
              No selectable options; export base configuration only.
            </p>
          )}
          <div className="mt-4 flex flex-col gap-3">
            {availableOptions.map((option) => (
              <label key={option.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={(selected[stepKey] ?? []).includes(option.id)}
                  onChange={() => toggleOption(option.id)}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </div>
      </section>
      <aside className="card p-6">
        <span className="section-title">Summary</span>
        <ul className="mt-3 text-sm text-slate-600">
          <li>SKU: {product.sku}</li>
          <li>Selections: {Object.values(selected).flat().length}</li>
          <li>Derived tags: {ruleResult.derivedTags.join(", ") || "None"}</li>
        </ul>
        <div className="mt-4">
          <span className="section-title">Warnings</span>
          <ul className="mt-2 list-disc pl-4 text-xs text-slate-500">
            {ruleResult.warnings.length === 0 && <li>No warnings.</li>}
            {ruleResult.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
        <div className="mt-4 flex flex-col gap-2">
          <button
            type="button"
            className="rounded bg-brand-700 px-3 py-2 text-sm text-white"
            onClick={exportCsv}
          >
            Download BOM CSV
          </button>
          <button
            type="button"
            className="rounded border border-brand-700 px-3 py-2 text-sm text-brand-700"
            onClick={exportJson}
          >
            Download config JSON
          </button>
          <button
            type="button"
            className="rounded border border-slate-200 px-3 py-2 text-sm"
            onClick={shareLink}
          >
            Copy shareable link
          </button>
        </div>
      </aside>
    </div>
  );
}

function downloadFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

async function createConfigHash(
  sku: string,
  selected: Record<string, string[]>
) {
  const payload = JSON.stringify({ sku, selected });
  const data = new TextEncoder().encode(payload);
  const digest = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(digest));
  return hashArray.map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
