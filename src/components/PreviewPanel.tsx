"use client";

import {
  SandpackProvider,
  SandpackPreview,
} from "@codesandbox/sandpack-react";
import { Eye, RefreshCw, Monitor } from "lucide-react";
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
        style={{ background: "var(--surface-matte)" }}
      >
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4"
          style={{
            background: "var(--accent-glow)",
            border: "1px solid var(--panel-border)",
            boxShadow: "var(--shadow-lg)",
          }}
        >
          <Monitor size={32} style={{ color: "var(--accent-dim)" }} />
        </div>
        <p className="text-sm font-semibold" style={{ color: "var(--text-muted)" }}>
          Preview will appear here
        </p>
        <p className="text-xs mt-1.5" style={{ color: "var(--text-muted)" }}>
          Start a conversation to generate an app
        </p>
        <div
          className="mt-4 px-4 py-1.5 rounded-full text-[10px] tracking-[0.2em] uppercase font-semibold"
          style={{
            background: "var(--accent-glow)",
            color: "var(--accent-dim)",
            border: "1px solid var(--panel-border)",
          }}
        >
          Awaiting orders
        </div>
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
      style={{ background: "var(--surface-matte)" }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-2"
        style={{
          borderBottom: "1px solid var(--panel-border)",
          background: "var(--panel-bg-elevated)",
        }}
      >
        <div className="flex items-center gap-2">
          <Eye size={13} style={{ color: "var(--accent)" }} />
          <span
            className="text-[10px] font-bold tracking-[0.15em] uppercase"
            style={{ color: "var(--text-secondary)" }}
          >
            Live Preview
          </span>
          <div
            className="w-2 h-2 rounded-full"
            style={{
              background: "#4ade80",
              boxShadow: "0 0 6px rgba(74, 222, 128, 0.5)",
            }}
          />
        </div>
        <button
          onClick={() => setKey((k) => k + 1)}
          className="p-1.5 rounded-md transition-all cursor-pointer btn-3d"
          style={{
            color: "var(--text-muted)",
            background: "var(--panel-bg)",
          }}
          title="Refresh preview"
        >
          <RefreshCw size={12} />
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
