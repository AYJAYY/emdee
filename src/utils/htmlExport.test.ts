import { describe, it, expect, vi } from "vitest";
import { buildHtml } from "./htmlExport";

// collectPageCss reads document.styleSheets — mock it to return empty
vi.stubGlobal("document", {
  styleSheets: [],
});

describe("buildHtml", () => {
  it("returns valid HTML containing data-theme attribute", () => {
    const html = buildHtml("<p>Hello</p>", "dark", 16, "Test");
    expect(html).toContain('data-theme="dark"');
    expect(html).toContain("<!DOCTYPE html>");
  });

  it("includes fontSize in the article style", () => {
    const html = buildHtml("<p>x</p>", "light", 20, "Doc");
    expect(html).toContain("--md-font-size: 20px");
  });

  it("does NOT include Google Fonts CDN link", () => {
    const html = buildHtml("<p>x</p>", "light", 16, "Doc");
    expect(html).not.toContain("fonts.googleapis.com");
  });

  it("includes the rendered HTML content", () => {
    const html = buildHtml("<h1>Title</h1>", "sepia", 17, "My Doc");
    expect(html).toContain("<h1>Title</h1>");
  });
});

describe("filename extraction (via exportAsHtml path splitting)", () => {
  // Test the inline logic used in exportAsHtml directly
  function extractBaseName(filePath: string): string {
    return (
      filePath.split(/[/\\]/).pop()?.replace(/\.(md|markdown|txt)$/i, "") ??
      "document"
    );
  }

  it("extracts base name from simple filename", () => {
    expect(extractBaseName("notes.md")).toBe("notes");
  });

  it("extracts base name from Windows path", () => {
    expect(extractBaseName("C:\\Users\\foo\\bar.md")).toBe("bar");
  });

  it("extracts base name from Unix path", () => {
    expect(extractBaseName("/home/user/README.markdown")).toBe("README");
  });

  it("keeps name unchanged when no recognised extension", () => {
    expect(extractBaseName("myfile")).toBe("myfile");
  });
});
