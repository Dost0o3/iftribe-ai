"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Panel,
  Group as PanelGroup,
  Separator as PanelResizeHandle,
} from "react-resizable-panels";
import {
  Code, Eye, FolderTree, Gem, Shield, Download, Plus, Layers,
  Settings, Share2, History, Trash2,
} from "lucide-react";
import Image from "next/image";
import ChatPanel from "./ChatPanel";
import FileExplorer from "./FileExplorer";
import CodeEditor from "./CodeEditor";
import PreviewPanel from "./PreviewPanel";
import TemplateSelector from "./TemplateSelector";
import SettingsPanel from "./SettingsPanel";
import { parseFilesFromResponse } from "@/lib/file-parser";
import { downloadProjectAsZip } from "@/lib/download";
import type { Message, Framework, ProjectTemplate, Project } from "@/lib/types";
import { FRAMEWORKS } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type RightTab = "preview" | "code";

function loadProjects(): Project[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem("iftribe_projects");
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveProjects(projects: Project[]) {
  localStorage.setItem("iftribe_projects", JSON.stringify(projects));
}

export default function AppBuilder() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [files, setFiles] = useState<Record<string, string>>({});
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [rightTab, setRightTab] = useState<RightTab>("preview");
  const [framework, setFramework] = useState<Framework>("react");
  const [template, setTemplate] = useState<ProjectTemplate | null>(null);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showProjectList, setShowProjectList] = useState(false);
  const [savedProjects, setSavedProjects] = useState<Project[]>(() => loadProjects());
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [fileVersions, setFileVersions] = useState<Record<string, string[]>>({});

  const autoSaveProject = useCallback(() => {
    if (Object.keys(files).length === 0 && messages.length === 0) return;

    const project: Project = {
      id: currentProjectId || crypto.randomUUID(),
      name: template ? template.replace(/-/g, " ") : "Untitled Project",
      files,
      messages,
      framework,
      template,
      createdAt: currentProjectId
        ? (savedProjects.find((p) => p.id === currentProjectId)?.createdAt ?? Date.now())
        : Date.now(),
      updatedAt: Date.now(),
    };

    const updated = currentProjectId
      ? savedProjects.map((p) => (p.id === currentProjectId ? project : p))
      : [...savedProjects, project];

    setSavedProjects(updated);
    saveProjects(updated);
    if (!currentProjectId) setCurrentProjectId(project.id);
  }, [files, messages, framework, template, currentProjectId, savedProjects]);

  useEffect(() => {
    if (messages.length > 0 || Object.keys(files).length > 0) {
      const timer = setTimeout(autoSaveProject, 2000);
      return () => clearTimeout(timer);
    }
  }, [messages, files, autoSaveProject]);

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

      const conversationHistory = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const apiKey = typeof window !== "undefined"
        ? localStorage.getItem("iftribe_api_key") || undefined
        : undefined;
      const model = typeof window !== "undefined"
        ? localStorage.getItem("iftribe_model") || undefined
        : undefined;
      const maxTokens = typeof window !== "undefined"
        ? parseInt(localStorage.getItem("iftribe_max_tokens") || "16384")
        : 16384;

      try {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: content,
            existingFiles: Object.keys(files).length > 0 ? files : undefined,
            framework,
            template,
            conversationHistory: conversationHistory.length > 0 ? conversationHistory : undefined,
            apiKey,
            model,
            maxTokens,
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
          setFiles((prev) => {
            const updated = { ...prev, ...parsedFiles };
            const newVersions = { ...fileVersions };
            for (const [path, content] of Object.entries(parsedFiles)) {
              if (!newVersions[path]) newVersions[path] = [];
              newVersions[path].push(content);
            }
            setFileVersions(newVersions);
            return updated;
          });
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
          content: explanation || `Generated ${Object.keys(parsedFiles).length} file(s). Check the preview!`,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, aiMessage]);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Something went wrong";
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
    [files, framework, template, messages, fileVersions]
  );

  function handleFileSave(path: string, content: string) {
    setFiles((prev) => ({ ...prev, [path]: content }));
    setFileVersions((prev) => {
      const versions = prev[path] ? [...prev[path], content] : [content];
      return { ...prev, [path]: versions };
    });
  }

  function handleTemplateSelect(fw: Framework, tmpl: ProjectTemplate) {
    setFramework(fw);
    setTemplate(tmpl);
    setShowTemplateSelector(false);
  }

  function handleDownload() {
    downloadProjectAsZip(files, template ? `iftribe-${template}` : "iftribe-project");
  }

  function handleShare() {
    const shareData = JSON.stringify({ files, framework, template }, null, 2);
    navigator.clipboard.writeText(shareData).catch(() => {});
  }

  function handleLoadProject(project: Project) {
    setFiles(project.files);
    setMessages(project.messages);
    setFramework(project.framework);
    setTemplate(project.template);
    setCurrentProjectId(project.id);
    setShowProjectList(false);
    setSelectedFile(Object.keys(project.files)[0] ?? null);
  }

  function handleDeleteProject(id: string) {
    const updated = savedProjects.filter((p) => p.id !== id);
    setSavedProjects(updated);
    saveProjects(updated);
    if (currentProjectId === id) {
      setCurrentProjectId(null);
      setFiles({});
      setMessages([]);
    }
  }

  function handleNewProject() {
    setCurrentProjectId(null);
    setFiles({});
    setMessages([]);
    setSelectedFile(null);
    setFileVersions({});
    setShowTemplateSelector(true);
  }

  const fileCount = Object.keys(files).length;
  const currentFramework = FRAMEWORKS.find((f) => f.id === framework);

  return (
    <div className="h-screen flex flex-col" style={{ background: "var(--background)" }}>
      {showTemplateSelector && (
        <TemplateSelector
          onSelect={handleTemplateSelect}
          onClose={() => setShowTemplateSelector(false)}
        />
      )}
      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}

      {/* Project List Modal */}
      {showProjectList && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(12px)" }}
        >
          <Card
            className="w-full max-w-md max-h-[70vh] flex flex-col border-border/30 bg-card shadow-2xl"
            style={{ boxShadow: "var(--shadow-lg), var(--shadow-glow)" }}
          >
            <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-border/50">
              <h2 className="text-lg font-bold text-shimmer">Saved Projects</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowProjectList(false)}>
                <span className="text-sm">X</span>
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {savedProjects.length === 0 ? (
                <p className="text-center text-sm py-8 text-muted-foreground">
                  No saved projects yet
                </p>
              ) : (
                savedProjects.map((p) => (
                  <button
                    key={p.id}
                    className={cn(
                      "w-full flex items-center justify-between p-3 rounded-xl cursor-pointer text-left",
                      "bg-secondary/60 hover:bg-secondary border border-transparent hover:border-primary/20",
                      "transition-all hover:-translate-y-0.5 hover:shadow-md"
                    )}
                    onClick={() => handleLoadProject(p)}
                  >
                    <div>
                      <p className="text-sm font-medium capitalize text-foreground">
                        {p.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {Object.keys(p.files).length} files &middot; {p.messages.length} messages &middot; {new Date(p.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={(e) => { e.stopPropagation(); handleDeleteProject(p.id); }}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 size={12} />
                    </Button>
                  </button>
                ))
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Top Bar */}
      <TooltipProvider>
        <header
          className="flex items-center justify-between px-5 py-2 border-b border-border"
          style={{
            background: "linear-gradient(180deg, var(--panel-bg-elevated) 0%, var(--panel-bg) 100%)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <div className="flex items-center gap-4">
            <Image
              src="/logo.png"
              alt="IFTribe.AI"
              width={120}
              height={40}
              className="object-contain"
              style={{ filter: "drop-shadow(0 2px 8px rgba(184, 134, 110, 0.15))" }}
              preload
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTemplateSelector(true)}
              className="gap-1.5 border-primary/30 bg-primary/5 text-primary hover:bg-primary/10"
            >
              <Layers size={11} />
              <span className="text-[10px] font-bold uppercase tracking-wider">
                {currentFramework?.icon} {currentFramework?.name}
              </span>
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={handleNewProject} size="sm" className="gap-1.5">
              <Plus size={12} />
              New
            </Button>

            <Tooltip>
              <TooltipTrigger render={<Button variant="outline" size="icon-sm" onClick={() => setShowProjectList(true)} className="text-primary border-border/50" />}>
                <History size={13} />
              </TooltipTrigger>
              <TooltipContent>Saved Projects</TooltipContent>
            </Tooltip>

            {fileCount > 0 && (
              <>
                <Tooltip>
                  <TooltipTrigger render={<Button variant="outline" size="icon-sm" onClick={handleShare} className="text-primary border-border/50" />}>
                    <Share2 size={13} />
                  </TooltipTrigger>
                  <TooltipContent>Share</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger render={<Button variant="outline" size="icon-sm" onClick={handleDownload} className="text-primary border-border/50" />}>
                    <Download size={13} />
                  </TooltipTrigger>
                  <TooltipContent>Download ZIP</TooltipContent>
                </Tooltip>

                <Badge variant="outline" className="gap-1 border-primary/30 text-primary">
                  <Gem size={10} />
                  {fileCount} files
                </Badge>
              </>
            )}

            <Tooltip>
              <TooltipTrigger render={<Button variant="outline" size="icon-sm" onClick={() => setShowSettings(true)} className="text-primary border-border/50" />}>
                <Settings size={13} />
              </TooltipTrigger>
              <TooltipContent>Settings</TooltipContent>
            </Tooltip>

            <Badge variant="secondary" className="gap-1.5">
              <Shield size={10} className="text-muted-foreground" />
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                via Clod.io
              </span>
            </Badge>
          </div>
        </header>
      </TooltipProvider>

      {/* Main Content */}
      <PanelGroup orientation="horizontal" className="flex-1">
        <Panel defaultSize={30} minSize={20}>
          <ChatPanel
            messages={messages}
            onSendMessage={handleSendMessage}
            isGenerating={isGenerating}
            streamingContent={streamingContent}
            framework={framework}
            template={template}
          />
        </Panel>

        <PanelResizeHandle className="w-1 resize-handle" />

        <Panel defaultSize={70} minSize={30}>
          <div className="flex flex-col h-full">
            <div
              className="flex items-center gap-0"
              style={{ background: "var(--panel-bg)", borderBottom: "1px solid var(--panel-border)" }}
            >
              <button
                onClick={() => setRightTab("preview")}
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold tracking-wide uppercase transition-all cursor-pointer"
                style={{
                  color: rightTab === "preview" ? "var(--accent)" : "var(--tab-inactive)",
                  borderBottom: rightTab === "preview" ? "2px solid var(--accent)" : "2px solid transparent",
                  background: rightTab === "preview" ? "var(--accent-glow)" : "transparent",
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
                  borderBottom: rightTab === "code" ? "2px solid var(--accent)" : "2px solid transparent",
                  background: rightTab === "code" ? "var(--accent-glow)" : "transparent",
                }}
              >
                <Code size={14} />
                Code
              </button>
            </div>

            <div className="flex-1 overflow-hidden">
              {rightTab === "preview" ? (
                <PreviewPanel files={files} />
              ) : (
                <PanelGroup orientation="horizontal">
                  <Panel defaultSize={25} minSize={15}>
                    <div
                      className="h-full overflow-y-auto"
                      style={{ background: "var(--panel-bg)", borderRight: "1px solid var(--panel-border)" }}
                    >
                      <div
                        className="flex items-center gap-2 px-3 py-2.5"
                        style={{ borderBottom: "1px solid var(--panel-border)", background: "var(--panel-bg-elevated)" }}
                      >
                        <FolderTree size={13} style={{ color: "var(--accent)" }} />
                        <span className="text-[10px] font-bold tracking-[0.15em] uppercase" style={{ color: "var(--text-secondary)" }}>
                          Files
                        </span>
                      </div>
                      <FileExplorer files={files} selectedFile={selectedFile} onSelectFile={setSelectedFile} />
                    </div>
                  </Panel>
                  <PanelResizeHandle className="w-1 resize-handle" />
                  <Panel defaultSize={75} minSize={30}>
                    {selectedFile && files[selectedFile] ? (
                      <CodeEditor filePath={selectedFile} content={files[selectedFile]} onSave={handleFileSave} />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full" style={{ background: "var(--surface-matte)" }}>
                        <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-4 embossed-plate">
                          <Code size={24} style={{ color: "var(--accent-dim)" }} />
                        </div>
                        <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>Select a file to edit</p>
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
