import fs from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { parseSkuPage } from "../../harvester/parser";

const fixtures = [
  "sku-a100.html",
  "sku-b200.html",
  "sku-c300.html",
  "sku-d400.html",
  "sku-e500.html"
];

describe("parseSkuPage", () => {
  it.each(fixtures)("parses %s", async (fixture) => {
    const html = await fs.readFile(
      path.join(__dirname, "../fixtures", fixture),
      "utf-8"
    );
    const sku = fixture.replace(/\.html$/, "").replace("sku-", "").toUpperCase();
    const result = parseSkuPage(
      html,
      `https://www.mitaccomputing.com/${sku}`,
      "2024-01-01T00:00:00.000Z"
    );
    expect(result).toMatchSnapshot();
  });
});
