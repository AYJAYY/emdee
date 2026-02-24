import { useEffect, useRef } from "react";
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
  const { currentContent, fontSize, currentFile } = useAppStore();
  const html = useMarkdown(currentContent, currentFile);
  const pinchRef = useRef<{ startDist: number; startSize: number } | null>(null);

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

  // Pinch-to-zoom adjusts font size
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    function getDistance(touches: TouchList): number {
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      return Math.sqrt(dx * dx + dy * dy);
    }

    function onTouchStart(e: TouchEvent) {
      if (e.touches.length === 2) {
        pinchRef.current = {
          startDist: getDistance(e.touches),
          startSize: useAppStore.getState().fontSize,
        };
      }
    }

    function onTouchMove(e: TouchEvent) {
      if (e.touches.length === 2 && pinchRef.current) {
        e.preventDefault();
        const ratio = getDistance(e.touches) / pinchRef.current.startDist;
        const next = Math.round(Math.min(28, Math.max(12, pinchRef.current.startSize * ratio)));
        useAppStore.getState().setFontSize(next);
      }
    }

    function onTouchEnd() {
      pinchRef.current = null;
    }

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd);
    el.addEventListener("touchcancel", onTouchEnd);
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [contentRef]);

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
