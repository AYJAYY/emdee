import { create } from "zustand";
import type { FileEntry } from "../adapters/fs";

export type Theme = "light" | "dark" | "sepia";

interface AppState {
  // File state
  currentFile: string | null;
  currentContent: string;
  currentFolder: string | null;
  fileTree: FileEntry[];

  // UI state
  theme: Theme;
  sidebarOpen: boolean;
  fontSize: number;
  isLoading: boolean;
  error: string | null;

  // Actions
  setCurrentFile: (path: string | null) => void;
  setCurrentContent: (content: string) => void;
  setCurrentFolder: (path: string | null) => void;
  setFileTree: (tree: FileEntry[]) => void;
  setTheme: (theme: Theme) => void;
  toggleSidebar: () => void;
  setFontSize: (size: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentFile: null,
  currentContent: "",
  currentFolder: null,
  fileTree: [],
  theme: "light",
  sidebarOpen: true,
  fontSize: 17,
  isLoading: false,
  error: null,

  setCurrentFile: (path) => set({ currentFile: path, error: null }),
  setCurrentContent: (content) => set({ currentContent: content }),
  setCurrentFolder: (path) => set({ currentFolder: path }),
  setFileTree: (tree) => set({ fileTree: tree }),
  setTheme: (theme) => set({ theme }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setFontSize: (size) => set({ fontSize: size }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}));
