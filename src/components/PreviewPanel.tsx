"use client";

import {
  SandpackProvider,
  SandpackPreview,
} from "@codesandbox/sandpack-react";
import { Eye, RefreshCw } from "lucide-react";
import { useState } from "react";

interface PreviewPanelProps {
  files: Record<string, string>;
}

export default function PreviewPanel({ files }: PreviewPanelProps) {
  const [key, setKey] = useState(0);

  const hasFiles = Object.keys(files).length > 0;

  if (!hasFiles) {
    return (
      <div
        className="flex flex-col h-full items-center justify-center"
        style={{ background: "var(--panel-bg)" }}
      >
        <Eye
          size={32}
          className="mb-3"
          style={{ color: "var(--tab-inactive)" }}
        />
        <p className="text-sm" style={{ color: "var(--tab-inactive)" }}>
          Preview will appear here
        </p>
        <p className="text-xs mt-1" style={{ color: "var(--tab-inactive)" }}>
          Start a conversation to generate an app
        </p>
      </div>
    );
  }

  const sandpackFiles: Record<string, string> = {};
  for (const [path, content] of Object.entries(files)) {
    sandpackFiles[path] = content;
  }

  if (!sandpackFiles["/App.js"]) {
    const appKey = Object.keys(sandpackFiles).find(
      (k) => k.endsWith(".js") || k.endsWith(".jsx")
    );
    if (appKey && appKey !== "/App.js") {
      sandpackFiles["/App.js"] = sandpackFiles[appKey];
    }
  }

  return (
    <div
      className="flex flex-col h-full"
      style={{ background: "var(--panel-bg)" }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-2 border-b"
        style={{ borderColor: "var(--panel-border)" }}
      >
        <div className="flex items-center gap-2">
          <Eye size={14} style={{ color: "var(--accent)" }} />
          <span className="text-xs font-semibold">Live Preview</span>
        </div>
        <button
          onClick={() => setKey((k) => k + 1)}
          className="p-1.5 rounded transition-colors cursor-pointer"
          style={{ color: "var(--tab-inactive)" }}
          title="Refresh preview"
        >
          <RefreshCw size={13} />
        </button>
      </div>

      {/* Preview */}
      <div className="flex-1 overflow-hidden">
        <SandpackProvider
          key={key}
          template="react"
          files={sandpackFiles}
          theme="dark"
          options={{
            autoReload: true,
          }}
        >
          <SandpackPreview
            showNavigator={false}
            showRefreshButton={false}
            style={{ height: "100%" }}
          />
        </SandpackProvider>
      </div>
    </div>
  );
}
