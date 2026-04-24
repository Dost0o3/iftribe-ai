"use client";

import { FileCode, ChevronRight } from "lucide-react";
import { getLanguageFromPath } from "@/lib/file-parser";

interface FileExplorerProps {
  files: Record<string, string>;
  selectedFile: string | null;
  onSelectFile: (path: string) => void;
}

const FILE_ICONS: Record<string, string> = {
  javascript: "🟨",
  typescript: "🔷",
  css: "🎨",
  html: "🌐",
  json: "📋",
  markdown: "📝",
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
        <FileCode
          size={24}
          className="mx-auto mb-2"
          style={{ color: "var(--tab-inactive)" }}
        />
        <p className="text-xs" style={{ color: "var(--tab-inactive)" }}>
          No files generated yet
        </p>
      </div>
    );
  }

  return (
    <div className="py-2">
      {filePaths.map((path) => {
        const lang = getLanguageFromPath(path);
        const icon = FILE_ICONS[lang] ?? "📄";
        const isSelected = selectedFile === path;

        return (
          <button
            key={path}
            onClick={() => onSelectFile(path)}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-left transition-colors cursor-pointer"
            style={{
              background: isSelected ? "var(--accent)" : "transparent",
              color: isSelected ? "white" : "var(--foreground)",
            }}
          >
            <ChevronRight size={12} className="opacity-50" />
            <span>{icon}</span>
            <span className="truncate font-mono text-xs">{path}</span>
          </button>
        );
      })}
    </div>
  );
}
