/**
 * File system adapter — abstracts Tauri fs APIs.
 * To migrate to a webapp: replace the Tauri invoke call with
 * the browser File System Access API or a backend fetch.
 */

declare global {
  interface Window {
    __TAURI_INTERNALS__?: unknown;
    Capacitor?: {
      isNativePlatform?: () => boolean;
      convertFileSrc?: (path: string) => string;
    };
  }
}

export const isTauri = (): boolean =>
  typeof window !== "undefined" && !!window.__TAURI_INTERNALS__;

export const isCapacitor = (): boolean =>
  typeof window !== "undefined" &&
  typeof window.Capacitor !== "undefined" &&
  typeof window.Capacitor.isNativePlatform === "function" &&
  !!window.Capacitor.isNativePlatform();

export async function readFile(path: string): Promise<string> {
  if (isTauri()) {
    const { invoke } = await import("@tauri-apps/api/core");
    return invoke<string>("read_file", { path });
  }
  if (isCapacitor()) {
    const { Filesystem, Encoding } = await import("@capacitor/filesystem");
    const result = await Filesystem.readFile({ path, encoding: Encoding.UTF8 });
    return result.data as string;
  }
  // Web fallback
  const res = await fetch(path);
  return res.text();
}
