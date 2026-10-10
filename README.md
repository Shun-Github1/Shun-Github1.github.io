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

The lists `academic.essays`, `software`, `projects`, and `blog` accept the same objects. Add an object to add an entry; remove it to remove the entry; change the array order to change display order. Optional `published: false` hides an entry. Use null to remove the dissertation. Optional `paragraphs` is an array of plain-text paragraphs for a blog post. Optional `date` supplies its date. Text is escaped automatically; do not insert HTML.

The `architecture: true` option adds the Meerkat diagram button; use it on at most one software item.

## Preview and publish

Run `node create-pages.cjs`, then `node serve.cjs`. Open http://127.0.0.1:4173.

For an unpublished layout demonstration with sample dissertation and essay entries, run `node create-pages.cjs --preview`, then `node serve.cjs preview`. Samples are generated only in the ignored `preview` folder.

Commit and push content.json, templates, assets and styling. GitHub Actions regenerates all four pages and publishes them automatically. The Academic page is the homepage. The source photo and materials are public when pushed.
`nNewsletter and Ironclads are independent lists in content.json. sampleSources controls the collapsed attribution note; remove it when replacing the fictionalised design samples with original material. Previous content is retained in drafts/content-before-samples.json.
