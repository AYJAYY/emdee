import { useCallback } from "react";
import { listDirectory, readFile } from "../adapters/fs";
import { useAppStore } from "../store/appStore";

export function useFileTree() {
  const { setFileTree, setCurrentContent, setCurrentFile, setLoading, setError } =
    useAppStore();

  const loadFolder = useCallback(
    async (path: string) => {
      setLoading(true);
      try {
        const entries = await listDirectory(path);
        setFileTree(entries);
        useAppStore.getState().setCurrentFolder(path);
      } catch (e) {
        setError(`Could not read folder: ${e}`);
      } finally {
        setLoading(false);
      }
    },
    [setFileTree, setLoading, setError]
  );

  const openFile = useCallback(
    async (path: string) => {
      setLoading(true);
      try {
        const content = await readFile(path);
        setCurrentContent(content);
        setCurrentFile(path);
      } catch (e) {
        setError(`Could not read file: ${e}`);
      } finally {
        setLoading(false);
      }
    },
    [setCurrentContent, setCurrentFile, setLoading, setError]
  );

  return { loadFolder, openFile };
}
