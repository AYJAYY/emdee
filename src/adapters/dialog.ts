/**
 * Dialog adapter — abstracts Tauri dialog APIs.
 * To migrate to a webapp: replace with <input type="file"> or
 * the browser showOpenFilePicker / showDirectoryPicker APIs.
 */

import { isTauri } from "./fs";

export async function openFileDialog(): Promise<string | null> {
  if (isTauri()) {
    const { open } = await import("@tauri-apps/plugin-dialog");
    const result = await open({
      multiple: false,
      filters: [{ name: "Markdown", extensions: ["md", "markdown", "txt"] }],
    });
    return typeof result === "string" ? result : null;
  }
  return null;
}

export async function openFolderDialog(): Promise<string | null> {
  if (isTauri()) {
    const { open } = await import("@tauri-apps/plugin-dialog");
    const result = await open({ directory: true, multiple: false });
    return typeof result === "string" ? result : null;
  }
  return null;
}

export async function saveFileDialog(
  defaultName: string,
  extension: string,
  label: string
): Promise<string | null> {
  if (isTauri()) {
    const { save } = await import("@tauri-apps/plugin-dialog");
    const result = await save({
      defaultPath: defaultName,
      filters: [{ name: label, extensions: [extension] }],
    });
    return result ?? null;
  }
  return null;
}
