import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useMarkdown } from "./useMarkdown";

describe("useMarkdown", () => {
  it("returns empty string for empty input", () => {
    const { result } = renderHook(() => useMarkdown(""));
    expect(result.current).toBe("");
  });

  it("renders a heading to <h1>", () => {
    const { result } = renderHook(() => useMarkdown("# Hello"));
    expect(result.current).toContain("<h1");
    expect(result.current).toContain("Hello");
  });

  it("renders bold text", () => {
    const { result } = renderHook(() => useMarkdown("**bold**"));
    expect(result.current).toContain("<strong>bold</strong>");
  });

  it("renders italic text", () => {
    const { result } = renderHook(() => useMarkdown("_italic_"));
    expect(result.current).toContain("<em>italic</em>");
  });

  it("renders inline code", () => {
    const { result } = renderHook(() => useMarkdown("`code`"));
    expect(result.current).toContain("<code>code</code>");
  });

  it("wraps fenced code blocks in .hljs-block", () => {
    const { result } = renderHook(() =>
      useMarkdown("```js\nconsole.log(1)\n```")
    );
    expect(result.current).toContain('class="hljs-block"');
  });

  it("renders unknown language as escaped code block", () => {
    const { result } = renderHook(() =>
      useMarkdown("```unknownlang\n<b>test</b>\n```")
    );
    expect(result.current).toContain('class="hljs-block"');
    // angle brackets must be escaped
    expect(result.current).toContain("&lt;b&gt;");
  });

  it("strips <script> tags (XSS)", () => {
    const { result } = renderHook(() =>
      useMarkdown("<script>alert(1)</script>")
    );
    expect(result.current).not.toContain("<script>");
  });

  it("blocks javascript: hrefs (XSS)", () => {
    const { result } = renderHook(() =>
      useMarkdown("[click](javascript:alert(1))")
    );
    // markdown-it refuses to render javascript: as a live href — no <a> element
    expect(result.current).not.toContain('href="javascript:');
  });
});
