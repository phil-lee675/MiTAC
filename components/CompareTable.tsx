"use client";

import type { ProductSku } from "../lib/schema";

export function CompareTable({ products }: { products: ProductSku[] }) {
  if (products.length === 0) return null;

  return (
    <div className="card p-4">
      <h3 className="text-sm font-semibold text-slate-600">Compare SKUs</h3>
      <div className="mt-3 overflow-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b text-left text-slate-500">
              <th className="py-2">Field</th>
              {products.map((product) => (
                <th key={product.sku} className="py-2">
                  {product.sku}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ["Form factor", "form_factor"],
              ["CPU", "cpu_family"],
              ["Sockets", "sockets"],
              ["Memory", "memory_type"],
              ["PCIe", "pcie_gen"],
              ["GPU", "gpu_support"],
              ["Storage", "storage_bays"]
            ].map(([label, key]) => (
              <tr key={label as string} className="border-b">
                <td className="py-2 font-medium text-slate-600">{label}</td>
                {products.map((product) => {
                  let value: string | number = "N/A";
                  if (key === "gpu_support") {
                    value = product.gpu_support.notes ?? "N/A";
                  } else if (key === "storage_bays") {
                    value = product.storage_bays.map((bay) => bay.type).join(", ") || "N/A";
                  } else {
                    const record = product as Record<string, unknown>;
                    value = (record[key] as string | number | null) ?? "N/A";
                  }
                  return (
                    <td key={`${product.sku}-${label}`} className="py-2 text-slate-700">
                      {value}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
