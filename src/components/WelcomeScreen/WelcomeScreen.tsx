import { openFolderDialog } from "../../adapters/dialog";
import { useFileTree } from "../../hooks/useFileTree";
import { useAppStore } from "../../store/appStore";
import "./WelcomeScreen.css";

export function WelcomeScreen() {
  const { openFile, loadFolder } = useFileTree();
  const setCurrentFolder = useAppStore((s) => s.setCurrentFolder);

  async function handleOpenFile() {
    const { openFileDialog } = await import("../../adapters/dialog");
    const path = await openFileDialog();
    if (path) openFile(path);
  }

  async function handleOpenFolder() {
    const path = await openFolderDialog();
    if (path) {
      setCurrentFolder(path);
      loadFolder(path);
    }
  }

  return (
    <main className="welcome" role="main" aria-label="Welcome screen">
      <div className="welcome__inner">
        <div className="welcome__logo" aria-hidden="true">
          <span className="welcome__logo-em">Em</span>
          <span className="welcome__logo-dee">Dee</span>
        </div>
        <p className="welcome__tagline">
          Beautiful markdown, beautifully simple.
        </p>

        <div className="welcome__actions">
          <button
            className="welcome__btn welcome__btn--primary"
            onClick={handleOpenFile}
            type="button"
          >
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
            </svg>
            Open File
          </button>

          <button
            className="welcome__btn welcome__btn--secondary"
            onClick={handleOpenFolder}
            type="button"
          >
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
            </svg>
            Open Folder
          </button>
        </div>

        <ul className="welcome__tips" aria-label="Keyboard shortcuts">
          <li><kbd>Ctrl+O</kbd> Open file</li>
          <li><kbd>Ctrl+K</kbd> Open folder</li>
          <li><kbd>Ctrl+P</kbd> Export to PDF</li>
          <li><kbd>Ctrl+D</kbd> Toggle dark mode</li>
        </ul>
      </div>
    </main>
  );
}
