import { useMemo } from "react";

export function useWordCount(content: string) {
  return useMemo(() => {
    if (!content.trim()) return null;
    const words = content.trim().split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.round(words / 200));
    return { words, minutes };
  }, [content]);
}
