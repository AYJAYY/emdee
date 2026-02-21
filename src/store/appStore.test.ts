import { describe, it, expect, beforeEach } from "vitest";
import { useAppStore } from "./appStore";

// Reset store state before each test
beforeEach(() => {
  useAppStore.setState({
    currentFile: null,
    currentContent: "",
    theme: "light",
    fontSize: 17,
    isLoading: false,
    error: null,
  });
});

describe("appStore — initial state", () => {
  it("has correct initial values", () => {
    const state = useAppStore.getState();
    expect(state.currentFile).toBeNull();
    expect(state.currentContent).toBe("");
    expect(state.theme).toBe("light");
    expect(state.fontSize).toBe(17);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });
});

describe("appStore — actions", () => {
  it("setTheme updates theme", () => {
    useAppStore.getState().setTheme("dark");
    expect(useAppStore.getState().theme).toBe("dark");
  });

  it("setFontSize updates fontSize", () => {
    useAppStore.getState().setFontSize(20);
    expect(useAppStore.getState().fontSize).toBe(20);
  });

  it("setCurrentFile sets path and clears error", () => {
    useAppStore.setState({ error: "previous error" });
    useAppStore.getState().setCurrentFile("/path/to/file.md");
    const state = useAppStore.getState();
    expect(state.currentFile).toBe("/path/to/file.md");
    expect(state.error).toBeNull();
  });

  it("setError sets error message", () => {
    useAppStore.getState().setError("something went wrong");
    expect(useAppStore.getState().error).toBe("something went wrong");
  });

  it("setLoading toggles isLoading", () => {
    useAppStore.getState().setLoading(true);
    expect(useAppStore.getState().isLoading).toBe(true);
    useAppStore.getState().setLoading(false);
    expect(useAppStore.getState().isLoading).toBe(false);
  });
});

describe("appStore — persist partialize", () => {
  it("only persists theme and fontSize", () => {
    // Access the persist config via the store's internal api
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const persistApi = (useAppStore as any).persist;
    const partialize = persistApi?.getOptions?.()?.partialize;
    if (!partialize) {
      // If we can't reach partialize directly, verify via storage key contents
      const stored = JSON.parse(
        localStorage.getItem("emdee-settings") ?? "{}"
      );
      const stateKeys = Object.keys(stored.state ?? {});
      expect(stateKeys).toContain("theme");
      expect(stateKeys).toContain("fontSize");
      expect(stateKeys).not.toContain("currentFile");
      expect(stateKeys).not.toContain("currentContent");
      return;
    }
    const partial = partialize({
      currentFile: "/foo.md",
      currentContent: "# Hi",
      theme: "dark" as const,
      fontSize: 18,
      isLoading: false,
      error: null,
    });
    expect(partial).toEqual({ theme: "dark", fontSize: 18 });
    expect(partial).not.toHaveProperty("currentFile");
  });
});
