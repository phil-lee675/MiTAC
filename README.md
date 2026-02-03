# MiTAC Catalog

TypeScript-first catalog harvester + browser for MiTAC Computing SKUs.

## Requirements

- Node.js 18+ (includes npm).
- Playwright browser binaries (installed via `npx playwright install`).

## Install

```bash
npm install
```

> Playwright requires browser binaries. Run `npx playwright install` once after install.

### Windows 11 quick start (.bat)

```bat
All-in-one setup (installs npm dependencies and Playwright browsers):

```bat
scripts\\setup.bat
```

### Windows 11 quick start (.bat)

```bat
scripts\\setup.bat
scripts\\install.bat
scripts\\setup-playwright.bat
```

## Harvest

```bash
npm run harvest
```

Windows 11:

```bat
scripts\\harvest.bat
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

Windows 11:

```bat
scripts\\dev.bat
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

Windows 11:

```bat
scripts\\test.bat
```

Snapshot fixtures live in `tests/fixtures/` and validate parser output.
