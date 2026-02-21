import { useMemo } from "react";
import MarkdownIt from "markdown-it";
import anchor from "markdown-it-anchor";
import hljs from "highlight.js";

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
    MarkdownIt().utils.escapeHtml(code) +
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
    return md.render(content);
  }, [content]);
}
