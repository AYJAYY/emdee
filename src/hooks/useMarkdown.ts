import { useMemo } from "react";
import MarkdownIt from "markdown-it";
import anchor from "markdown-it-anchor";
import hljs from "highlight.js";
import DOMPurify from "dompurify";

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

export function useMarkdown(content: string): string {
  return useMemo(() => {
    if (!content) return "";
    let raw: string;
    try {
      raw = md.render(content);
    } catch {
      return "";
    }
    return DOMPurify.sanitize(raw, {
      // Allow id/class for heading anchors and syntax highlighting
      ADD_ATTR: ["id", "class", "href", "target"],
      // Allow <details>, <summary>, <kbd> etc.
      ADD_TAGS: ["details", "summary", "kbd"],
    });
  }, [content]);
}
