import { useEffect } from "react";
import { Toolbar } from "./components/Toolbar/Toolbar";
import { FileTree } from "./components/FileTree/FileTree";
import { MarkdownViewer } from "./components/MarkdownViewer/MarkdownViewer";
import { WelcomeScreen } from "./components/WelcomeScreen/WelcomeScreen";
import { useAppStore } from "./store/appStore";
import { openFileDialog, openFolderDialog } from "./adapters/dialog";
import { useFileTree } from "./hooks/useFileTree";
import { exportAsHtml } from "./utils/htmlExport";
import "./App.css";

export default function App() {
  const { theme, currentFile, sidebarOpen, fileTree } = useAppStore();
  const { openFile, loadFolder } = useFileTree();

  // Apply theme to html element
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

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
        case "k": {
          e.preventDefault();
          const path = await openFolderDialog();
          if (path) loadFolder(path);
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
            const { useMarkdown: _m } = await import("./hooks/useMarkdown");
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
  }, [openFile, loadFolder]);

  const showSidebar = sidebarOpen && fileTree.length > 0;

  return (
    <div className="app" data-theme={theme}>
      <Toolbar />
      <div className="layout" role="presentation">
        {showSidebar && <FileTree />}
        <div className="content-area" role="presentation">
          {currentFile ? <MarkdownViewer /> : <WelcomeScreen />}
        </div>
      </div>
    </div>
  );
}
