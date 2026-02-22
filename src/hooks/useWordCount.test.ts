import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useWordCount } from "./useWordCount";

describe("useWordCount", () => {
  it("returns null for empty string", () => {
    const { result } = renderHook(() => useWordCount(""));
    expect(result.current).toBeNull();
  });

  it("returns null for whitespace-only string", () => {
    const { result } = renderHook(() => useWordCount("   \n  "));
    expect(result.current).toBeNull();
  });

  it("counts words correctly", () => {
    const { result } = renderHook(() => useWordCount("hello world foo"));
    expect(result.current?.words).toBe(3);
  });

  it("counts words with extra whitespace", () => {
    const { result } = renderHook(() => useWordCount("  one  two   three  "));
    expect(result.current?.words).toBe(3);
  });

  it("calculates 1 minute for fewer than 200 words", () => {
    const content = Array(100).fill("word").join(" ");
    const { result } = renderHook(() => useWordCount(content));
    expect(result.current?.minutes).toBe(1);
  });

  it("calculates reading time correctly for 400 words", () => {
    const content = Array(400).fill("word").join(" ");
    const { result } = renderHook(() => useWordCount(content));
    expect(result.current?.minutes).toBe(2);
  });

  it("rounds reading time to nearest minute", () => {
    // 250 words → 250/200 = 1.25 → rounds to 1
    const content = Array(250).fill("word").join(" ");
    const { result } = renderHook(() => useWordCount(content));
    expect(result.current?.minutes).toBe(1);
  });

  it("rounds up at 0.5 threshold", () => {
    // 300 words → 300/200 = 1.5 → rounds to 2
    const content = Array(300).fill("word").join(" ");
    const { result } = renderHook(() => useWordCount(content));
    expect(result.current?.minutes).toBe(2);
  });
});
