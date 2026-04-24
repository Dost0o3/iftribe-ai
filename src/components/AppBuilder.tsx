"use client";

import { useState, useCallback } from "react";
import {
  Panel,
  Group as PanelGroup,
  Separator as PanelResizeHandle,
} from "react-resizable-panels";
import { Code, Eye, FolderTree } from "lucide-react";
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
          throw new Error(
            errData.error ?? `HTTP ${res.status}`
          );
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
              if (
                parseErr instanceof SyntaxError
              ) {
                continue;
              }
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

  return (
    <div className="h-screen flex flex-col" style={{ background: "var(--background)" }}>
      {/* Top Bar */}
      <header
        className="flex items-center justify-between px-4 py-2 border-b"
        style={{
          borderColor: "var(--panel-border)",
          background: "var(--panel-bg)",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm text-white"
            style={{ background: "var(--accent)" }}
          >
            IF
          </div>
          <span className="font-bold text-base">
            IFTribe<span style={{ color: "var(--accent)" }}>.AI</span>
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs" style={{ color: "var(--tab-inactive)" }}>
          <span>
            {Object.keys(files).length > 0
              ? `${Object.keys(files).length} file(s)`
              : "No project"}
          </span>
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

        <PanelResizeHandle
          className="w-1 transition-colors"
          style={{ background: "var(--panel-border)" }}
        />

        {/* Right: Preview + Code */}
        <Panel defaultSize={70} minSize={30}>
          <div className="flex flex-col h-full">
            {/* Tabs */}
            <div
              className="flex items-center gap-0 border-b"
              style={{
                borderColor: "var(--panel-border)",
                background: "var(--panel-bg)",
              }}
            >
              <button
                onClick={() => setRightTab("preview")}
                className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium transition-colors cursor-pointer"
                style={{
                  color: rightTab === "preview" ? "var(--accent)" : "var(--tab-inactive)",
                  borderBottom:
                    rightTab === "preview" ? "2px solid var(--accent)" : "2px solid transparent",
                }}
              >
                <Eye size={14} />
                Preview
              </button>
              <button
                onClick={() => setRightTab("code")}
                className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium transition-colors cursor-pointer"
                style={{
                  color: rightTab === "code" ? "var(--accent)" : "var(--tab-inactive)",
                  borderBottom:
                    rightTab === "code" ? "2px solid var(--accent)" : "2px solid transparent",
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
                      className="h-full border-r overflow-y-auto"
                      style={{
                        borderColor: "var(--panel-border)",
                        background: "var(--panel-bg)",
                      }}
                    >
                      <div
                        className="flex items-center gap-2 px-3 py-2 border-b"
                        style={{ borderColor: "var(--panel-border)" }}
                      >
                        <FolderTree size={13} style={{ color: "var(--accent)" }} />
                        <span className="text-xs font-semibold">Files</span>
                      </div>
                      <FileExplorer
                        files={files}
                        selectedFile={selectedFile}
                        onSelectFile={setSelectedFile}
                      />
                    </div>
                  </Panel>

                  <PanelResizeHandle
                    className="w-1 transition-colors"
                    style={{ background: "var(--panel-border)" }}
                  />

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
                        style={{ background: "#1e1e1e" }}
                      >
                        <Code
                          size={32}
                          className="mb-3"
                          style={{ color: "var(--tab-inactive)" }}
                        />
                        <p
                          className="text-sm"
                          style={{ color: "var(--tab-inactive)" }}
                        >
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
