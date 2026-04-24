"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Zap, Briefcase } from "lucide-react";
import Image from "next/image";
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
};

export default function ChatPanel({
  messages,
  onSendMessage,
  isGenerating,
  streamingContent,
  framework,
}: ChatPanelProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isWeb3 = framework.startsWith("web3");
  const currentSuggestions = isWeb3 ? SUGGESTIONS.web3 : SUGGESTIONS.default;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 150) + "px";
    }
  }, [input]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isGenerating) return;
    onSendMessage(trimmed);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }

  return (
    <div className="flex flex-col h-full" style={{ background: "var(--panel-bg)" }}>
      {/* Header */}
      <div
        className="flex items-center gap-2.5 px-4 py-3"
        style={{
          background: "linear-gradient(180deg, var(--panel-bg-elevated) 0%, var(--panel-bg) 100%)",
          borderBottom: "1px solid var(--panel-border)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <div
          className="w-6 h-6 rounded-md flex items-center justify-center"
          style={{
            background: "var(--accent-glow)",
            border: "1px solid var(--accent-dim)",
          }}
        >
          <Briefcase size={12} style={{ color: "var(--accent)" }} />
        </div>
        <span
          className="font-bold text-xs tracking-[0.15em] uppercase"
          style={{ color: "var(--text-secondary)" }}
        >
          Command Center
        </span>
        {isWeb3 && (
          <span
            className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full"
            style={{
              background: "var(--accent-glow)",
              color: "var(--accent)",
              border: "1px solid var(--panel-border)",
            }}
          >
            Web3
          </span>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !isGenerating && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div
              className="mb-5 bronze-glow rounded-xl overflow-hidden"
              style={{ boxShadow: "var(--shadow-lg), var(--shadow-glow)" }}
            >
              <Image
                src="/logo.png"
                alt="IFTribe.AI"
                width={200}
                height={70}
                className="object-contain"
                preload
              />
            </div>
            <p
              className="text-[10px] tracking-[0.3em] uppercase mb-1 font-semibold"
              style={{ color: "var(--accent-dim)" }}
            >
              {isWeb3 ? "Web3 App Builder" : "The Don of App Building"}
            </p>
            <p className="text-sm mt-2 max-w-xs" style={{ color: "var(--text-muted)" }}>
              {isWeb3
                ? "Describe the dApp you want — DeFi, NFTs, DAOs, wallets, and more."
                : "Make an offer I can\u0027t refuse \u2014 describe the app you want built."}
            </p>

            <div className="mt-6 space-y-2.5 w-full max-w-sm">
              {currentSuggestions.map((suggestion) => (
                <button
                  key={suggestion.text}
                  onClick={() => {
                    setInput(suggestion.text);
                    textareaRef.current?.focus();
                  }}
                  className="w-full flex items-center gap-3 text-left px-4 py-3 rounded-xl text-sm transition-all cursor-pointer btn-3d embossed-plate"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <span className="text-base">{suggestion.icon}</span>
                  <span>{suggestion.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              {msg.role === "user" ? (
                <div
                  className="w-5 h-5 rounded flex items-center justify-center"
                  style={{
                    background: "var(--accent-glow)",
                    border: "1px solid var(--accent-dim)",
                  }}
                >
                  <Zap size={10} style={{ color: "var(--accent)" }} />
                </div>
              ) : (
                <Image
                  src="/logo.png"
                  alt="IFTribe.AI"
                  width={20}
                  height={20}
                  className="rounded object-contain"
                />
              )}
              <span
                className="text-[10px] font-bold tracking-[0.15em] uppercase"
                style={{
                  color: msg.role === "user" ? "var(--accent)" : "var(--accent-hover)",
                }}
              >
                {msg.role === "user" ? "You" : "IFTribe.AI"}
              </span>
            </div>
            <div
              className="rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap"
              style={{
                background: msg.role === "user" ? "var(--user-msg)" : "var(--ai-msg)",
                border: "1px solid var(--panel-border)",
                boxShadow: "var(--shadow-sm)",
                color: "var(--text-primary)",
              }}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {isGenerating && streamingContent && (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="IFTribe.AI"
                width={20}
                height={20}
                className="rounded object-contain animate-subtle-pulse"
              />
              <span
                className="text-[10px] font-bold tracking-[0.15em] uppercase"
                style={{ color: "var(--accent-hover)" }}
              >
                IFTribe.AI
              </span>
              <Loader2
                size={10}
                className="animate-spin"
                style={{ color: "var(--accent)" }}
              />
            </div>
            <div
              className="rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap"
              style={{
                background: "var(--ai-msg)",
                border: "1px solid var(--panel-border)",
                boxShadow: "var(--shadow-sm)",
                color: "var(--text-primary)",
              }}
            >
              {streamingContent.length > 200
                ? "Forging your application..."
                : streamingContent}
            </div>
          </div>
        )}

        {isGenerating && !streamingContent && (
          <div className="flex items-center gap-3 px-4 py-3">
            <Loader2
              size={16}
              className="animate-spin"
              style={{ color: "var(--accent)" }}
            />
            <span className="text-sm font-medium animate-subtle-pulse" style={{ color: "var(--accent-dim)" }}>
              The family is working on it...
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form
        onSubmit={handleSubmit}
        className="p-4"
        style={{ borderTop: "1px solid var(--panel-border)" }}
      >
        <div
          className="flex items-end gap-2 rounded-xl p-2 transition-all"
          style={{
            background: "var(--input-bg)",
            border: "1px solid var(--input-border)",
            boxShadow: "var(--shadow-inset)",
          }}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isWeb3 ? "Describe your dApp..." : "Make me an offer... describe your app"}
            rows={1}
            className="flex-1 bg-transparent text-sm resize-none outline-none px-2 py-1.5"
            style={{ color: "var(--text-primary)" }}
            disabled={isGenerating}
          />
          <button
            type="submit"
            disabled={!input.trim() || isGenerating}
            className="p-2.5 rounded-lg transition-all disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed btn-3d"
            style={{
              background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-dim) 100%)",
            }}
          >
            {isGenerating ? (
              <Loader2 size={16} className="animate-spin text-black" />
            ) : (
              <Send size={16} className="text-black" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
