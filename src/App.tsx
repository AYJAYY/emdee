import { useEffect } from "react";
import { Toolbar } from "./components/Toolbar/Toolbar";
import { MarkdownViewer } from "./components/MarkdownViewer/MarkdownViewer";
import { WelcomeScreen } from "./components/WelcomeScreen/WelcomeScreen";
import { useAppStore } from "./store/appStore";
import { openFileDialog } from "./adapters/dialog";
import { useFile } from "./hooks/useFile";
import { exportAsHtml } from "./utils/htmlExport";
import "./App.css";

export default function App() {
  const { theme, currentFile } = useAppStore();
  const { openFile } = useFile();

  // Apply theme to html element
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

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
          const path = await openFileDialog();
          if (path) openFile(path);
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
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [openFile]);

  return (
    <div className="app" data-theme={theme}>
      <Toolbar />
      <div className="content-area" role="presentation">
        {currentFile ? <MarkdownViewer /> : <WelcomeScreen />}
      </div>
    </div>
  );
}
