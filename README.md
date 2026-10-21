# Editing the website

Edit `content.json`, then run `node create-pages.cjs`. The four pages are Academic (the homepage), Projects, Newsletter and Ironclads. Items can be added, removed, or hidden with `published: false`. Commit source, generated pages and assets; GitHub Actions deploys `dist`.

## Layout rules

- Keep the flat architectural background and portrait frame; foreground text must remain readable and conventional.
- Do not enlarge media with the viewport. Desktop feature images and videos are capped at 720 CSS pixels wide; landscape media at 405 pixels tall. Research thumbnails are capped at 250 pixels wide, letter thumbnails at 220 pixels.
- Below 700 pixels, ordinary images go above their text and fill the available content width. Avoid horizontal scrolling.
- Crop photographs and game screenshots with `object-fit: cover`. Use `imageKind` containing `uncropped` for charts and maps so labels and evidence remain visible. Never stretch an image.
- Preserve app screenshot proportions. Keep them compact on desktop.
- Videos use native controls, `playsinline`, and `preload="metadata"`; never autoplay. Set `video`, `videoPoster` and `videoCaption` on the content item.
- For article illustrations, use the verified original image and retain its credit. Do not substitute unrelated photographs.
- Verify local media files, links and page generation. Inspect the live site at mobile and desktop widths when browser tooling works; structural checks alone do not count as visual verification.

The unused legacy 3D files are not loaded by the current page template. The old gallery tests do not validate the current site.
