# Repository instructions

## Project and scope

This is Joanna First's static art portfolio. Preserve its existing visual identity, artwork composition, metadata and ordering unless the user requests changes. Prefer vanilla HTML/CSS/JavaScript. Node is for image preparation/testing, not a production server. Read README.md and IMAGE-WORKFLOW.md before changing the content pipeline.

Inspect `git status` and preserve unrelated user changes. No automatic commits, pushes or deployment are required by this document.

## Adding artwork

- Use `npm run artwork:add -- /path/to/image` for interactive imports.
- For automated or multiple imports, use a UTF-8 CSV and `npm run artwork:batch -- /path/to/artworks.csv --dry-run`, then run without the dry-run flag after validating the inputs within the user's authorized scope.
- CSV fields: `file,title,category,medium,dimensions,description,id,order`. File paths are relative to the CSV. Quote values containing commas.
- Categories: `paintings`, `pastels`, `photos` (alias `photography`), `homepage`.
- Obtain artwork title, medium and physical dimensions from the user or provided metadata. Do not invent them from a photograph. Description is optional. Homepage entries do not require medium/dimensions.
- Preserve original masters. New imports copy them into `originals/`; existing masters stay at their current paths. Do not overwrite, crop, delete or re-encode original files.
- Duplicate titles may need explicit distinct stable IDs. Do not defeat duplicate-image checks by silently modifying a source file.
- Unlisted legacy images must not be added automatically without confirmed metadata.

## Editing and rebuilding

- `data/catalog.json` is the editable source of truth. Preserve stable IDs on corrections/replacements. Sorting is by `order` within each category.
- Run `npm run images:build` after catalog or image-source changes. `npm run images:build -- --dry-run` reports planned exports.
- Never hand-edit `data/images.json`, `images/generated/`, or the `generated:hero` blocks in HTML. The build owns those blocks; preserve their markers and surrounding user-authored HTML.
- The first homepage entry supplies the eager responsive HTML image on all four header pages. Keep at least one homepage entry in this site's catalog. Only index.html rotates; informational headers are static.
- Do not revive the legacy paintings.js/pastels.js/photos.js/cars.js controllers or add artwork entries to them. They are retained solely as historical migration references.
- `scripts/migrate-legacy.mjs` is a one-time migration, not the normal import path. Do not remove the catalog to rerun it.
- Never choose a `*-fullsize` file solely by filename. Known mismatches: paintings/14.png has different crop/color; photos/6.jpg and photos/25.jpg have entirely different fullsize counterparts. See data/migration-report.json.
- Preserve full artwork proportions and alpha. Exports auto-orient, convert to sRGB and never upscale. Review visual quality when changing compression/size settings in RECIPE.
- Keep generated exports versioned and imports repeatable. A failed conversion must not publish a partial catalog. Do not automatically delete old exports/originals as cleanup.

## Browser behavior

- Load/decode the requested image before displaying it. Keep the current artwork and its caption while loading; latest selection wins if requests complete out of order.
- Limit gallery preloading to neighbors and slideshow preloading to the next slide. Do not eagerly fetch all full-size images.
- Keep homepage images discoverable in HTML, with srcset/sizes and high priority for the first image. Preserve the image fallback if JavaScript/catalog fetching fails.
- Pause rotation when hidden/offscreen or user-paused; honor reduced motion and data saving. Use short opacity transitions and avoid delayed background-image swaps.
- Avoid reusing a cached DOM image node with stale animation/z-index state in slideshow layers.

## Validation

Use Node 22+; install dependencies with `npm ci`. Run `npm test`, `npm run images:build`, and `git diff --check` for pipeline/controller changes. Verify a second image build reuses unchanged exports. Add meaningful tests for import failure, output integrity, orientation/alpha, request ordering and slideshow pause/readiness as applicable.

Use `npm run serve` (Python 3) for browser checks. Verify the affected pages, new artwork metadata, wraparound, rapid navigation, loading failures, pause/play, and narrow homepage layouts. Do not claim physical-phone, slow-network, or production performance validation unless actually performed. Preserve user content edits outside the generated blocks. Include generated artifacts in any eventual publication; never deploy node_modules.
