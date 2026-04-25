"use client";

import {
  SandpackProvider,
  SandpackPreview,
} from "@codesandbox/sandpack-react";
import { Eye, RefreshCw, Monitor } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SpiralAnimation } from "@/components/ui/spiral-animation";

interface PreviewPanelProps {
  files: Record<string, string>;
}

export default function PreviewPanel({ files }: PreviewPanelProps) {
  const [key, setKey] = useState(0);

  const hasFiles = Object.keys(files).length > 0;

  if (!hasFiles) {
    return (
      <div className="relative flex flex-col h-full items-center justify-center bg-background overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-30 pointer-events-none"><SpiralAnimation /></div>
        <div className="flex flex-col items-center relative z-10">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4 bg-primary/5 border border-primary/20 shadow-lg">
            <Monitor size={32} className="text-primary/40" />
          </div>
          <p className="text-sm font-semibold text-muted-foreground">
            Preview will appear here
          </p>
          <p className="text-xs mt-1.5 text-muted-foreground/70">
            Start a conversation to generate an app
          </p>
          <Badge variant="outline" className="mt-4 text-[10px] tracking-[0.2em] uppercase font-semibold border-primary/30 text-primary/60">
            Awaiting orders
          </Badge>
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
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card">
        <div className="flex items-center gap-2">
          <Eye size={13} className="text-primary" />
          <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground">
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
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => setKey((k) => k + 1)}
          title="Refresh preview"
          className="text-muted-foreground"
        >
          <RefreshCw size={12} />
        </Button>
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
