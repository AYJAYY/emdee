import { useEffect, useRef, useState, useCallback } from "react";
import Mark from "mark.js";
import "./FindBar.css";

interface FindBarProps {
  articleRef: React.RefObject<HTMLElement | null>;
  onClose: () => void;
}

export function FindBar({ articleRef, onClose }: FindBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const markInstance = useRef<Mark | null>(null);
  const matchEls = useRef<HTMLElement[]>([]);
  const [query, setQuery] = useState("");
  const [current, setCurrent] = useState(0);
  const [total, setTotal] = useState(0);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Build / rebuild mark instance when articleRef is ready
  useEffect(() => {
    if (articleRef.current) {
      markInstance.current = new Mark(articleRef.current);
    }
    return () => {
      markInstance.current?.unmark();
    };
  }, [articleRef]);

  const highlight = useCallback((q: string) => {
    const mark = markInstance.current;
    if (!mark) return;
    mark.unmark({
      done: () => {
        if (!q.trim()) {
          matchEls.current = [];
          setTotal(0);
          setCurrent(0);
          return;
        }
        mark.mark(q, {
          separateWordSearch: false,
          done: (count) => {
            const els = Array.from(
              articleRef.current?.querySelectorAll("mark") ?? []
            ) as HTMLElement[];
            matchEls.current = els;
            setTotal(count);
            const idx = count > 0 ? 1 : 0;
            setCurrent(idx);
            if (els[0]) scrollToMatch(els[0], 0);
          },
        });
      },
    });
  }, [articleRef]);

  function scrollToMatch(el: HTMLElement, idx: number) {
    // Remove active class from all
    matchEls.current.forEach((m) => m.classList.remove("find-bar__mark--active"));
    el.classList.add("find-bar__mark--active");
    el.scrollIntoView({ block: "center", behavior: "smooth" });
    setCurrent(idx + 1);
  }

  function navigate(dir: 1 | -1) {
    const els = matchEls.current;
    if (!els.length) return;
    const nextIdx = ((current - 1 + dir + els.length) % els.length);
    scrollToMatch(els[nextIdx], nextIdx);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "Enter") {
      e.preventDefault();
      navigate(e.shiftKey ? -1 : 1);
    }
  }

  function handleQueryChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setQuery(val);
    highlight(val);
  }

  const statusText = query.trim()
    ? total === 0
      ? "No matches"
      : `${current} of ${total}`
    : "";

  return (
    <div className="find-bar" role="search" aria-label="Find in document">
      <input
        ref={inputRef}
        className="find-bar__input"
        type="search"
        placeholder="Find in document…"
        value={query}
        onChange={handleQueryChange}
        onKeyDown={handleKeyDown}
        aria-label="Search term"
      />
      <span className="find-bar__status" aria-live="polite" aria-atomic="true">
        {statusText}
      </span>
      <button
        className="find-bar__btn"
        type="button"
        onClick={() => navigate(-1)}
        aria-label="Previous match"
        disabled={total === 0}
        title="Previous match (Shift+Enter)"
      >
        ↑
      </button>
      <button
        className="find-bar__btn"
        type="button"
        onClick={() => navigate(1)}
        aria-label="Next match"
        disabled={total === 0}
        title="Next match (Enter)"
      >
        ↓
      </button>
      <button
        className="find-bar__btn find-bar__btn--close"
        type="button"
        onClick={onClose}
        aria-label="Close find bar"
        title="Close (Escape)"
      >
        ✕
      </button>
    </div>
  );
}
