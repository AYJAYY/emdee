# EmDee

A beautiful, fast Markdown viewer for Windows, Linux, and Android. Built with Tauri + React + TypeScript (desktop) and Capacitor (Android).

## Installation

**Windows** — Download the `.exe` installer from the [latest release](https://github.com/AYJAYY/emdee/releases/latest). Windows may show a SmartScreen prompt on first run — click **More info → Run anyway**.

```
winget install AYJAYY.EmDee
```

**Linux (Debian/Ubuntu)** — Download the `.deb` package from the [latest release](https://github.com/AYJAYY/emdee/releases/latest).

```bash
sudo dpkg -i EmDee_<version>_amd64.deb
```

**Linux (universal)** — Download the `.AppImage` from the [latest release](https://github.com/AYJAYY/emdee/releases/latest).

```bash
chmod +x EmDee_<version>_amd64.AppImage && ./EmDee_<version>_amd64.AppImage
```

**Android** — Download the `.apk` from the [latest release](https://github.com/AYJAYY/emdee/releases/latest). Enable "Install from unknown sources" in your device settings, then open the APK to install. A Play Store release is in progress.

## Features

- Beautiful typography — comfortable reading at any length
- GitHub Flavored Markdown with code syntax highlighting and KaTeX math
- Three themes: Light, Dark, Sepia — auto-detected from your OS
- Table of contents panel with jump-to-section navigation
- Find in document with highlighted matches and Prev/Next navigation
- Word count and estimated reading time in the toolbar
- Recently opened files on the welcome screen
- Adjustable font size (desktop buttons or Android pinch-to-zoom)
- Export to HTML or PDF
- File associations — set EmDee as your default `.md` viewer
- Keyboard shortcuts for everything (desktop)
- Fully offline — no accounts, no telemetry, no tracking

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl+O` | Open file |
| `Ctrl+F` | Find in document |
| `Ctrl+\` | Toggle table of contents |
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

### Build for production (desktop)
```bash
# Linux
npm run tauri build

# Windows installer (cross-compiled from Linux)
npm run tauri build -- --target x86_64-pc-windows-gnu
```

### Build for Android

Prerequisites: Android Studio, Android SDK, Java 17+, Node 20+.

```bash
# Build web assets
npm run build

# Sync to Android project
npx cap sync android

# Open in Android Studio to build APK/AAB
npx cap open android
```

## Project Structure

```
src/
├── adapters/       # Platform abstraction (Tauri / Capacitor / web)
├── components/     # React UI components
├── hooks/          # useMarkdown, useFile, useWordCount
├── store/          # Zustand global state
├── styles/         # Themes, markdown typography, print CSS
└── utils/          # announce, htmlExport
src-tauri/
└── src/lib.rs      # Rust: read_file, get_initial_file commands
android/            # Capacitor Android project
winget/             # Winget package manifests
docs/               # Project website (GitHub Pages)
```
