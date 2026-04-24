"use client";

import { useState } from "react";
import { Save, RotateCcw } from "lucide-react";

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
    <div className="flex flex-col h-full" style={{ background: "#1e1e1e" }}>
      {/* Toolbar */}
      <div
        className="flex items-center justify-between px-3 py-2 border-b"
        style={{ borderColor: "var(--panel-border)", background: "var(--panel-bg)" }}
      >
        <span className="text-xs font-mono" style={{ color: "var(--tab-inactive)" }}>
          {filePath}
        </span>
        <div className="flex items-center gap-1">
          {hasChanges && (
            <>
              <button
                onClick={handleReset}
                className="flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors cursor-pointer"
                style={{ color: "var(--tab-inactive)" }}
                title="Discard changes"
              >
                <RotateCcw size={12} />
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-1 px-2 py-1 rounded text-xs text-white transition-colors cursor-pointer"
                style={{ background: "var(--accent)" }}
                title="Save (Ctrl+S)"
              >
                <Save size={12} />
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
            background: "#1e1e1e",
            color: "#d4d4d4",
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
