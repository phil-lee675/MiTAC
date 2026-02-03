import type { ProductSku } from "./schema";

export function generateTags(product: ProductSku): string[] {
  const tags = new Set<string>();

  if (product.cpu_vendor) {
    tags.add(`cpu:${product.cpu_vendor}`);
  }
  if (product.sockets !== null) {
    tags.add(`socket:${product.sockets}`);
  }
  if (product.memory_type) {
    const normalized = product.memory_type.toLowerCase();
    if (normalized.includes("ddr5")) tags.add("ddr5");
    if (normalized.includes("rdimm")) tags.add("rdimm");
    if (normalized.includes("lrdimm")) tags.add("lrdimm");
  }
  if (product.pcie_gen) {
    const match = product.pcie_gen.match(/(gen\s*\d|\d\.\d)/i);
    if (match) {
      tags.add(`pcie:${match[0].toLowerCase().replace(/\s+/g, "")}`);
    }
  }
  if (product.form_factor) {
    tags.add(`form:${product.form_factor.toLowerCase()}`);
  }
  if (product.node_density) {
    tags.add(`density:${product.node_density.toLowerCase()}`);
    if (product.node_density.match(/\d+n/i)) {
      tags.add("multi-node");
    }
  }
  if (product.gpu_support.max_gpu_count) {
    tags.add(`gpu:${product.gpu_support.max_gpu_count}`);
  }

  product.storage_bays.forEach((bay) => {
    const type = bay.type.toLowerCase();
    if (type.includes("nvme")) {
      if (type.includes("u.2") || type.includes("u.3")) tags.add("nvme:u2");
      if (type.includes("e1.s")) tags.add("nvme:e1s");
    }
  });

  return [...tags];
}
