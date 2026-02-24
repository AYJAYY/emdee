# EmDee

<img src="docs/logo.png" alt="EmDee" width="110" />

A fast, beautiful Markdown viewer for Windows, Linux, and Android.

[![License](https://img.shields.io/badge/license-MIT-6C63FF?style=flat-square)](LICENSE)
[![Windows](https://img.shields.io/badge/Windows-0078D4?style=flat-square&logo=windows&logoColor=white)](https://github.com/AYJAYY/emdee/releases/latest)
[![Linux](https://img.shields.io/badge/Linux-FCC624?style=flat-square&logo=linux&logoColor=black)](https://github.com/AYJAYY/emdee/releases/latest)
[![Android](https://img.shields.io/badge/Android-3DDC84?style=flat-square&logo=android&logoColor=white)](https://github.com/AYJAYY/emdee/releases/latest)

---

## Install

**Windows**

```
winget install AYJAYY.EmDee
```

Or download the `.exe` from the [latest release](https://github.com/AYJAYY/emdee/releases/latest). Windows may show a SmartScreen prompt on first run — click **More info → Run anyway**.

**Linux — Debian / Ubuntu**

```bash
sudo dpkg -i EmDee_<version>_amd64.deb
```

**Linux — RPM (Fedora, openSUSE)**

```bash
sudo rpm -i EmDee-<version>-1.x86_64.rpm
```

**Linux — AppImage (universal)**

```bash
chmod +x EmDee_<version>_amd64.AppImage && ./EmDee_<version>_amd64.AppImage
```

**Android**

Download the `.apk` from the [latest release](https://github.com/AYJAYY/emdee/releases/latest). Enable **Install from unknown sources** in your device settings, then open the APK.

---

## Features

- **Beautiful typography** — comfortable reading at any document length
- **GitHub Flavored Markdown** — tables, task lists, code highlighting, KaTeX math
- **Three themes** — Light, Dark, Sepia — auto-detected from your OS
- **Table of contents** — jump-to-section panel with one keystroke
- **Find in document** — highlighted matches with Prev / Next navigation
- **Word count & reading time** — shown in the toolbar
- **Recent files** — quickly reopen documents from the welcome screen
- **Adjustable font size** — toolbar buttons on desktop, pinch-to-zoom on Android
- **Export** — save as HTML or print to PDF
- **File associations** — set EmDee as your default `.md` viewer
- **Keyboard shortcuts** — full keyboard control on desktop
- **Fully offline** — no accounts, no telemetry, no tracking

---

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl+O` | Open file |
| `Ctrl+F` | Find in document |
| `Ctrl+\` | Toggle table of contents |
| `Ctrl+D` | Toggle dark mode |
| `Ctrl+P` | Print / PDF |
| `Ctrl+E` | Export as HTML |

---

## Development

**System dependencies (Linux, one-time):**

```bash
sudo apt-get install -y pkg-config libwebkit2gtk-4.1-dev libgtk-3-dev \
  libayatana-appindicator3-dev librsvg2-dev libssl-dev build-essential
```

**Rust (one-time):**

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

**Run in dev mode:**

```bash
npm run tauri dev
```

**Build for production:**

```bash
# Linux (.deb, .rpm, .AppImage)
npm run tauri build

# Windows installer (cross-compiled from Linux)
npm run tauri build -- --target x86_64-pc-windows-gnu
```

**Build for Android:**

```bash
npm run build
npx cap sync android
npx cap open android   # then sign and export from Android Studio
```

---

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
flatpak/            # Flatpak / Flathub distribution files
winget-pkgs/        # Winget package manifests
docs/               # Project website (GitHub Pages)
```

---

Built with [Tauri](https://tauri.app) · [Capacitor](https://capacitorjs.com) · [React](https://react.dev)
