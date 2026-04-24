"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Sparkles } from "lucide-react";
import type { Message } from "@/lib/types";

interface ChatPanelProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isGenerating: boolean;
  streamingContent: string;
}

export default function ChatPanel({
  messages,
  onSendMessage,
  isGenerating,
  streamingContent,
}: ChatPanelProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
        className="flex items-center gap-2 px-4 py-3 border-b"
        style={{ borderColor: "var(--panel-border)" }}
      >
        <Sparkles size={18} style={{ color: "var(--accent)" }} />
        <span className="font-semibold text-sm">Chat</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !isGenerating && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: "var(--accent)" }}
            >
              <Sparkles size={28} className="text-white" />
            </div>
            <h2 className="text-xl font-bold mb-2">Welcome to IFTribe.AI</h2>
            <p className="text-sm" style={{ color: "var(--tab-inactive)" }}>
              Describe the app you want to build and I&apos;ll generate it for you
              with a live preview.
            </p>
            <div className="mt-6 space-y-2 w-full max-w-sm">
              {[
                "Build a todo app with drag and drop",
                "Create a weather dashboard",
                "Make a calculator with history",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setInput(suggestion);
                    textareaRef.current?.focus();
                  }}
                  className="w-full text-left px-4 py-2.5 rounded-lg text-sm transition-colors cursor-pointer"
                  style={{
                    background: "var(--input-bg)",
                    border: "1px solid var(--input-border)",
                  }}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span
                className="text-xs font-medium"
                style={{
                  color:
                    msg.role === "user"
                      ? "var(--accent)"
                      : "var(--accent-hover)",
                }}
              >
                {msg.role === "user" ? "You" : "IFTribe.AI"}
              </span>
            </div>
            <div
              className="rounded-lg px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap"
              style={{
                background:
                  msg.role === "user" ? "var(--user-msg)" : "var(--ai-msg)",
              }}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {isGenerating && streamingContent && (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span
                className="text-xs font-medium"
                style={{ color: "var(--accent-hover)" }}
              >
                IFTribe.AI
              </span>
              <Loader2
                size={12}
                className="animate-spin"
                style={{ color: "var(--accent)" }}
              />
            </div>
            <div
              className="rounded-lg px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap"
              style={{ background: "var(--ai-msg)" }}
            >
              {streamingContent.length > 200
                ? "Generating code..."
                : streamingContent}
            </div>
          </div>
        )}

        {isGenerating && !streamingContent && (
          <div className="flex items-center gap-2 px-4 py-3">
            <Loader2
              size={16}
              className="animate-spin"
              style={{ color: "var(--accent)" }}
            />
            <span className="text-sm" style={{ color: "var(--tab-inactive)" }}>
              Thinking...
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="p-4 border-t"
        style={{ borderColor: "var(--panel-border)" }}
      >
        <div
          className="flex items-end gap-2 rounded-xl p-2"
          style={{
            background: "var(--input-bg)",
            border: "1px solid var(--input-border)",
          }}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe the app you want to build..."
            rows={1}
            className="flex-1 bg-transparent text-sm resize-none outline-none placeholder-gray-500 px-2 py-1.5"
            style={{ color: "var(--foreground)" }}
            disabled={isGenerating}
          />
          <button
            type="submit"
            disabled={!input.trim() || isGenerating}
            className="p-2 rounded-lg transition-colors disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
            style={{ background: "var(--accent)" }}
          >
            {isGenerating ? (
              <Loader2 size={16} className="animate-spin text-white" />
            ) : (
              <Send size={16} className="text-white" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
