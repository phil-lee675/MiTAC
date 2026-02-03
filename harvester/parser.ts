import { load } from "cheerio";
import type { ProductSku } from "../lib/schema";
import { ProductSkuSchema } from "../lib/schema";
import { generateTags } from "../lib/tags";

const labelMap: Record<string, string[]> = {
  name: ["product name", "model"],
  family: ["family"],
  form_factor: ["form factor", "form-factor", "chassis"],
  node_density: ["node density"],
  cpu_family: ["processor", "cpu"],
  sockets: ["socket", "cpu sockets"],
  memory_type: ["memory type", "memory"],
  memory_slots: ["memory slots"],
  max_memory_tb: ["max memory", "maximum memory"],
  pcie_gen: ["pcie", "pci-e"],
  power_notes: ["power"],
  cooling: ["cooling"],
  management: ["management", "bmc"],
  networking: ["network", "ocp"],
  gpu_support: ["gpu", "graphics"],
  solution_categories: ["solution", "category"]
};

function getText($: ReturnType<typeof load>, selector: string) {
  return $(selector).text().replace(/\s+/g, " ").trim();
}

function findLabelValue($: ReturnType<typeof load>, labels: string[]): string | null {
  const rows = $("table tr");
  for (const row of rows.toArray()) {
    const cells = $(row).find("th, td");
    if (cells.length < 2) continue;
    const key = $(cells[0]).text().toLowerCase();
    if (labels.some((label) => key.includes(label))) {
      return $(cells[1]).text().replace(/\s+/g, " ").trim();
    }
  }
  return null;
}

function parseNumber(value: string | null) {
  if (!value) return null;
  const match = value.match(/\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : null;
}

function detectCpuVendor(text: string | null) {
  if (!text) return null;
  const lower = text.toLowerCase();
  if (lower.includes("intel")) return "intel" as const;
  if (lower.includes("amd")) return "amd" as const;
  return null;
}

function parseStorageBays(text: string | null) {
  if (!text) return [];
  const entries: ProductSku["storage_bays"] = [];
  const parts = text.split(/,|;/);
  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const count = parseNumber(trimmed);
    entries.push({
      type: trimmed,
      count,
      hot_swap: trimmed.toLowerCase().includes("hot") ? true : null
    });
  }
  return entries;
}

function parseSolutionCategories(value: string | null) {
  if (!value) return [];
  return value
    .split(/,|\//)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function parseSkuPage(
  html: string,
  url: string,
  timestamp: string = new Date().toISOString()
): ProductSku {
  const $ = load(html);
  const title = getText($, "h1") || getText($, "title");
  const sku = url.split("/").filter(Boolean).pop() ?? title;
  const cleanedSku = sku?.split("?")[0] ?? "";

  const name = findLabelValue($, labelMap.name) ?? title || null;
  const family = findLabelValue($, labelMap.family);
  const formFactor = findLabelValue($, labelMap.form_factor);
  const nodeDensity = findLabelValue($, labelMap.node_density);
  const cpuFamily = findLabelValue($, labelMap.cpu_family);
  const sockets = parseNumber(findLabelValue($, labelMap.sockets));
  const memoryType = findLabelValue($, labelMap.memory_type);
  const memorySlots = parseNumber(findLabelValue($, labelMap.memory_slots));
  const maxMemoryTb = parseNumber(findLabelValue($, labelMap.max_memory_tb));
  const pcieGen = findLabelValue($, labelMap.pcie_gen);
  const storageBays = parseStorageBays(findLabelValue($, ["storage", "drive bay"]));
  const coolingText = findLabelValue($, labelMap.cooling);
  const managementText = findLabelValue($, labelMap.management);
  const networkingText = findLabelValue($, labelMap.networking);
  const gpuText = findLabelValue($, labelMap.gpu_support);

  const product: ProductSku = {
    sku: cleanedSku,
    name: name || null,
    family: family || null,
    solution_categories: parseSolutionCategories(
      findLabelValue($, labelMap.solution_categories)
    ),
    form_factor: formFactor || null,
    node_density: nodeDensity || null,
    cpu_vendor: detectCpuVendor(cpuFamily),
    cpu_family: cpuFamily || null,
    sockets,
    memory_type: memoryType || null,
    memory_slots: memorySlots,
    max_memory_tb: maxMemoryTb,
    pcie_gen: pcieGen || null,
    storage_bays: storageBays,
    networking: {
      ocp_mezz: networkingText?.toLowerCase().includes("ocp") ?? null,
      ocp_mezz_count: parseNumber(networkingText),
      notes: networkingText || null
    },
    gpu_support: {
      supported: gpuText ? true : null,
      max_gpu_count: parseNumber(gpuText),
      notes: gpuText || null
    },
    power_notes: findLabelValue($, labelMap.power_notes) || null,
    cooling: {
      mode: coolingText?.toLowerCase().includes("liquid")
        ? coolingText.toLowerCase().includes("ready")
          ? "liquid-ready"
          : "liquid"
        : coolingText
          ? "air"
          : null,
      notes: coolingText || null
    },
    management: {
      bmc: managementText ? managementText.toLowerCase().includes("bmc") : null,
      notes: managementText || null
    },
    tags: [],
    source_url: url,
    last_seen_at: timestamp,
    data_quality: {
      missing_fields: [],
      parse_warnings: []
    }
  };

  product.tags = generateTags(product);

  const missingFields: string[] = [];
  const checks: Array<[string, unknown]> = [
    ["name", product.name],
    ["family", product.family],
    ["solution_categories", product.solution_categories.length ? "ok" : null],
    ["form_factor", product.form_factor],
    ["node_density", product.node_density],
    ["cpu_vendor", product.cpu_vendor],
    ["cpu_family", product.cpu_family],
    ["sockets", product.sockets],
    ["memory_type", product.memory_type],
    ["memory_slots", product.memory_slots],
    ["max_memory_tb", product.max_memory_tb],
    ["pcie_gen", product.pcie_gen],
    ["storage_bays", product.storage_bays.length ? "ok" : null],
    ["networking", product.networking.notes],
    ["gpu_support", product.gpu_support.notes],
    ["power_notes", product.power_notes],
    ["cooling", product.cooling.notes],
    ["management", product.management.notes]
  ];

  for (const [field, value] of checks) {
    if (value === null || value === undefined) missingFields.push(field);
  }

  product.data_quality.missing_fields = missingFields;

  ProductSkuSchema.parse(product);
  return product;
}
