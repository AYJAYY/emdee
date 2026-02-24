/**
 * Dialog adapter — abstracts Tauri dialog APIs.
 * To migrate to a webapp: replace with <input type="file"> or
 * the browser showOpenFilePicker / showSaveFilePicker APIs.
 */

import { isTauri, isCapacitor } from "./fs";

export async function openFileDialog(): Promise<string | null> {
  if (isTauri()) {
    const { open } = await import("@tauri-apps/plugin-dialog");
    const result = await open({
      multiple: false,
      filters: [{ name: "Markdown", extensions: ["md", "markdown", "txt"] }],
    });
    return typeof result === "string" ? result : null;
  }
  if (isCapacitor()) {
    const { FilePicker } = await import("@capawesome/capacitor-file-picker");
    const result = await FilePicker.pickFiles({
      types: ["text/markdown", "text/plain"],
      limit: 1,
      readData: false,
    });
    if (result.files.length > 0 && result.files[0].path) {
      return result.files[0].path;
    }
    return null;
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
