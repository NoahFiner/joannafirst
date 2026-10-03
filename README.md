# Joanna First's art portfolio

A static HTML, CSS and JavaScript website for Joanna's paintings, pastels and photography. An image importer prepares web images and updates the gallery catalog. Adding artwork does not require editing gallery JavaScript.

## Start locally

Install Node.js 22 or newer and Python 3, then run these commands from this directory:

```sh
npm ci
npm run serve
```

Open [the local website](http://127.0.0.1:8000). Use a local server rather than opening HTML files directly; the galleries load a JSON catalog. Stop the server with Ctrl+C.

## Add a painting, pastel or photograph

Start with the best original image available. Run:

```sh
npm run artwork:add -- "/absolute/path/to/new-artwork.jpg"
```

Answer the prompts:

| Field | What to enter |
| --- | --- |
| Title | The artwork's title |
| Category | `paintings`, `pastels`, or `photos` (`photography` also works) |
| Medium | For example, `acrylic on canvas`, `pastel on paper`, or `digital` |
| Physical dimensions | For example, `30x40 inches`; these describe the artwork, not image pixels |
| Description | Optional description for accessible image text |
| Unique ID | Usually leave blank; supply a distinct ID for different works with the same title |

The script copies the original into `originals/`, generates thumbnails and display images, and appends the artwork to its category. It preserves proportions and transparency and never enlarges a small source. The website reads the new entry automatically when reloaded.

To preview the proposed import without adding it:

```sh
npm run artwork:add -- "/absolute/path/to/new-artwork.jpg" --dry-run
```

A dry run asks the same questions. Rerun without `--dry-run` to import. Exact duplicate images and duplicate IDs are rejected.

## Add several artworks

Create a CSV next to the incoming images, for example:

```csv
file,title,category,medium,dimensions,description,id,order
"garden.jpg","Evening Garden",paintings,acrylic on canvas,30x40 inches,,,
"shore.jpg","Shore",photos,digital,12x16 inches,,,
"market.png","The Market II",pastels,pastel on paper,18x24 inches,,,
```

`file` paths are relative to the CSV. Quote fields containing commas. `description`, `id` and `order` are optional; blank order adds the work at the end.

```sh
npm run artwork:batch -- "/path/to/artworks.csv" --dry-run
npm run artwork:batch -- "/path/to/artworks.csv"
```

## Add or change homepage backgrounds

Use the same import command and choose `homepage` as the category. Supply a title for identification; medium and physical dimensions can be blank. The homepage fills its screen with the image, so its visible edges may crop on different screens; exported image files themselves are not cropped.

The homepage rotates through these entries in shuffled order, preloading the next image and waiting until it decodes. It pauses in hidden tabs/offscreen, provides a pause button, and avoids automatic rotation for reduced-motion or data-saving preferences.

The lowest `order` homepage entry is the initial image. The statement, résumé and contact pages use that image as a static header. Change its order and rebuild to choose another initial/header image. Keep at least one homepage entry.

## Edit, reorder, replace or remove artwork

Edit **`data/catalog.json`**, then run:

```sh
npm run images:build -- --dry-run
npm run images:build
```

- Correct `title`, `medium`, `dimensions` or `description` directly.
- Change `order` to rearrange works within a category; smaller numbers appear first.
- To replace a photo of an artwork, put the new master inside the project and update its `source` path. Keep its `id` unchanged.
- Remove an entry to remove it from the gallery. Originals and older generated images are retained.

Rebuilds reuse unchanged exports. A changed image gets new versioned filenames so cached older images do not replace the update. You do not need to edit `paintings.js`, `pastels.js`, or `photos.js`; those are historical files and no longer power the galleries.

## Files to know

| File/folder | Purpose |
| --- | --- |
| `data/catalog.json` | Editable artwork metadata and source paths |
| `data/images.json` | Generated runtime manifest; do not edit by hand |
| `images/generated/` | Generated thumbnails and responsive WebP images |
| `originals/` | Preserved masters for new imports |
| `scripts/artwork.mjs` | Importer and export settings |
| `gallery.js`, `image-loader.js` | Gallery navigation, loading and preloading |
| `slideshow.js` | Homepage-only slideshow |
| `index.html`, `statement.html`, `resume.html`, `contact.html` | Generated first-image blocks are refreshed during image builds |
| `IMAGE-WORKFLOW.md` | Detailed image pipeline and migration notes |
| `AGENTS.md` | Instructions for coding assistants and future maintenance |

Existing originals remain in their legacy directories. Some same-named files in `*-fullsize` are different artworks; use `data/migration-report.json` to understand the chosen sources before changing them.

## Check and publish

```sh
npm test
npm run images:build
npm run serve
```

Review the new works locally: title, category, order, color, transparency, and thumbnail/display appearance. Check the homepage and gallery navigation. The importer prepares local files; it does **not** publish anything automatically.

Include the source/catalog changes, generated manifest, generated images, and updated HTML when committing/publishing through the existing static-site deployment process. Keep `node_modules/` out of deployment. The host does not need Node or an image-processing server to display the site.
