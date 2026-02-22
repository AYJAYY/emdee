import { useAppStore, type Theme } from "../../store/appStore";
import { openFileDialog } from "../../adapters/dialog";
import { useFile } from "../../hooks/useFile";
import { useMarkdown } from "../../hooks/useMarkdown";
import { useWordCount } from "../../hooks/useWordCount";
import { exportAsHtml } from "../../utils/htmlExport";
import { announce } from "../../utils/announce";
import "./Toolbar.css";

const themes: Theme[] = ["light", "dark", "sepia"];
const themeIcons: Record<Theme, string> = {
  light: "☀️",
  dark: "🌙",
  sepia: "📜",
};
const themeLabels: Record<Theme, string> = {
  light: "Light",
  dark: "Dark",
  sepia: "Sepia",
};

interface ToolbarProps {
  tocOpen: boolean;
  onToggleToc: () => void;
}

export function Toolbar({ tocOpen, onToggleToc }: ToolbarProps) {
  const { theme, setTheme, fontSize, setFontSize, currentFile, currentContent } =
    useAppStore();
  const { openFile } = useFile();
  const renderedHtml = useMarkdown(currentContent);
  const wordStats = useWordCount(currentContent);

  async function handleOpenFile() {
    try {
      const path = await openFileDialog();
      if (path) openFile(path);
    } catch {
      // dialog dismissed or error — ignore
    }
  }

  function handlePrint() {
    window.print();
  }

  async function handleExportHtml() {
    if (!currentFile) return;
    try {
      await exportAsHtml(renderedHtml, theme, fontSize, currentFile);
    } catch {
      // export error — ignore silently
    }
  }

  function cycleTheme() {
    const idx = themes.indexOf(theme);
    const next = themes[(idx + 1) % themes.length];
    setTheme(next);
    announce(`Theme: ${themeLabels[next]}`);
  }

  function handleDecreaseFontSize() {
    const next = Math.max(12, fontSize - 1);
    setFontSize(next);
    announce(`Font size: ${next}px`);
  }

  function handleIncreaseFontSize() {
    const next = Math.min(28, fontSize + 1);
    setFontSize(next);
    announce(`Font size: ${next}px`);
  }

  const fileLabel = currentFile
    ? currentFile.split(/[/\\]/).pop() ?? currentFile
    : "EmDee";

  return (
    <header className="toolbar" role="banner">
      {/* Left group */}
      <div className="toolbar__group">
        <button
          className="toolbar__btn"
          onClick={handleOpenFile}
          type="button"
          title="Open file (Ctrl+O)"
          aria-label="Open markdown file"
        >
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14,2 14,8 20,8"/>
          </svg>
          Open
        </button>
        <button
          className={`toolbar__btn${tocOpen ? " toolbar__btn--active" : ""}`}
          onClick={onToggleToc}
          type="button"
          title="Toggle table of contents (Ctrl+\)"
          aria-label="Toggle table of contents"
          aria-pressed={tocOpen}
          aria-controls="toc-panel"
          disabled={!currentFile}
        >
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="15" y2="12"/>
            <line x1="3" y1="18" x2="18" y2="18"/>
          </svg>
          Contents
        </button>
      </div>

      {/* Centre: file name + word count */}
      <div className="toolbar__center">
        <div className="toolbar__title" aria-label="Current file">
          {fileLabel}
        </div>
        {wordStats && (
          <span
            className="toolbar__meta"
            aria-label={`${wordStats.words} words, ${wordStats.minutes} minute read`}
          >
            {wordStats.words.toLocaleString()} words · {wordStats.minutes} min read
          </span>
        )}
      </div>

      {/* Right group */}
      <div className="toolbar__group">
        {/* Font size */}
        <button
          className="toolbar__btn"
          onClick={handleDecreaseFontSize}
          type="button"
          aria-label="Decrease font size"
          title="Decrease font size"
          disabled={fontSize <= 12}
        >
          A<sup>−</sup>
        </button>
        <span className="toolbar__font-size" aria-label={`Font size ${fontSize}px`}>{fontSize}</span>
        <button
          className="toolbar__btn"
          onClick={handleIncreaseFontSize}
          type="button"
          aria-label="Increase font size"
          title="Increase font size"
          disabled={fontSize >= 28}
        >
          A<sup>+</sup>
        </button>

        <div className="toolbar__divider" aria-hidden="true" />

        {/* Theme toggle */}
        <button
          className="toolbar__btn toolbar__theme-btn"
          onClick={cycleTheme}
          type="button"
          aria-label={`Switch theme (current: ${themeLabels[theme]})`}
          title={`Theme: ${themeLabels[theme]}`}
        >
          <span aria-hidden="true">{themeIcons[theme]}</span>
          <span className="toolbar__theme-label">{themeLabels[theme]}</span>
        </button>

        <div className="toolbar__divider" aria-hidden="true" />

        {/* Export HTML */}
        <button
          className="toolbar__btn toolbar__btn--export"
          onClick={handleExportHtml}
          type="button"
          title="Export as HTML file"
          aria-label="Export as HTML"
          disabled={!currentFile}
        >
          <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16 18 22 12 16 6"/>
            <polyline points="8 6 2 12 8 18"/>
          </svg>
          HTML
        </button>

        {/* Print / PDF */}
        <button
          className="toolbar__btn toolbar__btn--accent"
          onClick={handlePrint}
          type="button"
          title="Print or save as PDF (Ctrl+P)"
          aria-label="Print or save as PDF"
          disabled={!currentFile}
        >
          <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 6 2 18 2 18 9"/>
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
            <rect x="6" y="14" width="12" height="8"/>
          </svg>
          Print / PDF
        </button>
      </div>
    </header>
  );
}
