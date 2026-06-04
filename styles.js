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
  background-color: var(--bg-sidebar);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
`;

export const sidebarHeaderStyles = css`
  padding: 8px 20px;
  font-size: 11px;
  text-transform: uppercase;
  color: var(--text-main);
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const fileItemStyles = css`
  padding: 4px 20px;
  font-size: 13px;
  color: var(--text-main);
  cursor: pointer;
  background-color: var(--bg-hover);
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
  background-color: var(--bg-main);
  overflow: hidden;
`;

export const tabsBarStyles = css`
  display: flex;
  background-color: var(--bg-header);
  height: 35px;
  align-items: center;
  justify-content: space-between;
  padding-right: 15px;
`;

export const tabStyles = css`
  background-color: var(--bg-main);
  color: var(--text-main);
  padding: 0 16px;
  height: 100%;
  display: flex;
  align-items: center;
  font-size: 13px;
  border-top: 1px solid var(--accent-color);
  cursor: pointer;
  gap: 6px;
`;

export const runButtonStyles = css`
  margin-left: auto;
  background: transparent;
  color: var(--text-main);
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
  background-color: var(--bg-main);
  color: var(--text-muted);
  text-align: right;
  user-select: none;
  font-family: "Consolas", "Courier New", monospace;
  font-size: 14px;
  line-height: 1.5;
  border-right: 1px solid var(--border-color);
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
  background-color: var(--bg-header);
  border-radius: 4px;
  background-image: linear-gradient(
    90deg,
    var(--skeleton-grad-1) 0,
    var(--skeleton-grad-2) 20%,
    var(--skeleton-grad-3) 50%,
    var(--skeleton-grad-2) 80%,
    var(--skeleton-grad-1) 100%
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
  background-color: var(--bg-main);
  border-left: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
`;

export const terminalPanelBottomStyles = css`
  background-color: var(--bg-main);
  border-top: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
`;

export const resizerStylesRow = css`
  width: 4px;
  background-color: var(--bg-header);
  cursor: col-resize;
  &:hover {
    background-color: var(--accent-color);
  }
`;

export const resizerStylesCol = css`
  height: 4px;
  background-color: var(--bg-header);
  cursor: row-resize;
  &:hover {
    background-color: var(--accent-color);
  }
`;

export const terminalHeaderStyles = css`
  display: flex;
  padding: 0 20px;
  height: 35px;
  align-items: center;
`;

export const terminalTabStyles = css`
  color: var(--text-strong);
  text-transform: uppercase;
  font-size: 11px;
  border-bottom: 1px solid var(--text-strong);
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
  color: var(--text-main);
  overflow-y: auto;
  margin: 0;
  white-space: pre-wrap;
`;

/** ─── Status Bar ───────────────────────────────────────────────────────────────────── */

export const statusBarStyles = css`
  height: 22px;
  background-color: var(--accent-color);
  color: var(--text-light);
  display: flex;
  align-items: center;
  padding: 0 10px;
  font-size: 12px;
  justify-content: space-between;
`;

export const inputAreaStyles = css`
  height: 60px;
  background-color: var(--bg-main);
  color: var(--text-main);
  font-family: "Consolas", "Courier New", monospace;
  font-size: 13px;
  border: none;
  border-top: 1px solid var(--border-color);
  padding: 10px 20px;
  resize: none;
  outline: none;
  &::placeholder {
    color: var(--text-muted);
  }
`;
export const appStyles = css`
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-main);
  color: var(--text-main);
`;

export const editorAnimatedContainerStyles = css`
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  animation: fadeIn 0.3s ease-in-out;
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(5px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

export const errorHighlightOverlayStyles = css`
  position: absolute;
  left: 0;
  right: 0;
  height: 21px;
  background-color: var(--error-bg);
  border-left: 3px solid var(--error-color);
  pointer-events: none;
  z-index: 10;
`;

export const languageSelectStyles = css`
  background-color: transparent;
  color: var(--text-main);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  padding: 2px 5px;
  font-size: 12px;
  width: 150px;
  cursor: pointer;
  outline: none;
  option {
    background-color: var(--bg-main);
    color: var(--text-main);
  }
`;

export const modalOverlayStyles = css`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--modal-overlay);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
`;

export const modalContainerStyles = css`
  background-color: var(--bg-main);
  border-radius: 8px;
  width: 400px;
  max-width: 90vw;
  box-shadow: 0 4px 20px var(--modal-shadow);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--border-color);
  animation: modalPop 0.2s ease-out;
  @keyframes modalPop {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
`;

export const modalHeaderStyles = css`
  padding: 15px 20px;
  background-color: var(--bg-header);
  border-bottom: 1px solid var(--border-color);
  font-weight: bold;
  font-size: 16px;
  color: var(--text-strong);
`;

export const modalBodyStyles = css`
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

export const modalMessageStyles = css`
  font-size: 14px;
  color: var(--text-main);
  line-height: 1.5;
`;

export const modalFieldsContainerStyles = css`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const modalFieldStyles = css`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const modalLabelStyles = css`
  font-size: 13px;
  color: var(--text-muted);
  font-weight: 500;
`;

export const modalInputStyles = css`
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid var(--border-color);
  background-color: var(--bg-main);
  color: var(--text-main);
  font-size: 14px;
  outline: none;
  &:focus {
    border-color: var(--accent-color);
  }
`;

export const modalFooterStyles = css`
  padding: 15px 20px;
  background-color: var(--bg-sidebar);
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

export const modalBtnCancelStyles = css`
  padding: 8px 16px;
  border-radius: 4px;
  border: 1px solid var(--border-color);
  background-color: transparent;
  color: var(--text-main);
  cursor: pointer;
  font-size: 13px;
  &:hover {
    background-color: var(--bg-hover);
  }
`;

export const modalBtnSubmitStyles = css`
  padding: 8px 16px;
  border-radius: 4px;
  border: none;
  background-color: var(--accent-color);
  color: #fff;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  &:hover {
    background-color: var(--accent-hover);
  }
`;

export const retryTranslationBtnStyles = css`
  padding: 4px 8px;
  background-color: var(--error-bg);
  color: var(--error-color);
  border: 1px solid var(--error-border);
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  &:hover {
    background-color: var(--error-color);
    color: #fff;
  }
`;

export const tabsBarActionsStyles = css`
  display: flex;
  align-items: center;
  gap: 12px;
`;
