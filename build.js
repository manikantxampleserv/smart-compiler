/**
 * @fileoverview Build script to bundle the client application using esbuild.
 */

const esbuild = require("esbuild");
const fs = require("fs/promises");
const { useCPlugin, loadGeminiKey } = require("./plugin.js");

/**
 * Executes the build process. Cleans the dist directory, bundles the
 * client code with the useCPlugin, and copies index.html.
 * @returns {Promise<void>}
 */
async function build() {
  await fs.rm("dist", { recursive: true, force: true });
  await fs.mkdir("dist", { recursive: true });

  console.log("Building project...");

  const geminiKey = await loadGeminiKey();

  await esbuild.build({
    entryPoints: ["client.jsx"],
    outfile: "dist/js.js",
    bundle: true,
    minify: true,
    sourcemap: true,
    plugins: [useCPlugin],
    define: {
      "process.env.GEMINI_API_KEY": JSON.stringify(geminiKey),
    },
  });

  await fs.cp("index.html", "dist/index.html");

  console.log("Build complete.");
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
