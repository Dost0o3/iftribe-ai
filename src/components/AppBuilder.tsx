"use client";

import { useState, useCallback } from "react";
import {
  Panel,
  Group as PanelGroup,
  Separator as PanelResizeHandle,
} from "react-resizable-panels";
import { Code, Eye, FolderTree, Crown, Gem, Shield } from "lucide-react";
import ChatPanel from "./ChatPanel";
import FileExplorer from "./FileExplorer";
import CodeEditor from "./CodeEditor";
import PreviewPanel from "./PreviewPanel";
import { parseFilesFromResponse } from "@/lib/file-parser";
import type { Message } from "@/lib/types";

type RightTab = "preview" | "code";

export default function AppBuilder() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [files, setFiles] = useState<Record<string, string>>({});
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [rightTab, setRightTab] = useState<RightTab>("preview");

  const handleSendMessage = useCallback(
    async (content: string) => {
      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setIsGenerating(true);
      setStreamingContent("");

      let fullResponse = "";

      try {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: content,
            existingFiles:
              Object.keys(files).length > 0 ? files : undefined,
          }),
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error ?? `HTTP ${res.status}`);
        }

        const reader = res.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = decoder.decode(value, { stream: true });
          const lines = text.split("\n");

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const jsonStr = line.slice(6);

            try {
              const chunk = JSON.parse(jsonStr) as {
                type: string;
                content?: string;
                error?: string;
              };

              if (chunk.type === "text" && chunk.content) {
                fullResponse += chunk.content;
                setStreamingContent(fullResponse);
              } else if (chunk.type === "error") {
                throw new Error(chunk.error ?? "Generation failed");
              }
            } catch (parseErr) {
              if (parseErr instanceof SyntaxError) continue;
              throw parseErr;
            }
          }
        }

        const parsedFiles = parseFilesFromResponse(fullResponse);
        if (Object.keys(parsedFiles).length > 0) {
          setFiles((prev) => ({ ...prev, ...parsedFiles }));
          const firstFile = Object.keys(parsedFiles)[0];
          setSelectedFile(firstFile);
        }

        let explanation = fullResponse;
        const lastEndFile = fullResponse.lastIndexOf("---END FILE---");
        if (lastEndFile !== -1) {
          explanation = fullResponse.substring(lastEndFile + 14).trim();
        }

        const aiMessage: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            explanation ||
            `Generated ${Object.keys(parsedFiles).length} file(s). Check the preview!`,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, aiMessage]);
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Something went wrong";
        const errorMessage: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `Error: ${errorMsg}`,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsGenerating(false);
        setStreamingContent("");
      }
    },
    [files]
  );

  function handleFileSave(path: string, content: string) {
    setFiles((prev) => ({ ...prev, [path]: content }));
  }

  const fileCount = Object.keys(files).length;

  return (
    <div className="h-screen flex flex-col" style={{ background: "var(--background)" }}>
      {/* Top Bar - Mafia style header */}
      <header
        className="flex items-center justify-between px-5 py-2.5"
        style={{
          background: "linear-gradient(180deg, var(--panel-bg-elevated) 0%, var(--panel-bg) 100%)",
          borderBottom: "1px solid var(--panel-border)",
          boxShadow: "var(--shadow-md)",
        }}
      >
        <div className="flex items-center gap-3">
          {/* 3D Logo */}
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center btn-3d"
            style={{
              background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-dim) 100%)",
              boxShadow: "var(--shadow-glow), var(--shadow-md)",
            }}
          >
            <Crown size={18} className="text-black" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base tracking-wide text-shimmer">
              IFTribe.AI
            </span>
            <span className="text-[10px] tracking-[0.2em] uppercase" style={{ color: "var(--text-muted)" }}>
              App Builder
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {fileCount > 0 && (
            <div
              className="flex items-center gap-2 px-3 py-1 rounded-md"
              style={{
                background: "var(--accent-glow)",
                border: "1px solid var(--accent-dim)",
              }}
            >
              <Gem size={12} style={{ color: "var(--accent)" }} />
              <span className="text-xs font-medium" style={{ color: "var(--accent)" }}>
                {fileCount} file{fileCount !== 1 ? "s" : ""}
              </span>
            </div>
          )}
          <div
            className="flex items-center gap-1.5 px-3 py-1 rounded-md"
            style={{
              background: "var(--surface-matte)",
              border: "1px solid var(--panel-border)",
            }}
          >
            <Shield size={11} style={{ color: "var(--accent-dim)" }} />
            <span className="text-[10px] uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              Powered by Claude
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <PanelGroup orientation="horizontal" className="flex-1">
        {/* Left: Chat */}
        <Panel defaultSize={30} minSize={20}>
          <ChatPanel
            messages={messages}
            onSendMessage={handleSendMessage}
            isGenerating={isGenerating}
            streamingContent={streamingContent}
          />
        </Panel>

        <PanelResizeHandle className="w-1 resize-handle" />

        {/* Right: Preview + Code */}
        <Panel defaultSize={70} minSize={30}>
          <div className="flex flex-col h-full">
            {/* Tabs - 3D styled */}
            <div
              className="flex items-center gap-0"
              style={{
                background: "var(--panel-bg)",
                borderBottom: "1px solid var(--panel-border)",
              }}
            >
              <button
                onClick={() => setRightTab("preview")}
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold tracking-wide uppercase transition-all cursor-pointer"
                style={{
                  color: rightTab === "preview" ? "var(--accent)" : "var(--tab-inactive)",
                  borderBottom: rightTab === "preview"
                    ? "2px solid var(--accent)"
                    : "2px solid transparent",
                  background: rightTab === "preview" ? "var(--accent-glow)" : "transparent",
                  textShadow: rightTab === "preview" ? "0 0 10px rgba(201,168,76,0.3)" : "none",
                }}
              >
                <Eye size={14} />
                Preview
              </button>
              <button
                onClick={() => setRightTab("code")}
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold tracking-wide uppercase transition-all cursor-pointer"
                style={{
                  color: rightTab === "code" ? "var(--accent)" : "var(--tab-inactive)",
                  borderBottom: rightTab === "code"
                    ? "2px solid var(--accent)"
                    : "2px solid transparent",
                  background: rightTab === "code" ? "var(--accent-glow)" : "transparent",
                  textShadow: rightTab === "code" ? "0 0 10px rgba(201,168,76,0.3)" : "none",
                }}
              >
                <Code size={14} />
                Code
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-hidden">
              {rightTab === "preview" ? (
                <PreviewPanel files={files} />
              ) : (
                <PanelGroup orientation="horizontal">
                  {/* File Explorer */}
                  <Panel defaultSize={25} minSize={15}>
                    <div
                      className="h-full overflow-y-auto"
                      style={{
                        background: "var(--panel-bg)",
                        borderRight: "1px solid var(--panel-border)",
                      }}
                    >
                      <div
                        className="flex items-center gap-2 px-3 py-2.5"
                        style={{
                          borderBottom: "1px solid var(--panel-border)",
                          background: "var(--panel-bg-elevated)",
                        }}
                      >
                        <FolderTree size={13} style={{ color: "var(--accent)" }} />
                        <span
                          className="text-[10px] font-bold tracking-[0.15em] uppercase"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          Files
                        </span>
                      </div>
                      <FileExplorer
                        files={files}
                        selectedFile={selectedFile}
                        onSelectFile={setSelectedFile}
                      />
                    </div>
                  </Panel>

                  <PanelResizeHandle className="w-1 resize-handle" />

                  {/* Code Editor */}
                  <Panel defaultSize={75} minSize={30}>
                    {selectedFile && files[selectedFile] ? (
                      <CodeEditor
                        filePath={selectedFile}
                        content={files[selectedFile]}
                        onSave={handleFileSave}
                      />
                    ) : (
                      <div
                        className="flex flex-col items-center justify-center h-full"
                        style={{ background: "var(--surface-matte)" }}
                      >
                        <div
                          className="w-16 h-16 rounded-xl flex items-center justify-center mb-4"
                          style={{
                            background: "var(--accent-glow)",
                            border: "1px solid var(--panel-border)",
                            boxShadow: "var(--shadow-md)",
                          }}
                        >
                          <Code size={24} style={{ color: "var(--accent-dim)" }} />
                        </div>
                        <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
                          Select a file to edit
                        </p>
                      </div>
                    )}
                  </Panel>
                </PanelGroup>
              )}
            </div>
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
}
