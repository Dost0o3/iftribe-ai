"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Loader2, Zap, Briefcase, ArrowUp } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { InfiniteGrid } from "@/components/ui/the-infinite-grid";
import { cn } from "@/lib/utils";
import type { Message, Framework, ProjectTemplate } from "@/lib/types";

interface ChatPanelProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isGenerating: boolean;
  streamingContent: string;
  framework: Framework;
  template: ProjectTemplate | null;
}

const SUGGESTIONS: Record<string, Array<{ icon: string; text: string }>> = {
  default: [
    { icon: "⚡", text: "Build a todo app with drag and drop" },
    { icon: "🌤", text: "Create a weather dashboard with charts" },
    { icon: "🛒", text: "Build an e-commerce product page" },
    { icon: "💬", text: "Create a real-time chat interface" },
  ],
  web3: [
    { icon: "💰", text: "Build a DeFi token swap interface" },
    { icon: "🖼️", text: "Create an NFT minting dApp" },
    { icon: "👛", text: "Build a crypto wallet dashboard" },
    { icon: "🏛️", text: "Create a DAO voting interface" },
  ],
  ai: [
    { icon: "🤖", text: "Build an AI chatbot with streaming" },
    { icon: "🎆", text: "Create an AI image generation UI" },
    { icon: "🧠", text: "Build a multi-agent orchestration dashboard" },
    { icon: "🔍", text: "Create a RAG search interface" },
  ],
  web5: [
    { icon: "🆔", text: "Build a decentralized identity manager" },
    { icon: "🗄️", text: "Create a DWN data storage app" },
    { icon: "📜", text: "Build a verifiable credentials platform" },
    { icon: "🔐", text: "Create a self-sovereign identity wallet" },
  ],
};

function useAutoResizeTextarea(minHeight: number, maxHeight: number) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const adjustHeight = useCallback(
    (reset?: boolean) => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      if (reset) { textarea.style.height = `${minHeight}px`; return; }
      textarea.style.height = `${minHeight}px`;
      const newHeight = Math.max(minHeight, Math.min(textarea.scrollHeight, maxHeight));
      textarea.style.height = `${newHeight}px`;
    },
    [minHeight, maxHeight]
  );
  return { textareaRef, adjustHeight };
}

export default function ChatPanel({
  messages,
  onSendMessage,
  isGenerating,
  streamingContent,
  framework,
  template,
}: ChatPanelProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { textareaRef, adjustHeight } = useAutoResizeTextarea(44, 160);

  const isWeb3 = framework.startsWith("web3");
  const isAI = template === "ai-chatbot" || template === "ai-image-gen" || template === "ai-agent";
  const isWeb5 = template === "did-identity" || template === "dwn-app" || template === "verifiable-credentials";

  let suggestionKey = "default";
  if (isWeb3) suggestionKey = "web3";
  else if (isAI) suggestionKey = "ai";
  else if (isWeb5) suggestionKey = "web5";
  const currentSuggestions = SUGGESTIONS[suggestionKey];

  const contextLabel = isWeb3 ? "Web3" : isAI ? "AI / Web4" : isWeb5 ? "Web5" : null;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isGenerating) return;
    onSendMessage(trimmed);
    setInput("");
    adjustHeight(true);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }

  return (
    <div className="flex flex-col h-full bg-card">
      {/* Header */}
      <div
        className="flex items-center gap-2.5 px-4 py-3 border-b border-border"
        style={{
          background: "linear-gradient(180deg, var(--panel-bg-elevated) 0%, var(--panel-bg) 100%)",
        }}
      >
        <div className="w-6 h-6 rounded-md flex items-center justify-center bg-primary/10 border border-primary/30">
          <Briefcase size={12} className="text-primary" />
        </div>
        <span className="font-bold text-xs tracking-[0.15em] uppercase text-muted-foreground">
          Command Center
        </span>
        {contextLabel && (
          <Badge variant="outline" className="text-[9px] uppercase tracking-wider border-primary/30 text-primary">
            {contextLabel}
          </Badge>
        )}
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-4 py-4">
        <div className="space-y-4">
          {messages.length === 0 && !isGenerating && (
            <InfiniteGrid className="min-h-[50vh] flex items-center justify-center rounded-xl">
            <div className="flex flex-col items-center justify-center text-center px-4">
              <div
                className="mb-5 bronze-glow rounded-xl overflow-hidden"
                style={{ boxShadow: "var(--shadow-lg), var(--shadow-glow)" }}
              >
                <Image src="/logo.png" alt="IFTribe.AI" width={200} height={70} className="object-contain" preload />
              </div>
              <p className="text-[10px] tracking-[0.3em] uppercase mb-1 font-semibold text-primary">
                {isWeb3 ? "Web3 App Builder" : isAI ? "AI App Builder" : isWeb5 ? "Web5 App Builder" : "The Don of App Building"}
              </p>
              <p className="text-sm mt-2 max-w-xs text-muted-foreground">
                {isWeb3 ? "Describe the dApp you want — DeFi, NFTs, DAOs, wallets, and more."
                  : isAI ? "Build AI-native apps — chatbots, image generators, agent dashboards."
                  : isWeb5 ? "Create decentralized identity apps — DIDs, credentials, DWN stores."
                  : "Make an offer I can\u0027t refuse \u2014 describe the app you want built."}
              </p>

              <div className="mt-6 space-y-2 w-full max-w-sm">
                {currentSuggestions.map((suggestion) => (
                  <button
                    key={suggestion.text}
                    onClick={() => {
                      setInput(suggestion.text);
                      textareaRef.current?.focus();
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 text-left px-4 py-3 rounded-xl text-sm cursor-pointer",
                      "bg-secondary/60 hover:bg-secondary border border-transparent hover:border-primary/20",
                      "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
                      "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <span className="text-base">{suggestion.icon}</span>
                    <span>{suggestion.text}</span>
                  </button>
                ))}
              </div>
            </div>
            </InfiniteGrid>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                {msg.role === "user" ? (
                  <div className="w-5 h-5 rounded flex items-center justify-center bg-primary/10 border border-primary/30">
                    <Zap size={10} className="text-primary" />
                  </div>
                ) : (
                  <Image src="/logo.png" alt="IFTribe.AI" width={20} height={20} className="rounded object-contain" />
                )}
                <span className={cn(
                  "text-[10px] font-bold tracking-[0.15em] uppercase",
                  msg.role === "user" ? "text-primary" : "text-primary/80"
                )}>
                  {msg.role === "user" ? "You" : "IFTribe.AI"}
                </span>
              </div>
              <div className={cn(
                "rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap border border-border",
                msg.role === "user" ? "bg-secondary/80" : "bg-card"
              )} style={{ boxShadow: "var(--shadow-sm)" }}>
                {msg.content}
              </div>
            </div>
          ))}

          {isGenerating && streamingContent && (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <Image src="/logo.png" alt="IFTribe.AI" width={20} height={20} className="rounded object-contain animate-subtle-pulse" />
                <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-primary/80">IFTribe.AI</span>
                <Loader2 size={10} className="animate-spin text-primary" />
              </div>
              <div className="rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap bg-card border border-border" style={{ boxShadow: "var(--shadow-sm)" }}>
                {streamingContent.length > 200 ? "Forging your application..." : streamingContent}
              </div>
            </div>
          )}

          {isGenerating && !streamingContent && (
            <div className="flex items-center gap-3 px-4 py-3">
              <Loader2 size={16} className="animate-spin text-primary" />
              <span className="text-sm font-medium animate-subtle-pulse text-muted-foreground">
                The family is working on it...
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <Separator className="bg-border/50" />

      {/* Input Area — v0-style chat input */}
      <form onSubmit={handleSubmit} className="p-3">
        <div className={cn(
          "relative rounded-xl border border-border bg-secondary/40",
          "transition-all focus-within:border-primary/40 focus-within:shadow-[0_0_0_1px_var(--primary)]"
        )}>
          <div className="overflow-y-auto">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => { setInput(e.target.value); adjustHeight(); }}
              onKeyDown={handleKeyDown}
              placeholder={
                isWeb3 ? "Describe your dApp..."
                : isAI ? "Describe your AI app..."
                : isWeb5 ? "Describe your Web5 app..."
                : "What do you want to build?"
              }
              rows={1}
              disabled={isGenerating}
              className={cn(
                "w-full px-4 py-3 resize-none bg-transparent text-sm text-foreground",
                "outline-none focus:outline-none",
                "placeholder:text-muted-foreground/50",
                "min-h-[44px] max-h-[160px]",
                "disabled:opacity-50"
              )}
              style={{ overflow: "hidden" }}
            />
          </div>

          <div className="flex items-center justify-end p-2 pt-0">
            <Button
              type="submit"
              size="icon-sm"
              disabled={!input.trim() || isGenerating}
              className={cn(
                "rounded-lg transition-all",
                input.trim() ? "bg-primary text-primary-foreground shadow-md" : "bg-muted text-muted-foreground"
              )}
            >
              {isGenerating ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <ArrowUp size={14} />
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
