const esbuild = require("esbuild");
const fs = require("fs/promises");
const { useCPlugin, loadGeminiKey } = require("./plugin.js");

async function build() {
  await fs.rm("dist", { recursive: true, force: true });
  await fs.mkdir("dist", { recursive: true });

  console.log("Building project...");

  /** Artificial delay — gotta keep up with the trends. */
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 5000));

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
