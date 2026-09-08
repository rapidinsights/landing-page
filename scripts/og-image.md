# OG image

`src/assets/images/default.png` (1200x630) is rendered from `scripts/og-image.html`.

## Regenerate

From the repo root:

```bash
npx --yes playwright@1.55.0 screenshot \
  --browser=chromium --channel=chrome \
  --viewport-size=1200,630 --wait-for-timeout=1500 \
  "file://$PWD/scripts/og-image.html" /tmp/og-raw.png

node -e "import('sharp').then(({default:s})=>s('/tmp/og-raw.png').png({palette:true,colors:255,dither:1.0,quality:90,effort:10,compressionLevel:9}).toFile('src/assets/images/default.png'))"
```

The second step is the compression pass; the raw screenshot is ~400 KB, the
compressed PNG is ~14 KB. Keep the result under 100 KB.

## Constraints

- **System Chrome only** (`--channel=chrome`). Playwright's own browser
  downloads are broken on this machine: never run `npx playwright install`, it
  stalls and corrupts the cache.
- **Playwright is not a project dependency and must not become one.** Use the
  one-off `npx --yes playwright@<version>` invocation above, or install it to a
  scratch directory outside the repo.
- `scripts/og-image.html` is standalone: inline `<style>`, no imports from
  `src/`, no network fonts. It loads Lora and Plus Jakarta Sans by relative
  path out of `node_modules/@fontsource-variable/`, so `npm install` must have
  run before rendering.
- The headline wrap is forced with explicit `<br>` so re-rendering reproduces
  the same image.
