# Portfolio audit — October 3, 2026

Investigation only; no website implementation or image changes.

## Scope and confidence

Inspected all seven HTML pages, shared CSS, first-party JavaScript, asset references, image dimensions and file sizes. Opened all seven pages locally at desktop (1280×800) and narrow (390×844) viewport sizes. Exercised gallery arrows, thumbnail selection, expansion and page scrolling. Browser console and local HTTP logs confirmed runtime errors and image requests.

Narrow viewport testing is not physical-phone or touch emulation. No production hosting/CDN measurements, throttled-network benchmarks, Lighthouse scores or frame-time traces were collected. File sizes below are decimal MB on disk, not compressed production transfer measurements. Rendering-cost findings identify likely contributors, not measured dropped-frame attribution.

## Highest-impact findings

### 1. The gallery deliberately waits before updating

`style.css:490` sets the foreground to a 0.5-second transition with a further 0.5-second delay. The backdrop has a separate 1.5-second background-image transition (`style.css:473`). These timings are independent of network performance. Initial gallery views visibly showed captions and thumbnails before the main artwork appeared, even locally.

Recommendation: remove the foreground delay; use either an immediate switch or a short, approximately 150–200 ms opacity transition after the next image is ready. Keep metadata and artwork synchronized. Respect reduced-motion preferences. Background-image interpolation is not a dependable cross-browser transition mechanism.

### 2. Loading strategy prioritizes all thumbnails but not the next artwork

Each gallery builds every thumbnail as a CSS background at startup (`paintings.js:12`, equivalent code in the other galleries). The HTTP log confirms all 31 painting thumbnails are requested immediately, including those outside the visible scrolling panel. `cars.js:1` changes the main background URL only when an artwork is selected. There is no explicit neighbor preload, decode-before-display, loading feedback or error state.

| Gallery | Artworks | All referenced display files | All referenced thumbnails |
| --- | ---: | ---: | ---: |
| Paintings | 31 | 17.09 MB | 1.26 MB |
| Pastels | 9 | 1.49 MB | 0.30 MB |
| Photography | 26 | 5.60 MB | 0.55 MB |

The display-file totals are collection totals, **not initial page downloads**. Current code loads the selected artwork, not the whole full-size collection.

Recommendation: use real image elements with responsive sources. Give the first artwork priority, lazily load offscreen thumbnails, and preload just the next/previous display images after the current image. Keep the existing artwork visible until the requested replacement loads and decodes. Rapid selection should show the latest requested artwork, even if earlier downloads complete later. Failed loads should leave navigation usable.

### 3. Image exports are inconsistent

- `pics/header/0.jpg`: 1.16 MB at 1280×813. It is the first background on home, statement, résumé and contact pages.
- All ten rotating header images total 3.21 MB. The random timer selects an image every three seconds, with no next-image readiness check or pause control. `style.css:209` adds a one-second transition delay and one-second duration.
- `paintings/comingclosertransparent.png`: 3.75 MB at 2945×1019.
- `thumbnails/paintings/17.png`: 168.5 KB at 594×150, despite rendering in a 150×150 contain box. Several thumbnails constrain one dimension rather than fitting inside a consistent box.
- Existing `paintings-fullsize` and `photos-fullsize` folders are not referenced by the gallery code. They need inventory/mapping before any migration, rather than assuming they contain the correct master for every artwork.

Recommendation: regenerate images from the best available originals into bounded thumbnails and multiple display sizes. Preserve the full composition and transparency. Compare color and detail before selecting compression settings; an artwork portfolio warrants visual review. Keep high-resolution originals separate from routine page loading. Prioritize the first hero image; avoid eagerly preloading the whole slideshow. Pause background rotation when hidden and honor reduced motion.

### 4. Previous at the first artwork throws in every gallery

Reproduced in paintings, pastels and photography. `back()` sets `currCar = amtOfCars` rather than the last valid index (`paintings.js:34`, `pastels.js:34`, `photos.js:34`). `setPhotoCar()` then reads `.titley` from undefined and selection is lost.

Recommendation: correct wrapping and consolidate the three copies into one controller driven by artwork data. Verify first/last wrapping, rapid navigation and thumbnail selection.

### 5. Mobile layout needs structural fixes

- Every page lacks a viewport meta tag. Real phones can use a desktop-style layout viewport and shrink content; adding the tag alone will expose the narrow-layout defects below rather than fix them.
- At 390 px, the homepage logo extends beyond the right edge. Fixed 175 px buttons in three/four-column tables clip navigation links. `overflow-x: hidden` hides the overflow.
- All gallery caption bars use absolute positions and viewport-height font sizes. Titles, medium, dimensions and the expand control collide at narrow widths.
- Gallery navigation is hidden behind hover; the header starts at half scale. The logo click is gated behind a 500 ms hover timer (`ui.js:20`). Touch and keyboard users do not get an equivalent explicit menu control.
- The statement stays in a two-column table with large body type, leaving a narrow, tiring text column. Contact content and the shared footer overflow or become tiny. The résumé is more readable but shares the broken navigation/footer.

Recommendation: preserve the logo, palette, textures and artwork presentation while using responsive grid/flex layouts. Stack text and images on phones; allow captions to wrap naturally. Give navigation an explicit button or visible links, and use readable type sizes independent of viewport height. Account for mobile browser chrome and short landscape screens.

### 6. Animation work affects large areas and layout

Shared rules animate `all`, including gallery heights, margins and arrow positions. Photography also has a large live `blur(20px)` backdrop. Paintings/pastels create that backdrop beneath an opaque white layer, so it provides no visible benefit there; browsers may cull some hidden rendering, but the layer and image setup are unnecessary.

Expansion is internally inconsistent: `ui.js:6` toggles children but never toggles `#carousel-outer`, despite CSS defining an expanded state for it. At 1280×800, the outer container stayed 560 px high while the foreground grew to 744 px; the caption ended at y=808 and arrows no longer aligned with the larger image area.

Recommendation: use one coherent layout state, limit animation to explicit properties, and favor opacity/transform where appropriate. Precompute a small blurred backdrop only if retaining that effect. Profile after changes to establish actual rendering gains.

### 7. Accessibility and navigation affect usability

Gallery arrows are clickable images, thumbnails are divs, and expansion is a clickable paragraph. They lack normal button semantics, accessible names and keyboard operation. Main artworks are backgrounds without alt text. No arrow-key navigation, swipe handler, reduced-motion styling or individual artwork URLs were found. Several informational-page navigation items are clickable divs.

Recommendation: native links/buttons, visible focus, named controls, artwork descriptions, current-position indication, keyboard support, and optional swipe. Add stable artwork URLs so reload/back/share preserve selection. Consider a more visible thumbnail grid or strip so finding a work does not require repeated next clicks.

### 8. Smaller shared defects

- Missing links: homepage header `about.html`; footer `statemenet.html` on statement, contact and résumé.
- Local HTTP logs confirm 404 requests for `brushed-alum-dark` and the gallery's two fake initial background URLs. Remove these placeholder requests.
- CSS such as `#footer p, a` targets **every link**, not only footer links. At narrow breakpoints this sets generic links to 10 px; it visibly shrinks the contact email link. Scope each selector correctly.
- Contact and résumé headers mark the wrong page selected.
- No explicit charset declaration; the résumé visibly contains garbled quotation marks in local serving. Declare UTF-8 and check existing content.
- All pages synchronously load jQuery 1.11.2 (95.9 KB) and jQuery UI 1.11.3 (240.0 KB). No jQuery UI widget/effect usage was found in first-party scripts. Remove UI and replace the small jQuery DOM/event wrapper with vanilla JS; defer scripts as appropriate.

## Easier artwork imports

A build-time importer fits this static site well. Proposed workflow:

1. Put original images into an incoming folder.
2. Supply title, category, medium, physical dimensions and display order through prompts or a small CSV. These cannot reliably be inferred from the image.
3. Run an import command that applies orientation, converts colors consistently, preserves transparency and aspect ratio, and creates thumbnails plus responsive display exports. Suggested starting sizes: thumbnails bounded to 300×300; display variants bounded to 800, 1600 and 2400 px, without upscaling small sources.
4. Write a shared artwork manifest containing stable IDs, metadata, image paths and pixel dimensions. The gallery consumes this data instead of requiring edits to executable JavaScript.
5. Preview locally and publish through the existing deployment process.

Keep originals untouched. Make reruns idempotent, detect duplicate IDs/files, validate required metadata, and avoid publishing partial imports. Use content-hashed output names or an equivalent versioning scheme so replacing an image refreshes cached copies. Migrate existing artwork titles/order and map masters carefully, with a dry run showing changes.

A small Node script using Sharp is a practical candidate. Node would be used for preparing content; visitors would still receive static HTML/CSS/JS. A local drag-and-drop form could later wrap the same importer if command-line use is inconvenient. A remotely accessible upload interface would additionally need authenticated storage/publishing; an importer alone does not provide that.

## Technology recommendation and order

Keep vanilla HTML/CSS/JS. The site has seven pages, three similar galleries and a small amount of interaction. React would not by itself address the measured file sizes, explicit delays or layout bugs. One shared gallery controller and one artwork manifest provide the main maintenance benefits with little machinery.

Suggested order: fix gallery wrapping/delays and mobile navigation/captions; build the importer and regenerate consistent assets; replace the loading/transition controller; clean up shared dependencies, links and informational layouts. Preserve the existing design throughout.

Before shipping: test actual phones and touch, keyboard navigation, reduced motion, slow-network cold loads, rapid image selection, failed images, expansion/collapse and all first/last boundaries. Compare artwork colors/transparency with originals and measure production loading and frame times.

## Technical references

- [Responsive images and loading priority](https://web.dev/learn/design/responsive-images)
- [High-performance CSS animations](https://web.dev/articles/animations-guide)
- [Sharp image resizing](https://sharp.pixelplumbing.com/api-resize/)
- [Sharp output formats and color profiles](https://sharp.pixelplumbing.com/api-output/)
- [Sharp orientation handling](https://sharp.pixelplumbing.com/api-operation/)
