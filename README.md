# Editing the website

Edit `content.json`. The layout is in `templates/page.html` and `dist/style.css`; do not edit generated HTML pages.

## Add a dissertation

Replace `academic.dissertation: null` with an object:

```json
{
  "id": "dissertation",
  "title": "Your dissertation title",
  "year": "2026",
  "summary": "Your abstract.",
  "links": [{ "label": "Read PDF", "url": "/materials/dissertation.pdf" }]
}
```

Copy the PDF to `dist/materials/dissertation.pdf`. Create that folder if needed.

## Add, remove or reorder entries

The lists `academic.essays`, `projects`, `newsletter`, `ironclads`, and `blog` accept the same objects. Add an object to add an entry; remove it to remove the entry; change the array order to change display order. Optional `published: false` hides an entry. Use null to remove the dissertation. Optional `paragraphs` is an array of plain-text paragraphs for a blog post. Optional `date` supplies its date. Text is escaped automatically; do not insert HTML.

The `architecture: true` option adds the Meerkat diagram button; use it on at most one software item.

## Preview and publish

Run `node create-pages.cjs`, then `node serve.cjs`. Open http://127.0.0.1:4173.

For an unpublished layout demonstration with sample dissertation and essay entries, run `node create-pages.cjs --preview`, then `node serve.cjs preview`. Samples are generated only in the ignored `preview` folder.

Commit and push content.json, templates, assets and styling. GitHub Actions regenerates all five pages and publishes them automatically. The Academic page is the homepage. The source photo and materials are public when pushed.
`nNewsletter and Ironclads are independent lists in content.json. sampleSources controls the collapsed attribution note; remove it when replacing the fictionalised design samples with original material. Previous content is retained in drafts/content-before-samples.json.

## 3D pavilion

The five sections share a Three.js scene in `dist/gallery.js`. It contains real meshes, line geometry, a perspective camera and preset paths between five exhibition bays. Each bay has a wall text panel generated from `content.json`, a subject drawing and a small physical exhibit. Ironclads contains an original schematic ship drawing and a simple extruded hull, funnels, mast and rigging. The drawing is not a reconstruction of a named vessel.

Desktop opens in the 3D view unless Reading view was selected. Mobile and reduced-motion users start in Reading view and can explicitly enter the pavilion. Reduced motion removes travel animation. Missing WebGL leaves the normal static pages usable. A page hash also retains the reading page. The main navigation supports direct URLs, browser Back, and movement between rooms without reloading. Select a wall, an exhibit title, or Read to open full text. The scene renders on interaction rather than running an idle animation loop.

The renderer is vendored in `dist/vendor` (Three.js 0.180.0, MIT licence included), so publishing needs no CDN or package download. `npm ci` installs local test dependencies; `npm test` exercises the navigation logic against a simulated DOM using real Three.js geometry and camera math. The renderer itself is mocked in those tests: they do not verify WebGL pixels. `npm run build` generates all five pages and the shared gallery content.

For camera framing, edit `pose`; for room spacing, `SPACING`; for exhibits, `buildRoom`, `drawing`, and the prop functions. To change the wall texts, edit `content.json` and rebuild.
