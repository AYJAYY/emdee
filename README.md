# EmDee

A beautiful, fast Markdown viewer for Windows and Linux. Built with Tauri + React + TypeScript.

## Features

- Beautiful typography — comfortable reading at any length
- GitHub Flavored Markdown with code syntax highlighting
- Folder tree sidebar — browse a directory of `.md` files like a vault
- Three themes: Light, Dark, Sepia
- Adjustable font size
- Export to PDF via system print dialog
- Keyboard shortcuts for everything
- Webapp-ready architecture (see `src/adapters/`)

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl+O` | Open file |
| `Ctrl+K` | Open folder |
| `Ctrl+D` | Toggle dark mode |
| `Ctrl+P` | Export to PDF |

## Development

### Prerequisites

**Linux system deps (one-time):**
```bash
sudo apt-get install -y pkg-config libwebkit2gtk-4.1-dev libgtk-3-dev \
  libayatana-appindicator3-dev librsvg2-dev libssl-dev build-essential
```

**Rust (one-time):**
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

### Run in dev mode
```bash
npm run tauri dev
```

### Build for production
```bash
npm run tauri build
```

## Project Structure

```
src/
├── adapters/       # Tauri ↔ Web API abstraction layer (swap here for webapp)
├── components/     # React UI components
├── hooks/          # useMarkdown, useFileTree
├── store/          # Zustand global state
└── styles/         # Themes, markdown typography, print CSS
src-tauri/
└── src/lib.rs      # Rust: read_file, list_directory commands
```

## Migrating to a Webapp

Only `src/adapters/fs.ts` and `src/adapters/dialog.ts` reference Tauri APIs.
Replace them with the browser [File System Access API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API) and everything else works unchanged.
