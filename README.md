# EmDee

A beautiful, fast Markdown viewer for Windows. Built with Tauri + React + TypeScript.

## Features

- Beautiful typography — comfortable reading at any length
- GitHub Flavored Markdown with code syntax highlighting
- Three themes: Light, Dark, Sepia — auto-detected from your OS
- Find in document with highlighted matches (`Ctrl+F`)
- Word count and reading time in the toolbar
- Recently opened files on the welcome screen
- Adjustable font size
- Export to HTML or PDF
- Keyboard shortcuts for everything
## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl+O` | Open file |
| `Ctrl+F` | Find in document |
| `Ctrl+D` | Toggle dark mode |
| `Ctrl+P` | Print / PDF |
| `Ctrl+E` | Export as HTML |

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
├── adapters/       # Tauri API abstraction layer
├── components/     # React UI components
├── hooks/          # useMarkdown, useFile, useWordCount
├── store/          # Zustand global state
├── styles/         # Themes, markdown typography, print CSS
└── utils/          # announce, htmlExport
src-tauri/
└── src/lib.rs      # Rust: read_file command
```
