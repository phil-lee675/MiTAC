# MiTAC Catalog

TypeScript-first catalog harvester + browser for MiTAC Computing SKUs.

## Install

```bash
npm install
```

> Playwright requires browser binaries. Run `npx playwright install` once after install.

## Harvest

```bash
npm run harvest
```

Outputs:
- `catalog/products.json`
- `catalog/index.json`
- `catalog/raw/<sku>.html`
- `catalog/tags.json`

The harvester respects `robots.txt`, rate limits (1–2 req/sec), retries with exponential backoff, and caches HTML under `harvester/cache`.

## Run dev server

```bash
npm run dev
```

## Regenerate index

Re-run harvest to rebuild `catalog/index.json` and tags.

## Manual components and rules

- Edit `catalog/manual_components.json` to add selectable options per step (keyed by step name in lower case like `cpu`, `memory`, `storage`).
- Edit `catalog/rules.json` to add rules for `requires`, `excludes`, `min/max`, `depends_on`, and derived tags.

## Tests

```bash
npm test
```

Snapshot fixtures live in `tests/fixtures/` and validate parser output.
