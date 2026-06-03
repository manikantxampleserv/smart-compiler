import Prism from "prismjs";
import "prismjs/components/prism-c";
import "prismjs/components/prism-cpp";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-python";
import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import Editor from "react-simple-code-editor";
import {
  editorContainerStyles,
  editorStyles,
  editorWrapperStyles,
  fileIconStyles,
  fileItemStyles,
  inputAreaStyles,
  layoutStyles,
  lineNumbersStyles,
  mainAreaStyles,
  resizerStylesCol,
  resizerStylesRow,
  runButtonStyles,
  sidebarHeaderStyles,
  sidebarStyles,
  skeletonContainerStyles,
  skeletonLineStyles,
  splitContainerColStyles,
  splitContainerRowStyles,
  statusBarStyles,
  tabStyles,
  tabsBarStyles,
  terminalContentStyles,
  terminalHeaderStyles,
  terminalPanelBottomStyles,
  terminalPanelSideStyles,
  terminalTabStyles,
  topAreaStyles,
} from "./styles.js";

/** ─── Constants ────────────────────────────────────────────────────────────────────── */

const DEFAULT_C_CODE = `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

/** A comprehensive C program demonstrating structs, sorting, and formatted output. */

#define MAX_ITEMS 10

typedef struct {
    int id;
    char name[50];
    float price;
} Item;

void printItems(Item items[], int count) {
    printf("--- Inventory List ---\\n");
    for (int i = 0; i < count; i++) {
        printf("ID: %d | Name: %s | Price: $%.2f\\n", items[i].id, items[i].name, items[i].price);
    }
    printf("----------------------\\n");
}

void sortItemsByPrice(Item items[], int count) {
    for (int i = 0; i < count - 1; i++) {
        for (int j = 0; j < count - i - 1; j++) {
            if (items[j].price > items[j+1].price) {
                Item temp = items[j];
                items[j] = items[j+1];
                items[j+1] = temp;
            }
        }
    }
}

int main() {
    printf("Starting MKX Inventory System...\\n\\n");

    Item inventory[MAX_ITEMS] = {
        {1, "Mechanical Keyboard", 120.50},
        {2, "Wireless Mouse", 45.99},
        {3, "USB-C Hub", 29.99},
        {4, "4K Monitor", 399.00},
        {5, "Desk Mat", 19.50}
    };

    int itemCount = 5;

    printf("Original Order:\\n");
    printItems(inventory, itemCount);

    printf("\\nSorting items by price...\\n");
    sortItemsByPrice(inventory, itemCount);

    printf("\\nSorted Order:\\n");
    printItems(inventory, itemCount);

    return 0;
}`;

const SKELETON_LINES = [
  { w: "30%", indent: 0, mt: 0 },
  { w: "45%", indent: 0, mt: 0 },
  { w: "20%", indent: 0, mt: 10 },
  { w: "70%", indent: 0, mt: 0 },
  { w: "55%", indent: 0, mt: 0 },
  { w: "80%", indent: 0, mt: 0 },
  { w: "40%", indent: 0, mt: 0 },
  { w: "15%", indent: 0, mt: 10 },
];

const LINE_HEIGHT_PX = 21;

/** ─── Helpers ──────────────────────────────────────────────────────────────────────── */

/**
 * Calls the remote code execution API.
 *
 * @param {string} code - URI-encoded source code.
 * @param {string} stdin - Standard input for the program.
 * @param {string} language - Language identifier.
 * @returns {Promise<{ code: number, stdout: string, stderr: string }>}
 */
async function executeCode(code, stdin = "", language = "c") {
  const res = await fetch("/mkx/v1/execute", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, input: stdin, language }),
  });
  return res.json();
}

/** @param {string} lang */
const getFileIcon = (lang) =>
  ({ c: "C", cpp: "C++", python: "Py", javascript: "JS" })[lang] ?? "C";

/** @param {string} lang */
const getFileName = (lang) =>
  ({ c: "main.c", cpp: "main.cpp", python: "main.py", javascript: "main.js" })[
  lang
  ] ?? "main.c";

/** ─── App ──────────────────────────────────────────────────────────────────────────── */

const App = () => {
  /** ── State ───────────────────────────────────────────────────────────────────────── */

  const [codes, setCodes] = useState(() => {
    const saved = localStorage.getItem("codes_v4");
    return saved
      ? JSON.parse(saved)
      : { c: DEFAULT_C_CODE, cpp: "", python: "", javascript: "" };
  });

  const [output, setOutput] = useState(
    "Welcome to React use terminal.",
  );

  const [loading, setLoading] = useState(false);

  const [language, setLanguage] = useState(
    () => localStorage.getItem("language") || "c",
  );
  const [layoutMode, setLayoutMode] = useState(
    () => localStorage.getItem("layoutMode") || "split",
  );
  const [terminalSize, setTerminalSize] = useState(
    () => parseInt(localStorage.getItem("terminalSize")) || 400,
  );

  const [translating, setTranslating] = useState(false);
  const [translationError, setTranslationError] = useState(false);
  const [lastSourceLanguage, setLastSourceLanguage] = useState(null);
  const [highlightedError, setHighlightedError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  /** ── Refs ─────────────────────────────────────────────────────────────────────────── */

  const terminalRef = useRef(null);
  const editorContainerRef = useRef(null);
  const isTypingRef = useRef(false);
  const promptRef = useRef(null);

  /** ── Derived ──────────────────────────────────────────────────────────────────────── */

  const displayLanguage =
    translating && lastSourceLanguage ? lastSourceLanguage : language;
  const code = codes[displayLanguage] || "";
  const lines = Array.from(
    { length: code.split("\n").length || 1 },
    (_, i) => i + 1,
  );

  const setCode = (newCode) =>
    setCodes((prev) => ({ ...prev, [language]: newCode }));

  /** ── Persistence Effects ────────────────────────────────────────────────────────── */

  useEffect(() => {
    localStorage.setItem("codes", JSON.stringify(codes));
  }, [codes]);

  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem("layoutMode", layoutMode);
  }, [layoutMode]);

  useEffect(() => {
    localStorage.setItem("terminalSize", terminalSize);
  }, [terminalSize]);

  /** ── Auto-Scroll Effects ─────────────────────────────────────────────────────────── */

  useEffect(() => {
    if (isTypingRef.current && editorContainerRef.current) {
      editorContainerRef.current.scrollTop =
        editorContainerRef.current.scrollHeight;
    }
  }, [code]);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [output]);

  /** ── Keyboard Shortcut ───────────────────────────────────────────────────────────── */

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
      }
    };
    document.addEventListener("keydown", handleKeyDown, { capture: true });
    return () =>
      document.removeEventListener("keydown", handleKeyDown, { capture: true });
  }, []);

  /** ── Drag-to-Resize Effect ───────────────────────────────────────────────────────── */

  useEffect(() => {
    if (!isDragging) return;

    const onMouseMove = (e) => {
      if (layoutMode === "split") {
        const size = Math.max(
          150,
          Math.min(window.innerWidth - e.clientX, window.innerWidth - 400),
        );
        setTerminalSize(size);
      } else {
        const size = Math.max(
          100,
          Math.min(
            window.innerHeight - e.clientY - 22,
            window.innerHeight - 150,
          ),
        );
        setTerminalSize(size);
      }
    };

    const onMouseUp = () => setIsDragging(false);

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, [isDragging, layoutMode]);

  /** ── Handlers ─────────────────────────────────────────────────────────────────────── */

  /**
   * Generates source code from a natural language prompt using the Gemini API.
   * Applies the result to the editor with a typewriter effect.
   */
  const generateFromPrompt = async (prompt) => {
    if (!prompt?.trim() || loading) return;

    setLoading(true);
    setOutput(
      (prev) => prev + `\n\n> Generating ${language} code for: "${prompt}"...`,
    );

    try {
      const res = await fetch("/mkx/v1/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          language,
          apiKey: process.env.GEMINI_API_KEY,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setOutput(
          (prev) => prev + `\n[Error] Generation failed: ${data.error}`,
        );
        setLoading(false);
        return;
      }

      setOutput((prev) => prev + `\n[Success] Code generated!`);
      if (promptRef.current) promptRef.current.value = "";

      let i = 0;
      const finalCode = data.code;
      setCodes((prev) => ({ ...prev, [language]: "" }));
      isTypingRef.current = true;

      const typeInterval = setInterval(() => {
        if (i >= finalCode.length) {
          clearInterval(typeInterval);
          setLoading(false);
          isTypingRef.current = false;
          return;
        }
        i += Math.max(1, Math.floor(Math.random() * 4) + 1);
        setCodes((prev) => ({
          ...prev,
          [language]: finalCode.substring(0, i),
        }));
      }, 10);
    } catch (err) {
      setOutput((prev) => prev + `\n[Error] Generation failed: ${err.message}`);
      setLoading(false);
    }
  };

  const performTranslation = async (sourceLang, targetLang) => {
    if (sourceLang === targetLang) return;

    setLoading(true);
    setTranslating(true);
    setTranslationError(false);
    setLastSourceLanguage(sourceLang);
    setOutput(
      (prev) =>
        prev +
        `\n\n> Translating code from ${sourceLang} to ${targetLang} using Gemini AI...`,
    );

    try {
      const res = await fetch("/mkx/v1/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: codes[sourceLang],
          targetLanguage: targetLang,
          apiKey: process.env.GEMINI_API_KEY,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setOutput(
          (prev) => prev + `\n[Error] Translation failed: ${data.error}`,
        );
        setTranslationError(true);
        setTranslating(false);
        setLoading(false);
        return;
      }

      if (data.code) {
        setOutput((prev) => prev + `\n[Success] Translated successfully!`);
        setTranslationError(false);
        setTranslating(false);

        let i = 0;
        const finalCode = data.code;
        setCodes((prev) => ({ ...prev, [targetLang]: "" }));
        isTypingRef.current = true;

        const typeInterval = setInterval(() => {
          if (i >= finalCode.length) {
            clearInterval(typeInterval);
            setLoading(false);
            isTypingRef.current = false;
            return;
          }
          i += Math.max(1, Math.floor(Math.random() * 4) + 1);
          setCodes((prev) => ({
            ...prev,
            [targetLang]: finalCode.substring(0, i),
          }));
        }, 10);
      }
    } catch (err) {
      setOutput(
        (prev) => prev + `\n[Error] Translation failed: ${err.message}`,
      );
      setTranslationError(true);
      setTranslating(false);
      setLoading(false);
    }
  };

  const handleLanguageChange = (e) => {
    const next = e.target.value;
    const prev = language;
    setLanguage(next);
    if (next !== prev) performTranslation(prev, next);
  };

  const handleRetryTranslation = () => {
    if (lastSourceLanguage && language !== lastSourceLanguage) {
      performTranslation(lastSourceLanguage, language);
    }
  };

  const handleLineClick = (lineText) => {
    let match =
      lineText.match(/main\.(c|cpp|py|js):(\d+)/) ||
      lineText.match(/main\.py", line (\d+)/) ||
      lineText.match(/main\.js:(\d+)/);

    if (!match) return;

    const lineNumber = parseInt(match[match.length - 1], 10);
    const errorMessage =
      lineText
        .replace(/^.*main\.(c|cpp|py|js)[:", ]*(line )?\d+[:]?/, "")
        .trim() || "Error on this line";

    setHighlightedError({ line: lineNumber, message: errorMessage });
    editorContainerRef.current?.scrollTo({
      top: Math.max(0, 20 + (lineNumber - 1) * LINE_HEIGHT_PX - 50),
      behavior: "smooth",
    });
  };

  const onRun = async () => {
    setLoading(true);
    setHighlightedError(null);
    setOutput(
      (prev) =>
        prev + `\n\n> Compiling and running ${getFileName(language)}...`,
    );

    try {
      const result = await executeCode(
        encodeURIComponent(code),
        promptRef.current?.value ?? "",
        language,
      );
      if (result.code !== 0) {
        setOutput(
          (prev) => prev + "\n[Error] Execution failed:\n" + result.stderr,
        );
      } else {
        const text =
          result.stdout + (result.stderr ? "\n" + result.stderr : "");
        setOutput((prev) => prev + "\n" + text + "\n[Done] exited with code 0");
      }
    } catch (err) {
      setOutput((prev) => prev + "\n[System Error] " + err.message);
    }

    setLoading(false);
  };

  const clearTerminal = () => {
    setOutput("Welcome to React use terminal.");
    setHighlightedError(null);
  };

  /** ── Render ────────────────────────────────────────────────────────────────────────── */

  return (
    <div className={layoutStyles}>
      <div className={topAreaStyles}>
        {/* Sidebar */}
        <div className={sidebarStyles}>
          <div className={sidebarHeaderStyles}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#007acc"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 20L4 4L12 14L20 4L20 20" />
            </svg>
            MKX EDITOR
          </div>
          <div className={fileItemStyles}>
            <span className={fileIconStyles}>{getFileIcon(language)}</span>
            {getFileName(language)}
          </div>
        </div>

        {/* Main area */}
        <div className={mainAreaStyles}>
          {/* Tabs bar */}
          <div className={tabsBarStyles}>
            <div className={tabStyles}>
              <span className={fileIconStyles}>{getFileIcon(language)}</span>
              {getFileName(language)}
            </div>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              {translationError && (
                <button
                  onClick={handleRetryTranslation}
                  style={{
                    background: "rgba(244, 71, 71, 0.2)",
                    color: "#f44747",
                    border: "1px solid rgba(244, 71, 71, 0.5)",
                    padding: "4px 8px",
                    borderRadius: "3px",
                    fontSize: "12px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <span style={{ fontSize: "14px" }}>⟳</span> Retry Translation
                </button>
              )}
              <select
                value={language}
                onChange={handleLanguageChange}
                style={{
                  background: "#2d2d2d",
                  color: "#cccccc",
                  border: "1px solid #444",
                  padding: "4px 8px",
                  borderRadius: "3px",
                  outline: "none",
                  fontSize: "12px",
                  fontFamily: '"Consolas", "Courier New", monospace',
                }}
              >
                <option value="c">C</option>
                <option value="cpp">C++</option>
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
              </select>
              <button
                className={runButtonStyles}
                onClick={onRun}
                disabled={loading}
                style={{ opacity: loading ? 0.5 : 1 }}
              >
                {loading ? "⚙️ Running..." : "▶ Run Code"}
              </button>
            </div>
          </div>

          {/* Split container */}
          <div
            className={
              layoutMode === "split"
                ? splitContainerRowStyles
                : splitContainerColStyles
            }
            style={{ userSelect: isDragging ? "none" : "auto" }}
          >
            {/* Editor pane */}
            <div className={editorContainerStyles} ref={editorContainerRef}>
              <div className={editorWrapperStyles}>
                {/* Line numbers */}
                <div className={lineNumbersStyles} style={{ zIndex: 2 }}>
                  {lines.map((n) => (
                    <div
                      key={n}
                      title={
                        highlightedError?.line === n
                          ? highlightedError.message
                          : undefined
                      }
                      style={{
                        color:
                          highlightedError?.line === n ? "#f44747" : "#858585",
                        cursor:
                          highlightedError?.line === n ? "help" : "default",
                      }}
                    >
                      {n}
                    </div>
                  ))}
                </div>

                {/* Error highlight overlay */}
                {highlightedError !== null && (
                  <div
                    style={{
                      position: "absolute",
                      top: 20 + (highlightedError.line - 1) * LINE_HEIGHT_PX,
                      left: 0,
                      right: 0,
                      height: LINE_HEIGHT_PX,
                      backgroundColor: "rgba(244, 71, 71, 0.2)",
                      pointerEvents: "none",
                      zIndex: 1,
                    }}
                  />
                )}

                {/* Skeleton loader or editor */}
                {translating ? (
                  <div className={skeletonContainerStyles}>
                    {SKELETON_LINES.map((line, i) => (
                      <div
                        key={i}
                        className={skeletonLineStyles}
                        style={{
                          width: line.w,
                          marginLeft: `${line.indent}px`,
                          marginTop: `${line.mt}px`,
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      animation: "fadeIn 0.4s ease-out forwards",
                    }}
                  >
                    <Editor
                      value={code}
                      onValueChange={setCode}
                      highlight={(src) =>
                        Prism.highlight(
                          src,
                          Prism.languages[language] || Prism.languages.c,
                          language,
                        )
                      }
                      padding={20}
                      className={editorStyles}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Drag resizer */}
            <div
              className={
                layoutMode === "split" ? resizerStylesRow : resizerStylesCol
              }
              onMouseDown={() => setIsDragging(true)}
            />

            {/* Terminal pane */}
            <div
              className={
                layoutMode === "split"
                  ? terminalPanelSideStyles
                  : terminalPanelBottomStyles
              }
              style={{
                flex: `0 0 ${terminalSize}px`,
                [layoutMode === "split" ? "width" : "height"]:
                  `${terminalSize}px`,
              }}
            >
              <div className={terminalHeaderStyles}>
                <div className={terminalTabStyles}>Terminal</div>
                <div style={{ marginLeft: "auto", display: "flex", gap: "8px", alignItems: "center" }}>
                  <button
                    onClick={clearTerminal}
                    style={{
                      background: "transparent",
                      color: "#cccccc",
                      border: "1px solid #444",
                      padding: "4px 8px",
                      borderRadius: "3px",
                      fontSize: "11px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                    title="Clear terminal"
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                    >
                      <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z" />
                    </svg>
                    Clear
                  </button>
                  <div
                    onClick={() =>
                      setLayoutMode((prev) =>
                        prev === "split" ? "bottom" : "split",
                      )
                    }
                    style={{
                      cursor: "pointer",
                      fontSize: "11px",
                      color: "#888",
                      textTransform: "uppercase",
                    }}
                  >
                    {layoutMode === "split" ? (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="currentColor"
                      >
                        <title>Move to Bottom</title>
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M14 2H2V14H14V2ZM1 2C1 1.44772 1.44772 1 2 1H14C14.5523 1 15 1.44772 15 2V14C15 14.5523 14.5523 15 14 15H2C1.44772 15 1 14.5523 1 14V2ZM2 10H14V14H2V10Z"
                        />
                      </svg>
                    ) : (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="currentColor"
                      >
                        <title>Move to Right</title>
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M14 2H2V14H14V2ZM1 2C1 1.44772 1.44772 1 2 1H14C14.5523 1 15 1.44772 15 2V14C15 14.5523 14.5523 15 14 15H2C1.44772 15 1 14.5523 1 14V2ZM10 2H14V14H10V2Z"
                        />
                      </svg>
                    )}
                  </div>
                </div>
              </div>

              {/* Terminal output */}
              <pre className={terminalContentStyles} ref={terminalRef}>
                {output.split("\n").map((line, idx) => {
                  let color = "#cccccc";
                  const isClickable =
                    line.match(/main\.(c|cpp|py|js):(\d+)/) ||
                    line.match(/main\.py", line (\d+)/) ||
                    line.match(/main\.js:(\d+)/);

                  if (line.startsWith("> ")) color = "#0075d4ff";
                  else if (
                    line.startsWith("[Error]") ||
                    line.startsWith("[System Error]")
                  )
                    color = "#f44747";
                  else if (line.startsWith("[Done]")) color = "#007910ff";
                  else if (
                    line.startsWith("Welcome to") ||
                    line.startsWith("Waiting for")
                  )
                    color = "#ebb222ff";

                  return (
                    <div
                      key={idx}
                      style={{
                        color,
                        minHeight: "1em",
                        cursor: isClickable ? "pointer" : "text",
                        textDecoration: isClickable ? "underline" : "none",
                      }}
                      onClick={() => isClickable && handleLineClick(line)}
                    >
                      {line}
                    </div>
                  );
                })}
              </pre>

              {/* AI Prompt input */}
              <textarea
                ref={promptRef}
                className={inputAreaStyles}
                placeholder="Describe the code you want... (Enter to generate)"
                defaultValue=""
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    generateFromPrompt(promptRef.current?.value);
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Status bar */}
      <div className={statusBarStyles}>
        <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
          <span>{getFileName(language)}</span>
        </div>
        <div>
          <span>UTF-8</span>&nbsp;&nbsp;
          <span>{loading ? "Busy..." : "Ready"}</span>&nbsp;&nbsp;
          <span>{getFileIcon(language)}</span>
        </div>
      </div>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById("app"));
