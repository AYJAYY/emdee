import { useState } from "react";
import type { FileEntry } from "../../adapters/fs";
import { useFileTree } from "../../hooks/useFileTree";
import { listDirectory } from "../../adapters/fs";
import { useAppStore } from "../../store/appStore";
import "./FileTree.css";

interface FileTreeNodeProps {
  entry: FileEntry;
  depth: number;
}

function FileTreeNode({ entry, depth }: FileTreeNodeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [children, setChildren] = useState<FileEntry[]>([]);
  const { openFile } = useFileTree();
  const currentFile = useAppStore((s) => s.currentFile);

  async function handleClick() {
    if (entry.isDir) {
      if (!isOpen) {
        const entries = await listDirectory(entry.path);
        setChildren(entries);
      }
      setIsOpen((prev) => !prev);
    } else if (entry.isMd) {
      openFile(entry.path);
    }
  }

  async function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  }

  const isActive = currentFile === entry.path;
  const indent = depth * 12;

  return (
    <li role="none">
      <button
        className={`tree-node ${entry.isDir ? "tree-node--dir" : "tree-node--file"} ${isActive ? "tree-node--active" : ""} ${!entry.isMd && !entry.isDir ? "tree-node--other" : ""}`}
        style={{ paddingLeft: `${12 + indent}px` }}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        aria-expanded={entry.isDir ? isOpen : undefined}
        aria-current={isActive ? "page" : undefined}
        type="button"
        title={entry.name}
      >
        <span className="tree-node__icon" aria-hidden="true">
          {entry.isDir ? (isOpen ? "▾" : "▸") : entry.isMd ? "◈" : "·"}
        </span>
        <span className="tree-node__name">{entry.name}</span>
      </button>

      {entry.isDir && isOpen && children.length > 0 && (
        <ul role="group" className="tree-list">
          {children.map((child) => (
            <FileTreeNode key={child.path} entry={child} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );
}

export function FileTree() {
  const { fileTree, currentFolder } = useAppStore();
  const folderName = currentFolder
    ? currentFolder.split("/").pop() ?? currentFolder
    : null;

  if (!fileTree.length) return null;

  return (
    <nav className="sidebar" aria-label="File browser">
      {folderName && (
        <div className="sidebar__header">
          <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
          </svg>
          <span className="sidebar__folder-name" title={currentFolder ?? ""}>{folderName}</span>
        </div>
      )}
      <ul role="tree" className="tree-list tree-list--root" aria-label={`Files in ${folderName}`}>
        {fileTree.map((entry) => (
          <FileTreeNode key={entry.path} entry={entry} depth={0} />
        ))}
      </ul>
    </nav>
  );
}
