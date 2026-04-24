"use client";

import { useState } from "react";
import { X, Key, Cpu, Zap, Shield, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface SettingsPanelProps {
  onClose: () => void;
}

const MODELS = [
  { id: "claude-sonnet-4-20250514", name: "Claude Sonnet 4", badge: "Recommended", speed: "Fast" },
  { id: "claude-opus-4-20250514", name: "Claude Opus 4", badge: "Most Capable", speed: "Slower" },
  { id: "claude-3-5-haiku-20241022", name: "Claude 3.5 Haiku", badge: "Fastest", speed: "Ultra Fast" },
];

export default function SettingsPanel({ onClose }: SettingsPanelProps) {
  const [apiKey, setApiKey] = useState(() =>
    typeof window !== "undefined" ? localStorage.getItem("iftribe_api_key") ?? "" : ""
  );
  const [selectedModel, setSelectedModel] = useState(() =>
    typeof window !== "undefined" ? localStorage.getItem("iftribe_model") ?? "claude-sonnet-4-20250514" : "claude-sonnet-4-20250514"
  );
  const [maxTokens, setMaxTokens] = useState(() =>
    typeof window !== "undefined" ? parseInt(localStorage.getItem("iftribe_max_tokens") ?? "16384") : 16384
  );
  const [saved, setSaved] = useState(false);

  function handleSave() {
    localStorage.setItem("iftribe_api_key", apiKey);
    localStorage.setItem("iftribe_model", selectedModel);
    localStorage.setItem("iftribe_max_tokens", maxTokens.toString());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleClearData() {
    localStorage.removeItem("iftribe_api_key");
    localStorage.removeItem("iftribe_model");
    localStorage.removeItem("iftribe_max_tokens");
    localStorage.removeItem("iftribe_projects");
    setApiKey("");
    setSelectedModel("claude-sonnet-4-20250514");
    setMaxTokens(16384);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(12px)" }}
    >
      <Card
        className="w-full max-w-lg flex flex-col border-border/30 bg-card shadow-2xl"
        style={{ boxShadow: "var(--shadow-lg), var(--shadow-glow)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-primary" />
            <h2 className="text-lg font-bold text-shimmer">Settings</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X size={16} />
          </Button>
        </div>

        <Separator className="bg-border/50" />

        <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
          {/* API Key */}
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <Key size={12} className="text-primary" />
              <span className="text-xs font-bold tracking-[0.1em] uppercase text-muted-foreground">
                Anthropic API Key
              </span>
            </label>
            <Input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-ant-..."
              className="bg-secondary border-border/50 text-foreground placeholder:text-muted-foreground/50"
            />
            <p className="text-[10px] text-muted-foreground/70">
              Stored locally in your browser. Never sent to our servers.
            </p>
          </div>

          {/* Model Selector */}
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <Cpu size={12} className="text-primary" />
              <span className="text-xs font-bold tracking-[0.1em] uppercase text-muted-foreground">
                AI Model
              </span>
            </label>
            <div className="space-y-2">
              {MODELS.map((model) => (
                <button
                  key={model.id}
                  onClick={() => setSelectedModel(model.id)}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-all",
                    selectedModel === model.id
                      ? "bg-primary/15 border border-primary/40 shadow-sm"
                      : "bg-secondary/60 border border-transparent hover:bg-secondary hover:border-border/40"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-3 h-3 rounded-full transition-all",
                        selectedModel === model.id
                          ? "bg-primary shadow-[0_0_8px_var(--primary)]"
                          : "bg-muted"
                      )}
                    />
                    <span
                      className={cn(
                        "text-sm font-medium",
                        selectedModel === model.id ? "text-primary" : "text-muted-foreground"
                      )}
                    >
                      {model.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-[9px] uppercase tracking-wider">
                      {model.badge}
                    </Badge>
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Zap size={8} />
                      {model.speed}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Max Tokens */}
          <div className="space-y-2">
            <label className="text-xs font-bold tracking-[0.1em] uppercase text-muted-foreground">
              Max Output Tokens: {maxTokens.toLocaleString()}
            </label>
            <input
              type="range"
              min={4096}
              max={32768}
              step={4096}
              value={maxTokens}
              onChange={(e) => setMaxTokens(parseInt(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground/60">
              <span>4K (Fast)</span>
              <span>32K (Complex apps)</span>
            </div>
          </div>
        </div>

        <Separator className="bg-border/50" />

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4">
          <Button variant="ghost" size="sm" onClick={handleClearData} className="text-muted-foreground gap-1.5">
            <Trash2 size={11} />
            Clear All Data
          </Button>
          <Button onClick={handleSave} size="sm" className="gap-1.5">
            <Save size={11} />
            {saved ? "Saved!" : "Save Settings"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
