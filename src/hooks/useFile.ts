import { useCallback } from "react";
import { readFile } from "../adapters/fs";
import { useAppStore } from "../store/appStore";

export function useFile() {
  const { setCurrentContent, setCurrentFile, setLoading, setError } =
    useAppStore();

  const openFile = useCallback(
    async (path: string) => {
      setLoading(true);
      try {
        const content = await readFile(path);
        setCurrentContent(content);
        setCurrentFile(path);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        setError(`Could not read file: ${msg}`);
      } finally {
        setLoading(false);
      }
    },
    [setCurrentContent, setCurrentFile, setLoading, setError]
  );

  return { openFile };
}
