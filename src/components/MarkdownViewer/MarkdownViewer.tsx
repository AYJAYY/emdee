import { useEffect, useRef } from "react";
import { useAppStore } from "../../store/appStore";
import { useMarkdown } from "../../hooks/useMarkdown";
import "../../styles/markdown.css";
import "./MarkdownViewer.css";

export function MarkdownViewer() {
  const { currentContent, fontSize } = useAppStore();
  const html = useMarkdown(currentContent);
  const contentRef = useRef<HTMLDivElement>(null);

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
    <div className="content-scroll" ref={contentRef} tabIndex={0} aria-label="Document content">
      <article
        className="md-body"
        style={{ "--md-font-size": `${fontSize}px` } as React.CSSProperties}
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: html }}
        aria-live="polite"
      />
    </div>
  );
}
