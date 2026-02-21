import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "light" | "dark" | "sepia";

interface AppState {
  // File state (not persisted — always starts fresh)
  currentFile: string | null;
  currentContent: string;

  // UI state (persisted)
  theme: Theme;
  fontSize: number;

  // Transient state
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

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
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
    }),
    {
      name: "emdee-settings",
      // Only persist user preferences, not file state
      partialize: (state) => ({
        theme: state.theme,
        fontSize: state.fontSize,
      }),
    }
  )
);
