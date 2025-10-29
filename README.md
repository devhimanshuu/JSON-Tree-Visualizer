# JSON Tree Visualizer

Interactive web application to visualize JSON as a hierarchical, pannable, zoomable tree using React and React Flow.

This project was built as a small developer tool to help inspect and explore arbitrary JSON structures. It supports search by JSON path, node highlighting, copy-path on click, export to PNG, and a light/dark theme toggle.

---

## Features

- Paste or type JSON into the left-side editor and click **Visualize** to render the tree.
- Syntax validation with clear error messages for invalid JSON.
- Tree rendering using `react-flow`:
  - Object nodes show keys
  - Array nodes show indices (e.g. `[0]`)
  - Primitive nodes show key and value
  - Parent/child connections are rendered as edges
- Visual distinction of node types (objects, arrays, primitives) via color and styling.
- Search by JSON path (e.g. `$.user.address.city`, `$.items[0].name`) — centers the view on match and highlights the node.
- Click a node to copy its JSON path to clipboard.
- Export the current canvas as a PNG image.
- Zoom controls (Zoom In / Zoom Out / Fit View).
- Light / Dark theme toggle and Clear button for input.
- MiniMap for quick navigation and global overview.
- JSON Analytics panel (total keys, max depth, arrays count, estimated memory size).

---

## Tech stack

- React (Vite)
- React Flow (`@xyflow/react`) for graph rendering
- Tailwind CSS for styling
- html-to-image for PNG export

All visualization and interaction logic lives in `src/components` and the tree builder is in `src/utils/parser.js`.

## Project structure (key files)

- `src/App.jsx` — top-level layout and wiring
- `src/main.jsx` — app bootstrap (wraps with React Flow provider)
- `src/components/Editor.jsx` — JSON editor, sample loader, visualize/clear
- `src/components/TreeCanvas.jsx` — React Flow canvas and search/highlight/export logic
- `src/components/ToolBar.jsx` — zoom / export / theme controls
- `src/components/SearchBar.jsx` — search input
- `src/utils/parser.js` — converts JSON into nodes & edges and computes layout
- `src/index.css` — global styles and Tailwind directives

---

## Getting started (local development)

1. Install dependencies

```powershell
npm install
```

2. Start the dev server

```powershell
npm run dev
```

3. Open the app in your browser (Vite will show the local URL, typically `http://localhost:5173/`).

Notes:
- If you see CSS errors about an unknown `@tailwind` rule, ensure the dev environment runs PostCSS with the Tailwind plugin. The repository includes `postcss.config.js` and `tailwind.config.js` — if you get that error, try reinstalling dev dependencies:

```powershell
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

---

## How to use

1. Paste or edit JSON in the left editor and click **Visualize**.
2. Use the search bar to find a node by JSON path. Press Enter or click Search. Matching node (if any) will be highlighted and centered.
3. Use toolbar buttons to zoom in/out, fit view, toggle theme, or export PNG.
4. Click any node to copy its JSON path to the clipboard. A small status message appears at the bottom confirming the copy.
5. MiniMap: use the small map overlay to pan/zoom and keep track of where you are in large trees.
6. JSON Analytics: after visualizing, check the left sidebar's Analytics section for quick metrics about your JSON.

---

## Implementation notes

- The tree is built by `src/utils/parser.js`. It performs a depth-first traversal of the provided JSON and returns an array of nodes and edges. Node positions are computed with a simple top-down layout algorithm.
- Search normalizes input paths and attempts to match node `data.path` exactly. Matches pan the React Flow viewport to center the matched node using the `setCenter` API.
- Export uses `html-to-image` capturing the React Flow wrapper element and triggers a download.
- MiniMap is provided by React Flow's `MiniMap` component with custom theme-friendly styles.
- JSON Analytics are calculated in `src/utils/analytics.js` (invoked from `TreeCanvas`) and displayed in the left sidebar in `src/App.jsx`.

Edge cases handled:

- Empty objects/arrays produce placeholder nodes (`{}` or `[]`).
- Primitive values (string/number/boolean/null) render as leaf nodes showing key and value.

---

## Troubleshooting

- "Unknown at rule @tailwind": ensure Tailwind and PostCSS plugins are installed and Vite is using PostCSS. Try reinstalling dev deps and re-running the dev server.
- If React Flow complains about provider / zustand: make sure `ReactFlowProvider` wraps the app in `src/main.jsx`.
- If export produces a blank image or wrong size, try resizing the canvas or use the **Fit View** button before export.

---

## Deployment

You can deploy the `dist` folder produced by `npm run build` to GitHub Pages, Netlify, Vercel, or any static hosting provider. For GitHub Pages, push the `dist` contents to the repository's `gh-pages` branch or use an action to automate the deploy.

---

## Contributing

Contributions, bug reports and feature requests are welcome. Please open issues or PRs on the repository and explain the problem and steps to reproduce.

---

## License

This project is provided under the MIT License. See `LICENSE` for details (if present).

---

If you'd like, I can also add a short `CONTRIBUTING.md`, GitHub workflow for deployments, or a live demo link if you want to deploy it — tell me which platform and I will prepare CI config.