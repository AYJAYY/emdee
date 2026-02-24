import { useMemo, useState, useEffect } from "react";
import MarkdownIt from "markdown-it";
import anchor from "markdown-it-anchor";
import taskLists from "markdown-it-task-lists";
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

/**
 * Apply standard plugins and security hardening to a MarkdownIt instance.
 * Centralised here so both the base instance and the lazy KaTeX instance
 * share identical behaviour.
 */
function configureInstance(instance: MarkdownIt): MarkdownIt {
  // GFM: heading anchors
  instance.use(anchor, {
    permalink: anchor.permalink.linkInsideHeader({
      symbol: "#",
      placement: "after",
    }),
  });

  // GFM: task lists — parser-level, handles `[ ]` / `[x]` / `[X]`
  instance.use(taskLists, { enabled: false });

  // Security: add rel="noopener noreferrer" + target="_blank" to all
  // external links to prevent tab-napping and opener access.
  const defaultLinkOpen =
    instance.renderer.rules.link_open ??
    ((tokens, idx, options, _env, self) =>
      self.renderToken(tokens, idx, options));

  instance.renderer.rules.link_open = (tokens, idx, options, env, self) => {
    const href = tokens[idx].attrGet("href") ?? "";
    if (/^https?:\/\//i.test(href)) {
      tokens[idx].attrSet("target", "_blank");
      tokens[idx].attrSet("rel", "noopener noreferrer");
    }
    return defaultLinkOpen(tokens, idx, options, env, self);
  };

  return instance;
}

const md: MarkdownIt = configureInstance(
  new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    highlight: highlightCode,
  })
);

// Lazy KaTeX-enabled md instance — created once on first use
let mdKatex: MarkdownIt | null = null;
let mdKatexLoading: Promise<MarkdownIt> | null = null;

async function loadKatex(): Promise<MarkdownIt> {
  if (mdKatex) return mdKatex;
  if (mdKatexLoading) return mdKatexLoading;

  mdKatexLoading = import("@traptitech/markdown-it-katex").then(
    ({ default: markdownItKatex }) => {
      const instance = configureInstance(
        new MarkdownIt({
          html: true,
          linkify: true,
          typographer: true,
          highlight: highlightCode,
        })
      );
      instance.use(markdownItKatex, { throwOnError: false });
      mdKatex = instance;
      return instance;
    }
  );
  return mdKatexLoading;
}

function hasMath(content: string): boolean {
  return content.includes("$");
}

export function useMarkdown(content: string, filePath?: string | null): string {
  const [mathReady, setMathReady] = useState(false);

  // Lazy-load KaTeX when the file contains math notation
  useEffect(() => {
    if (!hasMath(content) || mathReady) return;
    loadKatex().then(() => setMathReady(true));
  }, [content, mathReady]);

  return useMemo(() => {
    if (!content) return "";
    const renderer = mathReady && mdKatex ? mdKatex : md;
    let raw: string;
    try {
      // Strip YAML front matter (Jekyll, Hugo, Obsidian, GitHub wiki)
      const stripped = content.replace(/^---[\r\n][\s\S]*?[\r\n]---[\r\n]?/, "");
      raw = renderer.render(stripped);

      // Wrap wide tables in a scrollable container
      raw = raw.replace(/<table>/g, '<div class="table-wrapper"><table>')
               .replace(/<\/table>/g, '</table></div>');

      // Resolve relative image paths to platform-accessible URLs
      if (filePath && (isTauri() || isCapacitor())) {
        const dir = filePath.replace(/\\/g, "/").replace(/\/[^/]*$/, "");
        raw = raw.replace(/<img([^>]*)\ssrc="([^"]+)"([^>]*)>/gi, (match, before, src, after) => {
          if (/^(https?:|data:|#)/i.test(src)) return match;
          const resolved = resolvePath(dir, src);
          const localSrc = isTauri()
            ? convertFileSrc(resolved)
            : window.Capacitor?.convertFileSrc?.(resolved) ?? null;
          if (!localSrc) return match;
          return `<img${before} src="${localSrc}"${after}>`;
        });
      }
    } catch {
      return `<pre style="white-space:pre-wrap;word-break:break-word">${escapeHtml(content)}</pre>`;
    }

    // Security: sanitize all HTML to block XSS.
    // markdown-it's html:true passes raw HTML from the source file through —
    // DOMPurify strips <script>, event handlers, javascript: URLs, and other
    // attack vectors while preserving the safe markup needed for rendering.
    return DOMPurify.sanitize(raw, {
      // id/class: heading anchors, hljs, task-list-item, katex-*
      // href/target/rel: links (rel set by our renderer for external links)
      // title: <abbr> tooltips
      // checked/disabled: task-list checkboxes
      // style: KaTeX uses inline styles for glyph sizing and spacing
      ADD_ATTR: ["id", "class", "href", "target", "rel", "title", "checked", "disabled", "style"],
      ADD_TAGS: ["details", "summary", "kbd"],
      // Allow asset:// (Tauri local file protocol) and http://localhost
      // (Capacitor local file protocol) in addition to the defaults.
      ALLOWED_URI_REGEXP:
        /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|asset):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    });
  }, [content, filePath, mathReady]);
}
