# Shun Kwok — personal website

Work in progress: About, Projects, and Blog, with a dark architectural sketch design.

## Editing

- `dist/index.html`: About page and shared navigation.
- `create-pages.cjs`: Projects and Blog content. Run `node create-pages.cjs` after editing this file to regenerate those two pages.
- `dist/style.css`: shared appearance and responsive layout.
- `dist/app.js`: page transitions.
- `dist/diagram.js`: interactive Meerkat overview.
- `dist/assets/`: pavilion illustration and original Meerkat diagram.

Blog entries are draft templates. The pavilion currently uses an illustration and transitions, not a full 3D scene.

## Preview

Run `node serve.cjs`, then open http://127.0.0.1:4173.

## Publishing

GitHub Actions publishes `dist` to GitHub Pages whenever changes reach `main`. No dependencies or build step are required. The `.openai/hosting.json` file records the previous Sites deployment; GitHub Pages does not use it.
