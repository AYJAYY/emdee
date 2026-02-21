# EmDee Rendering Test Suite

A comprehensive stress-test for the EmDee markdown viewer. This document exercises every supported feature.

---

## 1. Typography & Inline Formatting

Regular paragraph with **bold text**, *italic text*, ***bold and italic***, ~~strikethrough~~, and `inline code`. You can also combine **bold with `inline code`** or *italic with `inline code`*.

This is a paragraph with a [hyperlink to GitHub](https://github.com) and another [link with a title](https://example.com "Example Domain").

Here's some text with a line break  
achieved with two trailing spaces.

> "The best markdown is the markdown that renders beautifully."
> — *Nobody, probably*

---

## 2. Headings Hierarchy

# H1 — Top Level
## H2 — Section
### H3 — Subsection
#### H4 — Sub-subsection
##### H5 — Minor heading
###### H6 — Smallest heading

---

## 3. Lists

### Unordered
- Item one
- Item two
  - Nested item A
  - Nested item B
    - Deeply nested
    - Even deeper
      - One more level
- Item three with **bold** and *italic* inline

### Ordered
1. First item
2. Second item
   1. Sub-item one
   2. Sub-item two
      1. Sub-sub-item
3. Third item
4. Fourth item

### Task List
- [x] Set up Tauri project
- [x] Build markdown parser
- [x] Add syntax highlighting
- [x] Add theme support
- [ ] Add search functionality
- [ ] Add table of contents panel
- [ ] Publish to Windows Store

### Mixed Nesting
1. First ordered
   - Unordered child
   - Another child
     1. Back to ordered
     2. Still ordered
2. Second ordered

---

## 4. Blockquotes

> Simple single-line blockquote.

> Multi-line blockquote that spans
> more than one line in the source.

> ### Blockquote with heading
>
> And a paragraph inside it, plus a list:
> - Point one
> - Point two
>
> > Nested blockquote inside a blockquote.
> > This gets pretty deep.
>
> Back to the outer blockquote.

---

## 5. Code Blocks

### Bash
```bash
#!/bin/bash
set -euo pipefail

PROJECT="emdee"
VERSION="0.1.0"

build_release() {
  echo "Building $PROJECT v$VERSION..."
  npm run tauri build -- --target x86_64-pc-windows-gnu
  echo "Done!"
}

build_release
```

### Rust
```rust
use std::sync::Mutex;
use tauri::State;

struct AppState {
    counter: Mutex<u64>,
}

#[tauri::command]
fn increment(state: State<'_, AppState>) -> u64 {
    let mut count = state.counter.lock().unwrap();
    *count += 1;
    *count
}

pub fn run() {
    tauri::Builder::default()
        .manage(AppState { counter: Mutex::new(0) })
        .invoke_handler(tauri::generate_handler![increment])
        .run(tauri::generate_context!())
        .expect("error while running application");
}
```

### TypeScript / React
```typescript
import { useState, useCallback, useEffect } from "react";

interface FileState {
  path: string | null;
  content: string;
  isLoading: boolean;
  error: string | null;
}

const initialState: FileState = {
  path: null,
  content: "",
  isLoading: false,
  error: null,
};

export function useFileLoader() {
  const [state, setState] = useState<FileState>(initialState);

  const loadFile = useCallback(async (path: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      const content = await invoke<string>("read_file", { path });
      setState({ path, content, isLoading: false, error: null });
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: String(err),
      }));
    }
  }, []);

  return { ...state, loadFile };
}
```

### CSS
```css
:root {
  --bg-app: #f0f2f5;
  --text-primary: #1a1a2e;
  --accent: #2563eb;
  --radius: 6px;
}

.md-body {
  font-family: "Inter", system-ui, sans-serif;
  line-height: 1.78;
  color: var(--text-primary);
  padding: 40px clamp(24px, 4vw, 80px) 80px;
}

.md-body h1,
.md-body h2,
.md-body h3 {
  font-weight: 600;
  letter-spacing: -0.01em;
  margin-top: 1.8em;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg-app: #11131a;
    --text-primary: #cdd6f4;
  }
}
```

### JSON
```json
{
  "name": "emdee",
  "version": "0.1.0",
  "dependencies": {
    "react": "^18.3.1",
    "markdown-it": "^14.1.0",
    "highlight.js": "^11.10.0",
    "dompurify": "^3.3.1",
    "zustand": "^5.0.1"
  },
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "tauri": "PATH=$HOME/.cargo/bin:$PATH tauri"
  }
}
```

### Python
```python
import os
import hashlib
from pathlib import Path
from typing import Generator

def find_markdown_files(root: str) -> Generator[Path, None, None]:
    """Recursively yield all .md files under root."""
    for path in Path(root).rglob("*.md"):
        if path.is_file():
            yield path

def checksum(path: Path) -> str:
    sha = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            sha.update(chunk)
    return sha.hexdigest()

if __name__ == "__main__":
    root = os.getcwd()
    for md_file in find_markdown_files(root):
        print(f"{checksum(md_file)}  {md_file}")
```

### SQL
```sql
CREATE TABLE documents (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    path        TEXT NOT NULL UNIQUE,
    title       TEXT,
    content     TEXT NOT NULL,
    word_count  INTEGER GENERATED ALWAYS AS (
                    length(content) - length(replace(content, ' ', '')) + 1
                ) STORED,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_documents_title ON documents(title);

SELECT
    d.title,
    d.word_count,
    d.created_at
FROM documents d
WHERE d.word_count > 500
ORDER BY d.updated_at DESC
LIMIT 20;
```

---

## 6. Tables

### Simple Table
| Feature         | Status  | Notes                        |
|-----------------|---------|------------------------------|
| Markdown render | ✅ Done  | Via markdown-it              |
| Syntax highlight| ✅ Done  | highlight.js + Catppuccin    |
| Light theme     | ✅ Done  | Default                      |
| Dark theme      | ✅ Done  | Ctrl+D to toggle             |
| Sepia theme     | ✅ Done  | 3-way cycle                  |
| HTML export     | ✅ Done  | Self-contained file          |
| PDF print       | ✅ Done  | Via window.print()           |
| File assoc.     | ✅ Done  | .md / .markdown              |
| Search          | ⏳ Todo  | Planned                      |
| TOC panel       | ⏳ Todo  | Planned                      |

### Alignment
| Left-aligned    | Center-aligned  | Right-aligned |
|:----------------|:---------------:|---------------:|
| Apple           | Banana          | Cherry         |
| 1,000           | 2,500           | 99,999         |
| Short           | A bit longer    | The longest one here |

### Wide Data Table
| Language   | Paradigm       | Typing   | GC  | First appeared | Creator            |
|------------|----------------|----------|-----|----------------|--------------------|
| Rust       | Multi-paradigm | Static   | No  | 2010           | Graydon Hoare      |
| TypeScript | Multi-paradigm | Static   | Yes | 2012           | Anders Hejlsberg   |
| Python     | Multi-paradigm | Dynamic  | Yes | 1991           | Guido van Rossum   |
| Haskell    | Functional     | Static   | Yes | 1990           | Committee          |
| Zig        | Imperative     | Static   | No  | 2016           | Andrew Kelley      |

---

## 7. Horizontal Rules

Above this line is a section.

---

Below that rule, before this one.

***

And one more using asterisks.

---

## 8. Images

![Placeholder landscape](https://picsum.photos/seed/emdee/800/400)

*Figure 1: A placeholder image to test image rendering and centering.*

---

## 9. Inline HTML Elements

This paragraph uses <kbd>Ctrl</kbd> + <kbd>O</kbd> to open a file, and <kbd>Ctrl</kbd> + <kbd>D</kbd> to toggle dark mode.

<details>
<summary>Click to expand a hidden section</summary>

This content is hidden by default. It can contain full markdown:

- Item one
- Item two

```js
console.log("Hello from inside a <details> block!");
```

</details>

---

## 10. Edge Cases & Stress Tests

### Long Unbroken String
`averylongidentifierthathasnospacesandshouldbehandledgracefullybytherendererandnotcauselayoutbreakage`

### Deeply Nested Blockquote
> Level 1
> > Level 2
> > > Level 3
> > > > Level 4
> > > > > Level 5 — getting pretty deep now

### Mixed Inline Styles in a List
- **Bold** and *italic* in the same item with `code` and a [link](https://example.com)
- ~~Strikethrough~~ combined with **bold ~~strikethrough~~** text
- A `code span` that contains *no actual code* but should render as code

### Empty Table Cells
| A | B | C |
|---|---|---|
|   | x |   |
| y |   | z |
|   |   |   |

### Many Columns
| 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|----|
| a | b | c | d | e | f | g | h | i | j  |
| k | l | m | n | o | p | q | r | s | t  |

---

## 11. Long-Form Prose

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.

Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.

---

## 12. Conclusion

If you've reached the bottom of this document, **EmDee handled it all**. Here's a final summary of what was tested:

1. All six heading levels
2. Bold, italic, strikethrough, inline code
3. Ordered, unordered, nested, and task lists
4. Simple and complex blockquotes (including nested)
5. Code blocks in 7 languages with syntax highlighting
6. Tables with alignment, wide columns, empty cells
7. Horizontal rules
8. Images
9. Inline HTML (`<kbd>`, `<details>`)
10. Edge cases: long strings, deep nesting, mixed styles

> *EmDee — beautiful markdown, beautifully rendered.*
