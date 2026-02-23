import { useMemo } from "react";
import MarkdownIt from "markdown-it";
import anchor from "markdown-it-anchor";
import hljs from "highlight.js";
import DOMPurify from "dompurify";
import { convertFileSrc } from "@tauri-apps/api/core";
import { isTauri } from "../adapters/fs";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function highlightCode(code: string, lang: string): string {
  if (lang && hljs.getLanguage(lang)) {
    try {
      return (
        `<pre class="hljs-block"><code class="hljs language-${lang}">` +
        hljs.highlight(code, { language: lang, ignoreIllegals: true }).value +
        "</code></pre>"
      );
    } catch {
      // fall through
    }
  }
  return (
    `<pre class="hljs-block"><code class="hljs">` +
    escapeHtml(code) +
    "</code></pre>"
  );
}

function resolvePath(dir: string, rel: string): string {
  if (rel.startsWith("/")) return rel;
  return dir.replace(/\\/g, "/").replace(/\/?$/, "/") + rel;
}

const md: MarkdownIt = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: highlightCode,
});

md.use(anchor, {
  permalink: anchor.permalink.linkInsideHeader({
    symbol: "#",
    placement: "after",
  }),
});

export function useMarkdown(content: string, filePath?: string | null): string {
  return useMemo(() => {
    if (!content) return "";
    let raw: string;
    try {
      // Strip YAML front matter (Jekyll, Hugo, Obsidian, GitHub wiki)
      const stripped = content.replace(/^---[\r\n][\s\S]*?[\r\n]---[\r\n]?/, "");
      raw = md.render(stripped);

      // Task list post-processing (no extra npm package)
      raw = raw
        .replace(/<li>\s*\[x\]\s*/gi,
          '<li class="task-list-item"><input type="checkbox" checked disabled aria-label="Completed task"> ')
        .replace(/<li>\s*\[ \]\s*/gi,
          '<li class="task-list-item"><input type="checkbox" disabled aria-label="Incomplete task"> ');

      // Wrap wide tables in a scrollable container
      raw = raw.replace(/<table>/g, '<div class="table-wrapper"><table>')
               .replace(/<\/table>/g, '</table></div>');

      // Resolve relative image paths in Tauri context
      if (filePath && isTauri()) {
        const dir = filePath.replace(/\\/g, "/").replace(/\/[^/]*$/, "");
        raw = raw.replace(/<img([^>]*)\ssrc="([^"]+)"([^>]*)>/gi, (match, before, src, after) => {
          if (/^(https?:|data:|#)/i.test(src)) return match;
          const resolved = resolvePath(dir, src);
          const tauriSrc = convertFileSrc(resolved);
          return `<img${before} src="${tauriSrc}"${after}>`;
        });
      }
    } catch {
      return `<pre style="white-space:pre-wrap;word-break:break-word">${escapeHtml(content)}</pre>`;
    }
    return DOMPurify.sanitize(raw, {
      // Allow id/class for heading anchors and syntax highlighting,
      // title for <abbr>, checked+disabled for task list checkboxes
      ADD_ATTR: ["id", "class", "href", "target", "title", "checked", "disabled"],
      ADD_TAGS: ["details", "summary", "kbd"],
    });
  }, [content, filePath]);
}
