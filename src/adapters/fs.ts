/**
 * File system adapter — abstracts Tauri fs APIs.
 * To migrate to a webapp: replace the Tauri imports with
 * the browser File System Access API or a backend API call.
 */

export interface FileEntry {
  name: string;
  path: string;
  isDir: boolean;
  isMd: boolean;
}

declare global {
  interface Window {
    __TAURI_INTERNALS__?: unknown;
  }
}

export const isTauri = (): boolean =>
  typeof window !== "undefined" && !!window.__TAURI_INTERNALS__;

export async function readFile(path: string): Promise<string> {
  if (isTauri()) {
    const { invoke } = await import("@tauri-apps/api/core");
    return invoke<string>("read_file", { path });
  }
  // Web fallback
  const res = await fetch(path);
  return res.text();
}

export async function listDirectory(path: string): Promise<FileEntry[]> {
  if (isTauri()) {
    const { invoke } = await import("@tauri-apps/api/core");
    return invoke<FileEntry[]>("list_directory", { path });
  }
  return [];
}
