import { useAppStore, type Theme } from "../../store/appStore";
import { openFileDialog } from "../../adapters/dialog";
import { useFile } from "../../hooks/useFile";
import { useMarkdown } from "../../hooks/useMarkdown";
import { exportAsHtml } from "../../utils/htmlExport";
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

export function Toolbar() {
  const { theme, setTheme, fontSize, setFontSize, currentFile, currentContent } =
    useAppStore();
  const { openFile } = useFile();
  const renderedHtml = useMarkdown(currentContent);

  async function handleOpenFile() {
    const path = await openFileDialog();
    if (path) openFile(path);
  }

  function handlePrint() {
    window.print();
  }

  async function handleExportHtml() {
    if (!currentFile) return;
    await exportAsHtml(renderedHtml, theme, fontSize, currentFile);
  }

  function cycleTheme() {
    const idx = themes.indexOf(theme);
    setTheme(themes[(idx + 1) % themes.length]);
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
      </div>

      {/* Centre: file name */}
      <div className="toolbar__title" aria-label="Current file">
        {fileLabel}
      </div>

      {/* Right group */}
      <div className="toolbar__group">
        {/* Font size */}
        <button
          className="toolbar__btn"
          onClick={() => setFontSize(Math.max(12, fontSize - 1))}
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
          onClick={() => setFontSize(Math.min(28, fontSize + 1))}
          type="button"
          aria-label="Increase font size"
          title="Increase font size"
          disabled={fontSize >= 28}
        >
          A<sup>+</sup>
        </button>

        <div className="toolbar__divider" role="separator" />

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

        <div className="toolbar__divider" role="separator" />

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
