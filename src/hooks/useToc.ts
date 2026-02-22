import { useEffect, useRef, useState } from "react";

export interface TocEntry {
  id: string;
  text: string;
  level: number;
  element: HTMLElement;
}

export function useToc(
  articleRef: React.RefObject<HTMLElement>,
  contentRef: React.RefObject<HTMLDivElement>,
  html: string
): { entries: TocEntry[]; activeId: string } {
  const [entries, setEntries] = useState<TocEntry[]>([]);
  const [activeId, setActiveId] = useState("");
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Extract headings from rendered article when html changes
  useEffect(() => {
    const article = articleRef.current;
    if (!article) return;

    // Allow DOM to update before querying
    const frame = requestAnimationFrame(() => {
      const headings = Array.from(
        article.querySelectorAll<HTMLElement>("h1, h2, h3, h4")
      ).filter((el) => el.id);

      const extracted: TocEntry[] = headings.map((el) => ({
        id: el.id,
        // Strip trailing anchor "#" added by markdown-it-anchor
        text: el.textContent?.replace(/\s*#\s*$/, "").trim() ?? "",
        level: parseInt(el.tagName[1], 10),
        element: el,
      }));

      setEntries(extracted);
      setActiveId(extracted[0]?.id ?? "");
    });

    return () => cancelAnimationFrame(frame);
  }, [html, articleRef]);

  // Observe headings for active tracking
  useEffect(() => {
    const scrollRoot = contentRef.current;
    if (!scrollRoot || entries.length === 0) return;

    observerRef.current?.disconnect();

    const observer = new IntersectionObserver(
      (records) => {
        // Find the topmost intersecting heading
        const visible = records
          .filter((r) => r.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        root: scrollRoot,
        rootMargin: "-10% 0px -80% 0px",
      }
    );

    entries.forEach(({ element }) => observer.observe(element));
    observerRef.current = observer;

    return () => observer.disconnect();
  }, [entries, contentRef]);

  return { entries, activeId };
}
