# MKX Editor — React `use c`

> Run C, C++, Python, and JavaScript directly in your browser — with AI-powered code translation via Gemini.

## Features

- **VS Code-style editor** with syntax highlighting (Prism.js)
- **Remote code execution** — C/C++ compiled via Zig, Python via `python3`, JS via Node
- **AI translation** — Translate between C, C++, Python, and JavaScript using Gemini
- **Typewriter effect** for streamed AI output
- **Skeleton loaders** while translation is in progress
- **Draggable terminal panel** — switch between side and bottom layout
- **Clickable error lines** — jump to the exact line that caused a compile error

## Setup

1. Clone the repo and install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file with your Gemini API key:

   ```
   GEMINI_API_KEY=your_key_here
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Scripts

| Command         | Description                           |
| --------------- | ------------------------------------- |
| `npm run dev`   | Start dev server with hot reload      |
| `npm run build` | Production build                      |
| `npm run start` | Build and start the production server |
| `npm run clean` | Remove the `dist/` directory          |

## How It Works

- **`watch.js`** runs `esbuild` in watch mode with a custom `use-c` plugin that transforms `"use c";` blocks into remote execution calls.
- **`server.js`** serves the built frontend and exposes two RPC endpoints:
  - `POST /rpc/rce` — compiles and runs code
  - `POST /rpc/translate` — translates code using the Gemini API
- The Gemini API key is injected into the client bundle at build time from `.env` — it is **never committed to source control**.
