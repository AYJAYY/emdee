import { openFileDialog } from "../../adapters/dialog";
import { useFile } from "../../hooks/useFile";
import { useAppStore } from "../../store/appStore";
import "./WelcomeScreen.css";

export function WelcomeScreen() {
  const { openFile } = useFile();
  const recentFiles = useAppStore((s) => s.recentFiles);

  async function handleOpenFile() {
    const path = await openFileDialog();
    if (path) openFile(path);
  }

  return (
    <div className="welcome" aria-label="Welcome screen">
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
        </div>

        <ul className="welcome__tips" aria-label="Keyboard shortcuts">
          <li><kbd>Ctrl+O</kbd> Open file</li>
          <li><kbd>Ctrl+F</kbd> Find in document</li>
          <li><kbd>Ctrl+P</kbd> Print / PDF</li>
          <li><kbd>Ctrl+E</kbd> Export HTML</li>
          <li><kbd>Ctrl+D</kbd> Toggle dark mode</li>
        </ul>

        {recentFiles.length > 0 && (
          <section aria-label="Recently opened files" className="welcome__recent-section">
            <p className="welcome__recent-heading">Recent Files</p>
            <ul className="welcome__recent">
              {recentFiles.map((p) => (
                <li key={p}>
                  <button onClick={() => openFile(p)} title={p} type="button">
                    {p.split(/[/\\]/).pop()}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
