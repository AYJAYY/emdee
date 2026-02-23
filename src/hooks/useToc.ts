import { useEffect, useState } from "react";

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

  // Track active heading by scroll position
  useEffect(() => {
    const scrollRoot = contentRef.current;
    if (!scrollRoot || entries.length === 0) return;

    function update() {
      // Threshold: 120px below the top of the scroll container.
      // A heading is "active" once it has scrolled past this point.
      const threshold = scrollRoot!.getBoundingClientRect().top + 120;

      let active = entries[0];
      for (const entry of entries) {
        if (entry.element.getBoundingClientRect().top <= threshold) {
          active = entry;
        }
      }
      setActiveId(active.id);
    }

    scrollRoot.addEventListener("scroll", update, { passive: true });
    update(); // set correct entry on mount / file change

    return () => scrollRoot.removeEventListener("scroll", update);
  }, [entries, contentRef]);

  return { entries, activeId };
}
