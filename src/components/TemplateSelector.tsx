"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { Framework, ProjectTemplate } from "@/lib/types";
import { FRAMEWORKS, TEMPLATES } from "@/lib/types";

interface TemplateSelectorProps {
  onSelect: (framework: Framework, template: ProjectTemplate) => void;
  onClose: () => void;
}

type CategoryFilter = "all" | "web2" | "web3" | "saas" | "social";

export default function TemplateSelector({ onSelect, onClose }: TemplateSelectorProps) {
  const [selectedFramework, setSelectedFramework] = useState<Framework>("react");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");

  const filteredTemplates = TEMPLATES.filter((t) => {
    const matchesCategory = categoryFilter === "all" || t.category === categoryFilter;
    const matchesFramework = t.frameworks.includes(selectedFramework);
    return matchesCategory && matchesFramework;
  });

  const categories: { id: CategoryFilter; label: string; icon: string }[] = [
    { id: "all", label: "All", icon: "🌍" },
    { id: "web2", label: "Web2", icon: "🌐" },
    { id: "saas", label: "SaaS", icon: "📊" },
    { id: "social", label: "Social", icon: "📱" },
    { id: "web3", label: "Web3", icon: "⛓️" },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}
    >
      <div
        className="w-full max-w-3xl max-h-[80vh] rounded-2xl overflow-hidden flex flex-col embossed-plate"
        style={{ boxShadow: "var(--shadow-lg), var(--shadow-glow)" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{
            borderBottom: "1px solid var(--panel-border)",
            background: "var(--panel-bg-elevated)",
          }}
        >
          <div>
            <h2 className="text-lg font-bold text-shimmer">New Project</h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              Choose your stack and template
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg cursor-pointer btn-3d"
            style={{ background: "var(--panel-bg)", color: "var(--text-muted)" }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Framework Selector */}
        <div className="px-6 py-3" style={{ borderBottom: "1px solid var(--panel-border)" }}>
          <p
            className="text-[10px] font-bold tracking-[0.15em] uppercase mb-2"
            style={{ color: "var(--text-muted)" }}
          >
            Framework
          </p>
          <div className="flex gap-2 flex-wrap">
            {FRAMEWORKS.map((fw) => (
              <button
                key={fw.id}
                onClick={() => setSelectedFramework(fw.id)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer btn-3d"
                style={{
                  background: selectedFramework === fw.id
                    ? "var(--accent-glow-strong)"
                    : "var(--panel-bg)",
                  border: selectedFramework === fw.id
                    ? "1px solid var(--accent)"
                    : "1px solid var(--panel-border)",
                  color: selectedFramework === fw.id
                    ? "var(--accent)"
                    : "var(--text-secondary)",
                }}
              >
                <span>{fw.icon}</span>
                <span>{fw.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="px-6 py-2" style={{ borderBottom: "1px solid var(--panel-border)" }}>
          <div className="flex gap-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-all cursor-pointer"
                style={{
                  background: categoryFilter === cat.id ? "var(--accent-glow)" : "transparent",
                  color: categoryFilter === cat.id ? "var(--accent)" : "var(--text-muted)",
                }}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                No templates available for this combination.
              </p>
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                Try selecting a different framework or category.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filteredTemplates.map((tmpl) => (
                <button
                  key={tmpl.id}
                  onClick={() => onSelect(selectedFramework, tmpl.id)}
                  className="flex flex-col items-start p-4 rounded-xl text-left transition-all cursor-pointer btn-3d embossed-plate"
                >
                  <span className="text-2xl mb-2">{tmpl.icon}</span>
                  <span
                    className="text-sm font-semibold mb-1"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {tmpl.name}
                  </span>
                  <span className="text-[11px] leading-snug" style={{ color: "var(--text-muted)" }}>
                    {tmpl.description}
                  </span>
                  <span
                    className="mt-2 text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full"
                    style={{
                      background: "var(--accent-glow)",
                      color: "var(--accent-dim)",
                      border: "1px solid var(--panel-border)",
                    }}
                  >
                    {tmpl.category}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
