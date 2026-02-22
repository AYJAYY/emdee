import { useCallback } from "react";
import { readFile } from "../adapters/fs";
import { useAppStore } from "../store/appStore";
import { announce } from "../utils/announce";

export function useFile() {
  const { setCurrentContent, setCurrentFile, setLoading, setError, addRecentFile } =
    useAppStore();

  const openFile = useCallback(
    async (path: string) => {
      setLoading(true);
      announce("Loading file…");
      try {
        const content = await readFile(path);
        setCurrentContent(content);
        setCurrentFile(path);
        addRecentFile(path);
        const filename = path.split(/[/\\]/).pop() ?? path;
        announce(`Opened: ${filename}`);
        // Move focus to content area so keyboard users can start reading immediately
        requestAnimationFrame(() => {
          document.getElementById("content-scroll")?.focus();
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        setError(`Could not read file: ${msg}`);
      } finally {
        setLoading(false);
      }
    },
    [setCurrentContent, setCurrentFile, setLoading, setError, addRecentFile]
  );

  return { openFile };
}
