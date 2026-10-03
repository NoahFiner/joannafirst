# Artwork and homepage image workflow

The website remains static HTML/CSS/JavaScript. Node is only needed when importing or regenerating images. Generated images and `data/` files are committed and deployed alongside the HTML.

## Setup

Use Node 22 or newer, then run `npm ci`. To preview, run `npm run serve` and open http://127.0.0.1:8000. Opening an HTML file directly with `file://` will not work with the module scripts and catalog fetch.

## Add one artwork

```sh
npm run artwork:add -- "/path/to/new painting.jpg" --dry-run
npm run artwork:add -- "/path/to/new painting.jpg"
```

The command asks for title, category (`paintings`, `pastels`, `photos`, or `homepage`), medium, physical dimensions, an optional description and optional ID. `photography` is also accepted as an alias for `photos`. The new work is appended to its category. For two different works with the same title, provide distinct IDs (lowercase letters, numbers and hyphens).

The dry run validates metadata and reports which exports would be generated without adding originals, generated assets or catalog entries. It does temporarily acquire the build lock. The real run copies the input to `originals/` without modifying it, creates web exports, and publishes the complete manifest. It does not publish the website to the internet.

## Add a batch

Create a UTF-8 CSV with these headers:

```csv
file,title,category,medium,dimensions,description,id,order
"incoming/evening.jpg","Evening Garden",paintings,acrylic on canvas,30x40,"Blue and green garden",,
"incoming/shore.jpg","Shore",photos,digital,12x16,,,
```

Paths are relative to the CSV file. Fields containing commas need double quotes. `description`, `id`, and `order` are optional. Blank order appends the work; a numeric order controls sorting within the category. Titles/medium/physical dimensions come from you, not automatic image recognition.

```sh
npm run artwork:batch -- "/path/to/artworks.csv" --dry-run
npm run artwork:batch -- "/path/to/artworks.csv"
```

Exact duplicate files and duplicate IDs stop the batch. A failed image conversion leaves the published catalog/manifest unchanged. Unreferenced immutable exports/originals may remain after an I/O failure; they are not visible on the site. Nothing deletes existing originals or exports automatically.

## Correct metadata, reorder or replace an image

Edit `data/catalog.json` and run `npm run images:build`. Keep each artwork's stable `id`. Change its `order` to reorder it. Remove its entry to unlist it; the original file remains. To replace a source image, save a new master inside the project and update that entry's `source` path. Do not overwrite the old master if you want to retain it.

```sh
npm run images:build -- --dry-run
npm run images:build
```

Unchanged sources/settings reuse validated exports. Metadata edits update the generated manifest without re-encoding images. Source/recipe changes create new hashed output paths, avoiding stale browser-cached artwork. No cleanup of old exports is automatic.

## Outputs and quality

- `data/catalog.json`: editable metadata and source paths, in original gallery order.
- `data/images.json`: generated website manifest; do not hand-edit.
- `generated:hero` blocks in the four header HTML pages: generated eager responsive first image; preserve the markers.
- `images/generated/<id>/<hash>/`: generated WebP files.
- `originals/`: untouched copies of newly imported masters.

Existing masters remain in their existing folders; migration does not duplicate or alter them. The importer applies EXIF orientation, converts to an embedded sRGB profile, preserves alpha, and fits images inside bounds without cropping or upscaling. It generates a 300×300-bounded thumbnail (quality 84), plus 800/1600/2400-bounded display variants (quality 88). Small sources produce fewer variants. Pixel dimensions in the manifest reflect actual oriented output dimensions. Animated/multipage inputs are rejected.

Settings live in `RECIPE` in `scripts/artwork.mjs`; change the recipe version/settings and rebuild to regenerate. Check representative artwork visually before changing compression: transparency, dark gradients, fine textures and colors matter. A generated 2400-pixel bound cannot restore detail missing from an old 600-pixel source.

## Existing collection migration

66 artworks (31 paintings, 9 pastels, 26 photographs) and 10 header backgrounds were migrated. The source decision for each artwork is recorded in `data/migration-report.json`. The one-time migration script refuses to overwrite an existing catalog. Legacy gallery scripts are retained for historical reference but are no longer loaded by the gallery pages.

Larger matching files were selected when geometry and image content matched. Three exceptions retain the currently displayed files after visual comparison:

- `paintings/14.png`: the alternate has different color/cropping.
- `photos/6.jpg`: the fullsize counterpart is a different photograph.
- `photos/25.jpg`: the fullsize counterpart is a different photograph.

Unlisted files were not automatically added: they have no confirmed title/order and may be duplicates or older work. `photos/0 3.jpg` is another possible larger source but is not substituted automatically.

## Browser loading

Galleries read `data/images.json`, select a display variant for the image area, decode it before replacing the current artwork/caption, and preload only neighboring artworks at low priority. Rapid navigation uses the latest request. Offscreen thumbnail images use native lazy loading (the browser may load nearby images in advance). A failed selected image leaves the previous one visible and provides retry. Keyboard left/right and the previous-at-first wraparound work.

The homepage uses generated backgrounds. Its first image is an eager responsive image in the HTML, visible even without JavaScript. The controller prepares the next slide before a short crossfade. Statement, résumé and contact use static headers from the first homepage entry. It holds the current image while downloading, pauses offscreen/in hidden tabs, and disables automatic rotation for reduced-motion/data-saving preferences. A visible pause button is provided. The homepage has responsive navigation and logo sizing; the other pages' broader mobile layouts remain a separate task.

## Checks and publishing

Run `npm test`, `npm run images:build`, and preview. Check titles/order, source matching, transparency/color, arrows, thumbnail jumps and slideshow pause/play. Generated files must be included when deploying; no image processing runs on the hosting server. Keep `node_modules` out of deployment. Review originals before putting newly imported private files on a public host; the static hosting system may serve files present in the repository.
