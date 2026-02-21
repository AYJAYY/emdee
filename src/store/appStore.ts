import { create } from "zustand";

export type Theme = "light" | "dark" | "sepia";

interface AppState {
  // File state
  currentFile: string | null;
  currentContent: string;

  // UI state
  theme: Theme;
  fontSize: number;
  isLoading: boolean;
  error: string | null;

  // Actions
  setCurrentFile: (path: string | null) => void;
  setCurrentContent: (content: string) => void;
  setTheme: (theme: Theme) => void;
  setFontSize: (size: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentFile: null,
  currentContent: "",
  theme: "light",
  fontSize: 17,
  isLoading: false,
  error: null,

  setCurrentFile: (path) => set({ currentFile: path, error: null }),
  setCurrentContent: (content) => set({ currentContent: content }),
  setTheme: (theme) => set({ theme }),
  setFontSize: (size) => set({ fontSize: size }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}));
