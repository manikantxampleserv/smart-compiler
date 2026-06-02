/**
 * Shared esbuild plugin and utilities for the "use c" transform.
 * Used by both build.js and watch.js.
 */

const fs = require("fs");
const fsPromises = require("fs/promises");
const path = require("path");

/** ─── use-c Transform ─────────────────────────────────────────────────────── */

/**
 * Finds the index of the closing brace `}` that closes the first opened `{`.
 * Returns null if no matching brace is found.
 *
 * @param {string} str - The string to search through.
 * @returns {number | null}
 */
function findClosingBrace(str) {
  let depth = 0;
  for (let i = 0; i < str.length; i++) {
    if (str[i] === "{") depth++;
    else if (str[i] === "}") depth--;
    if (depth === -1) return i;
  }
  return null;
}

/**
 * Transforms source files containing `"use c";` blocks into their
 * runtime-equivalent `runC(encodedCode)` calls.
 *
 * @param {{ path: string }} args - esbuild onLoad args.
 * @returns {string} The transformed source content.
 */
function transformUseCDirective(args) {
  const content = fs.readFileSync(args.path, "utf8");
  const segments = content.split(/["']use c["'];/);
  let output = segments[0];

  for (let i = 1; i < segments.length; i++) {
    const closingIdx = findClosingBrace(segments[i]);
    const cBody = segments[i].slice(0, closingIdx);
    output += `return runC("${encodeURIComponent(cBody)}");`;
    output += segments[i].slice(closingIdx);
  }

  return output;
}

/** @type {import("esbuild").Plugin} */
const useCPlugin = {
  name: "use-c",
  setup(build) {
    build.onLoad({ filter: /\.js$/ }, (args) => ({
      contents: transformUseCDirective(args),
      loader: "js",
    }));

    build.onLoad({ filter: /\.jsx$/ }, (args) => ({
      contents: transformUseCDirective(args),
      loader: "jsx",
    }));
  },
};

/** ─── Env ─────────────────────────────────────────────────────────────────── */

/**
 * Reads the GEMINI_API_KEY from a local .env file.
 *
 * @returns {Promise<string>} The API key string, or empty string if not found.
 */
async function loadGeminiKey() {
  try {
    const content = await fsPromises.readFile(
      path.join(__dirname, ".env"),
      "utf8",
    );
    const match = content.match(/GEMINI_API_KEY=(.*)/);
    return match ? match[1].trim() : (process.env.GEMINI_API_KEY ?? "");
  } catch {
    // .env file not found (e.g. on Render) — use the environment variable directly
    return process.env.GEMINI_API_KEY ?? "";
  }
}

module.exports = { useCPlugin, loadGeminiKey };
