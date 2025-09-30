# CV Builder

## Technologies

- Vanilla HTML 5 and CSS 3
- Web Components
- CV Structure specified in json schema
- CV information provided with json

## Project Structure

- `src` - source code
- `src/components` - web components`
- `src/cv-data.json` - contains the concrete CV data
- `src/cv-data.schema.json` - the structure of the CV data in JSON Schema format

## Local URL

- When developing locally, the site is typically served at `http://127.0.0.1:8000/` (e.g., via `python3 -m http.server -d . 8000`).
- The Taskfile also provides `task dev` which serves at `http://localhost:5173/`.
