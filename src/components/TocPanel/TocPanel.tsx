import { useToc } from "../../hooks/useToc";
import "./TocPanel.css";

interface TocPanelProps {
  isOpen: boolean;
  articleRef: React.RefObject<HTMLElement>;
  contentRef: React.RefObject<HTMLDivElement>;
  html: string;
}

export function TocPanel({ isOpen, articleRef, contentRef, html }: TocPanelProps) {
  const { entries, activeId } = useToc(articleRef, contentRef, html);

  function handleEntryClick(element: HTMLElement) {
    const container = contentRef.current;
    if (!container) return;

    const offset =
      element.getBoundingClientRect().top -
      container.getBoundingClientRect().top +
      container.scrollTop;

    container.scrollTo({ top: offset, behavior: "smooth" });

    // Focus the heading for keyboard users
    if (!element.hasAttribute("tabindex")) {
      element.setAttribute("tabindex", "-1");
    }
    element.focus({ preventScroll: true });
  }

  return (
    <nav
      id="toc-panel"
      className="toc-panel"
      aria-label="Table of contents"
      aria-hidden={!isOpen}
    >
      <p className="toc-panel__heading" aria-hidden="true">
        Contents
      </p>
      {entries.length === 0 ? (
        <p className="toc-panel__empty">No headings found</p>
      ) : (
        <ul className="toc-panel__list" role="list">
          {entries.map(({ id, text, level, element }) => (
            <li key={id}>
              <button
                className={`toc-panel__entry${activeId === id ? " toc-panel__entry--active" : ""}`}
                style={{ paddingLeft: `${14 + (level - 1) * 12}px` }}
                onClick={() => handleEntryClick(element)}
                aria-current={activeId === id ? "true" : undefined}
                type="button"
                tabIndex={isOpen ? 0 : -1}
              >
                {text}
              </button>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}
