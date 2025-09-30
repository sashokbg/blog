CV with HTML Web Components

Overview
- Renders a complete CV from `src/cv-data.json` using vanilla Web Components and scoped CSS.
- Data structure is specified in `src/cv-data.schema.json` (JSON Schema).
- Print-friendly layout targets A4 with reasonable margins.

Project structure
- `index.html`: Entry page that loads the root `<cv-component>`
- `src/main.js`: Module entry (registers components)
- `src/components/`: Web Components and styles
  - `cv.js` (root), `cv-header.js`, `cv-sidebar.js`, `cv-main.js`
  - `cv-section.js`, `cv-skills.js`, `cv-timeline.js`, `cv-experiences.js`
- `src/cv-data.json`: The concrete CV data
- `src/cv-data.schema.json`: JSON Schema describing the CV data

Run locally
You can open `index.html` directly in a modern browser, or serve the folder with a static server:

Python 3
`python3 -m http.server -d . 5173`
Then open `http://localhost:5173/`.

Taskfile (optional)
If you use `task`:
`task dev`

Usage
- Edit `src/cv-data.json` to change identity, skills, timeline and experiences.
- The root tag `<cv-component data-load-data="src/cv-data.json">` determines the data source.
- Print via the browser’s print dialog for an A4-friendly PDF.

Notes
- Components use Shadow DOM for style encapsulation; each component loads its own CSS.
- Data is fetched at runtime and bound into components; no build step is required.
