## Reader’s Companion (Chrome Extension)

Reader’s Companion is a Manifest V3 Chrome extension that helps users stay on the page while they:
- Track reading time per “project”
- Save highlighted text to Notion
- Capture screenshots and append them to the active Notion project page

This repo is intended to be forked and iterated on. The fastest way to understand runtime behavior is:
- UI entry: `src/App.tsx`
- Notion API wrapper: `src/notionService.ts`
- Background logic: `src/background.ts`
- Extension manifest: `public/manifest.json`

## Local setup (recommended flow)

1) Install dependencies
- `npm install`

2) Build the extension bundle (outputs `dist/`)
- `npm run build`

3) Load into Chrome
- Open `chrome://extensions`
- Enable “Developer mode”
- Click “Load unpacked”
- Select the generated `dist` folder

Useful scripts:
- `npm run dev` (Vite dev server for the popup UI)
- `npm run lint` (TypeScript typecheck)

## Notion integration

### What users configure
In the extension UI (Settings), users provide:
- Notion Internal Integration Token
- A Notion Database ID shared with that integration

These are stored in `chrome.storage.local` for the extension instance.
Do not commit tokens to the repo or issues.

### API versioning (important)
This project targets Notion API version:
- `Notion-Version: 2026-03-11`

If you see Notion errors that mention “version”, confirm the version header matches current Notion docs.

### Screenshots / file uploads
Screenshots are sent to Notion using Notion’s File Upload API (direct upload flow), then appended to the project page as an `image` block referencing the returned `file_upload` id.

Implementation reference:
- `src/notionService.ts`

Documentation snapshot used for this implementation:
- `notion.md`

`notion.md` is a checked-in, point-in-time copy of relevant Notion documentation (including the File Upload endpoint and its required `Notion-Version`). When updating Notion behavior:
- Update `NOTION_VERSION` in `src/notionService.ts`
- Adjust the upload flow based on the latest Notion docs
- Keep `notion.md` refreshed if you change any Notion-related behavior (so future contributors have a local reference)

## Contribution notes
- Don’t commit `node_modules/` or `dist/` (treat `dist/` as a build artifact; use GitHub Releases if you want to distribute a prebuilt zip).
- Prefer small PRs: one behavior change + any needed types/tests/docs.
- When changing storage shape in `chrome.storage.local`, add a migration/normalization step (see `normalizeAppState` in `src/App.tsx`).

