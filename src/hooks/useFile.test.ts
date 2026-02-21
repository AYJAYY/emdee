import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFile } from "./useFile";
import { useAppStore } from "../store/appStore";

// Mock the fs adapter so tests don't need Tauri
vi.mock("../adapters/fs", () => ({
  readFile: vi.fn(),
  isTauri: () => false,
}));

import { readFile } from "../adapters/fs";
const mockReadFile = vi.mocked(readFile);

beforeEach(() => {
  vi.clearAllMocks();
  useAppStore.setState({
    currentFile: null,
    currentContent: "",
    theme: "light",
    fontSize: 17,
    isLoading: false,
    error: null,
  });
});

describe("useFile", () => {
  it("sets content and file path on successful load", async () => {
    mockReadFile.mockResolvedValue("# Hello");

    const { result } = renderHook(() => useFile());
    await act(async () => {
      await result.current.openFile("/path/to/doc.md");
    });

    const state = useAppStore.getState();
    expect(state.currentContent).toBe("# Hello");
    expect(state.currentFile).toBe("/path/to/doc.md");
    expect(state.error).toBeNull();
  });

  it("sets a clean error message on failure", async () => {
    mockReadFile.mockRejectedValue(new Error("Permission denied"));

    const { result } = renderHook(() => useFile());
    await act(async () => {
      await result.current.openFile("/path/to/doc.md");
    });

    const state = useAppStore.getState();
    expect(state.error).toBe("Could not read file: Permission denied");
    expect(state.currentContent).toBe("");
  });

  it("clears loading state after fetch", async () => {
    mockReadFile.mockResolvedValue("content");

    const { result } = renderHook(() => useFile());
    await act(async () => {
      await result.current.openFile("/path/to/doc.md");
    });

    expect(useAppStore.getState().isLoading).toBe(false);
  });
});
