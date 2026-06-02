const esbuild = require("esbuild");
const fs = require("fs/promises");
const { useCPlugin, loadGeminiKey } = require("./plugin.js");

async function watch() {
  await fs.rm("dist", { recursive: true, force: true });
  await fs.mkdir("dist", { recursive: true });

  console.log("[watch] Starting esbuild in watch mode...");

  const geminiKey = await loadGeminiKey();

  const ctx = await esbuild.context({
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

  await ctx.watch();
  await fs.cp("index.html", "dist/index.html");

  console.log("[watch] Watching for changes...");
}

watch().catch((err) => {
  console.error(err);
  process.exit(1);
});
