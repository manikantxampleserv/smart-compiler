/**
 * css - A minimal CSS-in-JS tagged template function.
 * Injects styles into a shared <style> tag and returns a unique class name.
 *
 * @param {TemplateStringsArray} strings
 * @returns {string} Generated class name.
 */
export function css(strings) {
  let styleEl = document.getElementById("css-in-js-style-thing");
  if (!styleEl) {
    styleEl = document.createElement("style");
    styleEl.id = "css-in-js-style-thing";
    document.head.appendChild(styleEl);
  }

  const className = "c_" + Math.random().toString(36).slice(2);
  styleEl.textContent += `\n.${className} {\n${strings[0]}\n}`;
  return className;
}

/** ─── Layout ─────────────────────────────────────────────────────────────────────────── */

export const layoutStyles = css`
  display: flex;
  height: 100vh;
  width: 100vw;
  flex-direction: column;
`;

export const topAreaStyles = css`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

/** ─── Sidebar ────────────────────────────────────────────────────────────────────────── */

export const sidebarStyles = css`
  width: 250px;
  background-color: #252526;
  border-right: 1px solid #333333;
  display: flex;
  flex-direction: column;
`;

export const sidebarHeaderStyles = css`
  padding: 8px 20px;
  font-size: 11px;
  text-transform: uppercase;
  color: #cccccc;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const fileItemStyles = css`
  padding: 4px 20px;
  font-size: 13px;
  color: #cccccc;
  cursor: pointer;
  background-color: #37373d;
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const fileIconStyles = css`
  color: #519aba;
  font-weight: bold;
`;

/** ─── Main Area ─────────────────────────────────────────────────────────────────────── */

export const mainAreaStyles = css`
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #1e1e1e;
  overflow: hidden;
`;

export const tabsBarStyles = css`
  display: flex;
  background-color: #2d2d2d;
  height: 35px;
  align-items: center;
  justify-content: space-between;
  padding-right: 15px;
`;

export const tabStyles = css`
  background-color: #1e1e1e;
  color: #ffffff;
  padding: 0 16px;
  height: 100%;
  display: flex;
  align-items: center;
  font-size: 13px;
  border-top: 1px solid #007acc;
  cursor: pointer;
  gap: 6px;
`;

export const runButtonStyles = css`
  margin-left: auto;
  margin-right: 12px;
  background: transparent;
  color: #cccccc;
  border: none;
  cursor: pointer;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

/** ─── Split Container ────────────────────────────────────────────────────────────── */

export const splitContainerRowStyles = css`
  display: flex;
  flex: 1;
  flex-direction: row;
  overflow: hidden;
`;

export const splitContainerColStyles = css`
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow: hidden;
`;

/** ─── Editor ─────────────────────────────────────────────────────────────────────────── */

export const editorContainerStyles = css`
  flex: 1;
  overflow: auto;
  position: relative;
`;

export const editorWrapperStyles = css`
  display: flex;
  min-height: 100%;
  position: relative;
`;

export const lineNumbersStyles = css`
  padding: 20px 15px;
  background-color: #1e1e1e;
  color: #858585;
  text-align: right;
  user-select: none;
  font-family: "Consolas", "Courier New", monospace;
  font-size: 14px;
  line-height: 1.5;
  border-right: 1px solid #333333;
`;

export const editorStyles = css`
  font-family: "Consolas", "Courier New", monospace;
  font-size: 14px;
  line-height: 1.5;
  flex: 1;
`;

/** ─── Skeleton Loader ────────────────────────────────────────────────────────────── */

export const skeletonContainerStyles = css`
  flex: 1;
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

export const skeletonLineStyles = css`
  height: 14px;
  background-color: #2d2d2d;
  border-radius: 4px;
  background-image: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0,
    rgba(255, 255, 255, 0.04) 20%,
    rgba(255, 255, 255, 0.08) 50%,
    rgba(255, 255, 255, 0.04) 80%,
    rgba(255, 255, 255, 0) 100%
  );
  background-size: 200% 100%;
  animation: shimmer-skeleton 1.5s infinite linear;

  @keyframes shimmer-skeleton {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
`;

/** ─── Terminal ──────────────────────────────────────────────────────────────────────── */

export const terminalPanelSideStyles = css`
  background-color: #1e1e1e;
  border-left: 1px solid #444444;
  display: flex;
  flex-direction: column;
`;

export const terminalPanelBottomStyles = css`
  background-color: #1e1e1e;
  border-top: 1px solid #444444;
  display: flex;
  flex-direction: column;
`;

export const resizerStylesRow = css`
  width: 4px;
  background-color: #2d2d2d;
  cursor: col-resize;
  &:hover {
    background-color: #007acc;
  }
`;

export const resizerStylesCol = css`
  height: 4px;
  background-color: #2d2d2d;
  cursor: row-resize;
  &:hover {
    background-color: #007acc;
  }
`;

export const terminalHeaderStyles = css`
  display: flex;
  padding: 0 20px;
  height: 35px;
  align-items: center;
`;

export const terminalTabStyles = css`
  color: #e7e7e7;
  text-transform: uppercase;
  font-size: 11px;
  border-bottom: 1px solid #e7e7e7;
  padding-bottom: 2px;
  margin-right: 20px;
  cursor: pointer;
`;

export const terminalContentStyles = css`
  flex: 1;
  padding: 10px 20px;
  font-family: "Consolas", "Courier New", monospace;
  font-size: 13px;
  line-height: 1.5;
  color: #cccccc;
  overflow-y: auto;
  margin: 0;
  white-space: pre-wrap;
`;

/** ─── Status Bar ───────────────────────────────────────────────────────────────────── */

export const statusBarStyles = css`
  height: 22px;
  background-color: #007acc;
  color: #ffffff;
  display: flex;
  align-items: center;
  padding: 0 10px;
  font-size: 12px;
  justify-content: space-between;
`;

export const inputAreaStyles = css`
  height: 60px;
  background-color: #1e1e1e;
  color: #cccccc;
  font-family: "Consolas", "Courier New", monospace;
  font-size: 13px;
  border: none;
  border-top: 1px solid #444;
  padding: 10px 20px;
  resize: none;
  outline: none;
  &::placeholder {
    color: #666;
  }
`;
