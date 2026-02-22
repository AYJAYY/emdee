import { useEffect, useRef, useState } from "react";
import { Toolbar } from "./components/Toolbar/Toolbar";
import { MarkdownViewer } from "./components/MarkdownViewer/MarkdownViewer";
import { TocPanel } from "./components/TocPanel/TocPanel";
import { WelcomeScreen } from "./components/WelcomeScreen/WelcomeScreen";
import { useAppStore } from "./store/appStore";
import { openFileDialog } from "./adapters/dialog";
import { useFile } from "./hooks/useFile";
import { useMarkdown } from "./hooks/useMarkdown";
import { exportAsHtml } from "./utils/htmlExport";
import { announce } from "./utils/announce";
import "./App.css";

export default function App() {
  const { theme, currentFile, currentContent, error, setError, setTheme, tocOpen, setTocOpen } = useAppStore();
  const { openFile } = useFile();
  const [findOpen, setFindOpen] = useState(false);
  const articleRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const html = useMarkdown(currentContent);

  // Apply theme to html element
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Auto-detect OS theme on first launch (no stored preference yet)
  useEffect(() => {
    const stored = localStorage.getItem("emdee-settings");
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    if (!stored) {
      if (mq.matches) setTheme("dark");
    }
    const listener = (e: MediaQueryListEvent) => {
      // Only auto-switch if the user hasn't saved a preference yet
      if (!localStorage.getItem("emdee-settings")) {
        setTheme(e.matches ? "dark" : "light");
      }
    };
    mq.addEventListener("change", listener);
    return () => mq.removeEventListener("change", listener);
  }, [setTheme]);

  // Open file passed as CLI argument (e.g. double-clicked .md file on Windows)
  useEffect(() => {
    async function checkInitialFile() {
      if (!window.__TAURI_INTERNALS__) return;
      try {
        const { invoke } = await import("@tauri-apps/api/core");
        const path = await invoke<string | null>("get_initial_file");
        if (path) openFile(path);
      } catch {
        // not in Tauri context or no initial file
      }
    }
    checkInitialFile();
  }, [openFile]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handler = async (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;
      if (!ctrl) return;

      switch (e.key.toLowerCase()) {
        case "o": {
          e.preventDefault();
          try {
            const path = await openFileDialog();
            if (path) openFile(path);
          } catch {
            // dialog dismissed or error — ignore
          }
          break;
        }
        case "f": {
          e.preventDefault();
          if (useAppStore.getState().currentFile) {
            setFindOpen((prev) => !prev);
          }
          break;
        }
        case "d": {
          e.preventDefault();
          const cur = useAppStore.getState().theme;
          useAppStore.getState().setTheme(cur === "dark" ? "light" : "dark");
          break;
        }
        case "p": {
          e.preventDefault();
          if (useAppStore.getState().currentFile) window.print();
          break;
        }
        case "e": {
          e.preventDefault();
          const state = useAppStore.getState();
          if (state.currentFile) {
            await exportAsHtml(
              document.querySelector(".md-body")?.innerHTML ?? "",
              state.theme,
              state.fontSize,
              state.currentFile
            );
          }
          break;
        }
        case "\\": {
          e.preventDefault();
          const state = useAppStore.getState();
          if (state.currentFile) {
            const next = !state.tocOpen;
            state.setTocOpen(next);
            announce(next ? "Table of contents opened" : "Table of contents closed");
          }
          break;
        }
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [openFile]);

  // Close find bar when file changes
  useEffect(() => {
    setFindOpen(false);
  }, [currentFile]);

  function renderContent() {
    if (error) {
      return (
        <div className="error-state" role="alert">
          <div className="error-state__icon" aria-hidden="true">⚠</div>
          <p className="error-state__message">{error}</p>
          <button
            className="error-state__dismiss"
            onClick={() => setError(null)}
            type="button"
          >
            Dismiss
          </button>
        </div>
      );
    }
    if (currentFile) {
      return (
        <MarkdownViewer
          findOpen={findOpen}
          onCloseFindBar={() => setFindOpen(false)}
          articleRef={articleRef}
          contentRef={contentRef}
        />
      );
    }
    return <WelcomeScreen />;
  }

  return (
    <div className="app" data-theme={theme}>
      {/* Screen reader live region for dynamic announcements */}
      <div
        id="sr-announcer"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />
      <Toolbar
        tocOpen={tocOpen}
        onToggleToc={() => {
          const next = !useAppStore.getState().tocOpen;
          setTocOpen(next);
          announce(next ? "Table of contents opened" : "Table of contents closed");
        }}
      />
      <main className="content-area" id="main-content">
        {currentFile && (
          <TocPanel
            isOpen={tocOpen}
            articleRef={articleRef}
            contentRef={contentRef}
            html={html}
          />
        )}
        {renderContent()}
      </main>
    </div>
  );
}
