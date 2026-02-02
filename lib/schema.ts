import { z } from "zod";

export const StorageBaySchema = z.object({
  type: z.string(),
  count: z.number().nullable(),
  hot_swap: z.boolean().nullable()
});

export const ProductSkuSchema = z.object({
  sku: z.string(),
  name: z.string().nullable(),
  family: z.string().nullable(),
  solution_categories: z.array(z.string()),
  form_factor: z.string().nullable(),
  node_density: z.string().nullable(),
  cpu_vendor: z.enum(["intel", "amd"]).nullable(),
  cpu_family: z.string().nullable(),
  sockets: z.number().nullable(),
  memory_type: z.string().nullable(),
  memory_slots: z.number().nullable(),
  max_memory_tb: z.number().nullable(),
  pcie_gen: z.string().nullable(),
  storage_bays: z.array(StorageBaySchema),
  networking: z.object({
    ocp_mezz: z.boolean().nullable(),
    ocp_mezz_count: z.number().nullable(),
    notes: z.string().nullable()
  }),
  gpu_support: z.object({
    supported: z.boolean().nullable(),
    max_gpu_count: z.number().nullable(),
    notes: z.string().nullable()
  }),
  power_notes: z.string().nullable(),
  cooling: z.object({
    mode: z.enum(["air", "liquid-ready", "liquid"]).nullable(),
    notes: z.string().nullable()
  }),
  management: z.object({
    bmc: z.boolean().nullable(),
    notes: z.string().nullable()
  }),
  tags: z.array(z.string()),
  source_url: z.string(),
  last_seen_at: z.string(),
  data_quality: z.object({
    missing_fields: z.array(z.string()),
    parse_warnings: z.array(z.string())
  })
});

export type ProductSku = z.infer<typeof ProductSkuSchema>;

export const CatalogSchema = z.array(ProductSkuSchema);
