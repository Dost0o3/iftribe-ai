"use client";

import { ChevronRight, Folder } from "lucide-react";
import { getLanguageFromPath } from "@/lib/file-parser";

interface FileExplorerProps {
  files: Record<string, string>;
  selectedFile: string | null;
  onSelectFile: (path: string) => void;
}

const FILE_ICONS: Record<string, string> = {
  javascript: "⚡",
  typescript: "💎",
  css: "🎨",
  html: "🌐",
  json: "📋",
  markdown: "📜",
};

export default function FileExplorer({
  files,
  selectedFile,
  onSelectFile,
}: FileExplorerProps) {
  const filePaths = Object.keys(files).sort();

  if (filePaths.length === 0) {
    return (
      <div className="p-4 text-center">
        <div
          className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center"
          style={{
            background: "var(--accent-glow)",
            border: "1px solid var(--panel-border)",
          }}
        >
          <Folder size={20} style={{ color: "var(--accent-dim)" }} />
        </div>
        <p className="text-[10px] tracking-[0.15em] uppercase" style={{ color: "var(--text-muted)" }}>
          No files yet
        </p>
      </div>
    );
  }

  return (
    <div className="py-1">
      {filePaths.map((path) => {
        const lang = getLanguageFromPath(path);
        const icon = FILE_ICONS[lang] ?? "📄";
        const isSelected = selectedFile === path;

        return (
          <button
            key={path}
            onClick={() => onSelectFile(path)}
            className="w-full flex items-center gap-2 px-3 py-2 text-left transition-all cursor-pointer"
            style={{
              background: isSelected
                ? "linear-gradient(90deg, var(--accent-glow-strong) 0%, var(--accent-glow) 100%)"
                : "transparent",
              borderLeft: isSelected ? "2px solid var(--accent)" : "2px solid transparent",
              color: isSelected ? "var(--accent)" : "var(--text-secondary)",
            }}
          >
            <ChevronRight
              size={10}
              style={{
                color: isSelected ? "var(--accent)" : "var(--text-muted)",
                transform: isSelected ? "rotate(90deg)" : "none",
                transition: "transform 0.2s",
              }}
            />
            <span className="text-xs">{icon}</span>
            <span className="truncate font-mono text-xs">{path}</span>
          </button>
        );
      })}
    </div>
  );
}
