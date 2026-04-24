"use client";

import { useState } from "react";
import { Save, RotateCcw, FileCode } from "lucide-react";

interface CodeEditorInnerProps {
  filePath: string;
  content: string;
  onSave: (path: string, content: string) => void;
}

function CodeEditorInner({ filePath, content, onSave }: CodeEditorInnerProps) {
  const [editedContent, setEditedContent] = useState(content);
  const hasChanges = editedContent !== content;

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setEditedContent(e.target.value);
  }

  function handleSave() {
    onSave(filePath, editedContent);
  }

  function handleReset() {
    setEditedContent(content);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && e.key === "s") {
      e.preventDefault();
      handleSave();
    }
    if (e.key === "Tab") {
      e.preventDefault();
      const target = e.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const value = editedContent;
      setEditedContent(value.substring(0, start) + "  " + value.substring(end));
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      }, 0);
    }
  }

  return (
    <div className="flex flex-col h-full" style={{ background: "var(--surface-matte)" }}>
      {/* Toolbar */}
      <div
        className="flex items-center justify-between px-3 py-2"
        style={{
          borderBottom: "1px solid var(--panel-border)",
          background: "var(--panel-bg-elevated)",
        }}
      >
        <div className="flex items-center gap-2">
          <FileCode size={12} style={{ color: "var(--accent-dim)" }} />
          <span
            className="text-xs font-mono"
            style={{ color: "var(--text-muted)" }}
          >
            {filePath}
          </span>
          {hasChanges && (
            <div
              className="w-2 h-2 rounded-full"
              style={{
                background: "var(--accent)",
                boxShadow: "0 0 4px var(--accent-glow-strong)",
              }}
            />
          )}
        </div>
        <div className="flex items-center gap-1">
          {hasChanges && (
            <>
              <button
                onClick={handleReset}
                className="flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-all cursor-pointer btn-3d"
                style={{
                  color: "var(--text-muted)",
                  background: "var(--panel-bg)",
                }}
                title="Discard changes"
              >
                <RotateCcw size={11} />
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-1 px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer btn-3d"
                style={{
                  background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-dim) 100%)",
                  color: "#000",
                }}
                title="Save (Ctrl+S)"
              >
                <Save size={11} />
                Save
              </button>
            </>
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 relative">
        <textarea
          value={editedContent}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className="absolute inset-0 w-full h-full resize-none p-4 font-mono text-sm leading-6 outline-none"
          style={{
            background: "var(--surface-matte)",
            color: "var(--text-primary)",
            tabSize: 2,
          }}
          spellCheck={false}
        />
      </div>
    </div>
  );
}

interface CodeEditorProps {
  filePath: string;
  content: string;
  onSave: (path: string, content: string) => void;
}

export default function CodeEditor({ filePath, content, onSave }: CodeEditorProps) {
  return (
    <CodeEditorInner
      key={`${filePath}:${content}`}
      filePath={filePath}
      content={content}
      onSave={onSave}
    />
  );
}
