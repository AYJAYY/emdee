import { saveFileDialog } from "../adapters/dialog";
import { isTauri } from "../adapters/fs";

/**
 * Collects all CSS rules from the page's loaded stylesheets.
 * This captures themes, markdown typography, and hljs colours.
 */
function collectPageCss(): string {
  const parts: string[] = [];
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      const rules = Array.from(sheet.cssRules ?? []);
      parts.push(rules.map((r) => r.cssText).join("\n"));
    } catch {
      // Cross-origin sheets (e.g. Google Fonts @import) — skip
    }
  }
  return parts.join("\n");
}

export function buildHtml(
  renderedHtml: string,
  theme: string,
  fontSize: number,
  title: string
): string {
  const css = collectPageCss();
  return `<!DOCTYPE html>
<html lang="en" data-theme="${theme}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    ${css}
    /* Export overrides */
    body { overflow: auto; background: var(--bg-content); }
    .md-body { padding: 48px 64px 80px; }
  </style>
</head>
<body>
  <article
    class="md-body"
    style="--md-font-size: ${fontSize}px"
  >
    ${renderedHtml}
  </article>
</body>
</html>`;
}

export async function exportAsHtml(
  renderedHtml: string,
  theme: string,
  fontSize: number,
  sourceFilePath: string
): Promise<"saved" | "cancelled" | "error"> {
  const baseName = sourceFilePath.split(/[/\\]/).pop()?.replace(/\.(md|markdown|txt)$/i, "") ?? "document";
  const defaultName = `${baseName}.html`;
  const title = baseName;

  try {
    if (isTauri()) {
      const savePath = await saveFileDialog(defaultName, "html", "HTML file");
      if (!savePath) return "cancelled";

      const html = buildHtml(renderedHtml, theme, fontSize, title);
      const { writeTextFile } = await import("@tauri-apps/plugin-fs");
      await writeTextFile(savePath, html);
      return "saved";
    } else {
      // Web fallback: trigger a download
      const html = buildHtml(renderedHtml, theme, fontSize, title);
      const blob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = defaultName;
      a.click();
      URL.revokeObjectURL(url);
      return "saved";
    }
  } catch {
    return "error";
  }
}
