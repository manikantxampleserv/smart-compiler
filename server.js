const express = require("express");
const childProcess = require("child_process");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const fsPromises = require("fs/promises");
const path = require("path");
const os = require("os");

/** ─── App Setup ──────────────────────────────────────────────────────────── */

const app = express();
const PORT = process.env.PORT ?? 3000;
const IS_WIN = os.platform() === "win32";

app.use(
  express.static("dist", {
    setHeaders: (res) => {
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
    },
  })
);
app.use(express.json());

/** ─── Constants ──────────────────────────────────────────────────────────── */

const ZIG_PATH = path.resolve(
  __dirname,
  IS_WIN
    ? `node_modules/@oven/zig-win32-${os.arch() === "x64" ? "x64" : "x86"}/zig.exe`
    : "node_modules/@oven/zig/zig"
);

const GEMINI_MODEL = "gemini-flash-lite-latest";
const COMPILE_TIMEOUT_MS = 120_000;
const RUN_TIMEOUT_MS = 5_000;

/** ─── Startup ──────────────────────────────────────────────────────────────── */

// On Linux (e.g. Render), ensure the zig binary is executable after npm install.
if (!IS_WIN) {
  try {
    fs.chmodSync(ZIG_PATH, 0o755);
    console.log("Zig binary marked executable.");
  } catch {
    console.warn("Warning: Could not chmod zig binary — C/C++ compilation may fail.");
  }
}

/** ─── Helpers ─────────────────────────────────────────────────────────────── */

/**
 * Spawns a child process and resolves with its output.
 *
 * @param {string} command - The command to run.
 * @param {string[]} args - Arguments to pass to the command.
 * @param {string} [inputString=""] - Optional stdin to write to the process.
 * @param {number} [timeoutMs=5000] - Kill timeout in milliseconds.
 * @returns {Promise<{ code: number, stdout: string, stderr: string }>}
 */
function spawnProcess(command, args, inputString = "", timeoutMs = RUN_TIMEOUT_MS) {
  return new Promise((resolve) => {
    const proc = childProcess.spawn(command, args, { shell: IS_WIN });
    const stdoutChunks = [];
    const stderrChunks = [];
    let settled = false;

    const settle = (result) => {
      if (settled) return;
      settled = true;
      resolve(result);
    };

    if (inputString) proc.stdin.write(inputString);
    proc.stdin.end();

    const timer = setTimeout(() => {
      proc.kill();
      settle({
        code: -1,
        stdout: Buffer.concat(stdoutChunks).toString(),
        stderr:
          Buffer.concat(stderrChunks).toString() +
          `\n[Error] Execution timed out after ${timeoutMs / 1000} seconds.`,
      });
    }, timeoutMs);

    proc.stdout.on("data", (chunk) => stdoutChunks.push(chunk));
    proc.stderr.on("data", (chunk) => stderrChunks.push(chunk));

    proc.on("error", (err) => {
      clearTimeout(timer);
      settle({
        code: -1,
        stdout: Buffer.concat(stdoutChunks).toString(),
        stderr: Buffer.concat(stderrChunks).toString() + `\nError: ${err.message}`,
      });
    });

    proc.on("close", (code) => {
      clearTimeout(timer);
      settle({
        code,
        stdout: Buffer.concat(stdoutChunks).toString(),
        stderr: Buffer.concat(stderrChunks).toString(),
      });
    });
  });
}

/**
 * Creates a unique temporary directory prefixed with "use-c".
 *
 * @returns {Promise<string>} Path to the created temp directory.
 */
function createTempDir() {
  return new Promise((resolve, reject) => {
    fs.mkdtemp(path.join(os.tmpdir(), "use-c"), (err, dir) => {
      if (err) reject(err);
      else resolve(dir);
    });
  });
}

/**
 * Compiles and/or runs the provided source code in an isolated temp directory.
 *
 * @param {string} language - One of: 'c', 'cpp', 'python', 'javascript'.
 * @param {string} code - URI-encoded source code to execute.
 * @param {string} input - Stdin to pass to the running program.
 * @returns {Promise<{ code: number, stdout: string, stderr: string }>}
 */
async function runCode(language, code, input) {
  const dir = await createTempDir();
  const source = decodeURIComponent(code);

  if (language === "c" || language === "cpp") {
    const isCpp = language === "cpp";
    const srcFile = path.join(dir, isCpp ? "main.cpp" : "main.c");
    const outFile = path.join(dir, IS_WIN ? "main.exe" : "main");

    await fsPromises.writeFile(srcFile, source);

    let compileResult;
    if (os.platform() === "darwin") {
      const compiler = isCpp ? "clang++" : "clang";
      compileResult = await spawnProcess(
        compiler,
        [srcFile, "-o", outFile],
        "",
        COMPILE_TIMEOUT_MS
      );
    } else {
      compileResult = await spawnProcess(
        ZIG_PATH,
        [isCpp ? "c++" : "cc", srcFile, "-o", outFile],
        "",
        COMPILE_TIMEOUT_MS
      );
    }
    if (compileResult.code !== 0) return compileResult;

    return spawnProcess(outFile, [], input, RUN_TIMEOUT_MS);
  }

  if (language === "python") {
    const srcFile = path.join(dir, "main.py");
    await fsPromises.writeFile(srcFile, source);
    return spawnProcess(IS_WIN ? "python" : "python3", [srcFile], input, RUN_TIMEOUT_MS);
  }

  if (language === "javascript") {
    const srcFile = path.join(dir, "main.js");
    await fsPromises.writeFile(srcFile, source);
    return spawnProcess("node", [srcFile], input, RUN_TIMEOUT_MS);
  }

  return { code: -1, stdout: "", stderr: `Unsupported language: ${language}` };
}

/** ─── Routes ──────────────────────────────────────────────────────────────── */

/**
 * POST /mkx/v1/execute
 * Remotely compiles and executes code.
 * Body: { code: string, input?: string, language?: string }
 */
app.post("/mkx/v1/execute", async (req, res) => {
  const { code, input = "", language = "c" } = req.body;
  const result = await runCode(language, code, input);
  res.json(result);
});

/**
 * POST /mkx/v1/translate
 * Translates source code to a target language using the Gemini API.
 * Body: { code: string, targetLanguage: string, apiKey: string }
 */
app.post("/mkx/v1/translate", async (req, res) => {
  const { code, targetLanguage, apiKey } = req.body;

  if (!apiKey) {
    return res.status(400).json({ error: "Missing API Key" });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

    const prompt =
      `Translate the following code into ${targetLanguage}. ` +
      `Respond ONLY with the raw code. Do NOT wrap it in markdown code blocks like \`\`\`. ` +
      `Just return the pure code.\n\nCode:\n${code}`;

    const result = await model.generateContent(prompt);
    let translatedCode = result.response.text();

    translatedCode = translatedCode
      .replace(/^```\w*\n/g, "")
      .replace(/```$/g, "")
      .trim();

    res.json({ code: translatedCode });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /mkx/v1/generate
 * Generates source code from a natural language prompt using Gemini.
 * Body: { prompt: string, language: string, apiKey: string }
 */
app.post("/mkx/v1/generate", async (req, res) => {
  const { prompt, language, apiKey } = req.body;

  if (!apiKey) return res.status(400).json({ error: "Missing API Key" });
  if (!prompt) return res.status(400).json({ error: "Missing prompt" });

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

    const fullPrompt =
      `Write ${language} code for the following: ${prompt}. ` +
      `Respond ONLY with the raw code. Do NOT wrap it in markdown code blocks like \`\`\`. ` +
      `Just return the pure, runnable code with no explanation.`;

    const result = await model.generateContent(fullPrompt);
    let generatedCode = result.response.text();

    generatedCode = generatedCode
      .replace(/^```\w*\n/g, "")
      .replace(/```$/g, "")
      .trim();

    res.json({ code: generatedCode });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** ─── Start ───────────────────────────────────────────────────────────────── */

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
