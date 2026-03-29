# Reader's Companion - AI Context & Guidelines

This document provides essential context and instructions for AI agents working on the **Reader's Companion** Chrome extension.

## Project Overview
Reader's Companion is a Chrome extension designed to help users track their reading progress and seamlessly save highlights, notes, and screenshots directly into their Notion workspace.

### Core Architecture
- **Framework:** React 19 + Vite (TypeScript)
- **Styling:** Tailwind CSS v4 + Motion
- **Extension API:** Chrome Manifest V3
- **External Integration:** Notion API (v2022-06-28)
- **Build Origin:** Initially conceptualized and built using Google AI Studio / Gemini.

## Key Modules
- `src/App.tsx`: The main popup UI, managing state, timers, and project selection.
- `src/background.ts`: Handles background tasks like context menu actions and the persistent timer.
- `src/notionService.ts`: Encapsulates all interactions with the Notion API.
- `src/content.ts`: Basic content script for future expansion (e.g., page content extraction).

## Development Guidelines
- **Surgical Edits:** When modifying the UI, prioritize maintaining the clean, minimal aesthetic (using Tailwind and Lucide icons).
- **State Management:** The extension uses `chrome.storage.local` for persistence. Ensure state updates are atomic and synchronized between the popup and background scripts.
- **Notion API Limits:** Be mindful of Notion's block size limits, especially when handling screenshots (currently saved as base64 text due to API constraints on direct image uploads without a public URL).
- **Type Safety:** Maintain strict TypeScript definitions in `src/types.ts`.

## Interaction Instructions
- When adding features, verify they align with the goal of "minimal friction" for readers.
- Always check `public/manifest.json` when adding new permissions or background capabilities.
- Prioritize reliability in the Notion synchronization logic.
