import { useEffect } from "react";
import { useAppStore } from "../../store/appStore";
import { useMarkdown } from "../../hooks/useMarkdown";
import { FindBar } from "../FindBar/FindBar";
import "../../styles/markdown.css";
import "./MarkdownViewer.css";

interface MarkdownViewerProps {
  findOpen: boolean;
  onCloseFindBar: () => void;
  articleRef: React.RefObject<HTMLElement>;
  contentRef: React.RefObject<HTMLDivElement>;
}

export function MarkdownViewer({ findOpen, onCloseFindBar, articleRef, contentRef }: MarkdownViewerProps) {
  const { currentContent, fontSize } = useAppStore();
  const html = useMarkdown(currentContent);

  // Scroll to top when content changes
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0 });
    }
  }, [currentContent]);

  // Open external links in system browser
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const handleClick = async (e: MouseEvent) => {
      const target = (e.target as Element).closest("a");
      if (!target) return;
      const href = target.getAttribute("href");
      if (!href || href.startsWith("#")) return;
      if (href.startsWith("http://") || href.startsWith("https://")) {
        e.preventDefault();
        try {
          const { open } = await import("@tauri-apps/plugin-shell");
          open(href);
        } catch {
          window.open(href, "_blank", "noopener");
        }
      }
    };

    el.addEventListener("click", handleClick);
    return () => el.removeEventListener("click", handleClick);
  }, [html]);

  return (
    <div className="content-viewer">
      {findOpen && (
        <FindBar articleRef={articleRef} onClose={onCloseFindBar} />
      )}
      <div
        id="content-scroll"
        className="content-scroll"
        ref={contentRef}
        tabIndex={0}
        role="region"
        aria-label="Document content"
      >
        <article
          ref={articleRef}
          className="md-body"
          style={{ "--md-font-size": `${fontSize}px` } as React.CSSProperties}
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  );
}
