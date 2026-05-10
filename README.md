# Reading Logs

**Read deeply. Capture instantly. Sync perfectly.**

We've all been there: you find a brilliant quote, a complex diagram, or a vital statistic. You bookmark it. You never look at it again. Or worse, you spend 10 minutes switching tabs to copy-paste it into your notes, breaking your flow and losing your momentum.

**Reading Logs solves this.** It bridges the gap between _consuming_ content and _retaining_ it. We ensure your insights land exactly where they belong: in your **Notion** workspace.

---

## Features that Flow with You

- **Passive Time Tracking:** Start a session for a specific book or project. Our background timer tracks your focus hours while you read.
- **One-Click Highlights:** Found a "eureka" moment? Highlight the text, right-click, and send it straight to your Notion project page. No tab switching. No friction.
- **Visual Context (Screenshots):** Sometimes words aren't enough. Capture a screenshot of a chart, code snippet, or illustration and append it to your project notes instantly.
- **Project-Centric Organization:** Organize your reading by projects (e.g., "AI Research," "Personal Growth," "Client Project"). Each project maps to a dedicated page in Notion.
- **Built for Speed:** Minimalist UI, zero-config overhead, and powered by a modern React + Vite stack for a snappy, native-feeling experience.

---

## Getting Started

### 1. Installation

1. Clone this repository or download the source.
2. Run `npm install` to grab the dependencies.
3. Run `npm run build` to generate the `dist` folder.
4. Open Chrome and go to `chrome://extensions`.
5. Enable **Developer Mode** and click **Load unpacked**.
6. Select the `dist` folder from this project.

### 2. Connect Your Notion

1. Create an integration at [notion.so/my-integrations](https://www.notion.so/my-integrations).
2. Copy your **Internal Integration Token**.
3. Create a Database in Notion and **Share** it with your new integration.
4. Copy the **Database ID** (the string of characters in the URL between the `/` and `?`).
5. Open the extension, go to **Settings**, and paste your keys.

---

## Tech Stack

- **Core:** React 19, TypeScript, Vite
- **UI:** Tailwind CSS 4, Motion, Lucide Icons
- **Backend:** Notion API, Chrome Extension API (MV3)

---

_Built with ❤️ for those who read to learn and remember._
