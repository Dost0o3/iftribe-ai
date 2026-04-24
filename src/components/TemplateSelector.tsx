"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Framework, ProjectTemplate } from "@/lib/types";
import { FRAMEWORKS, TEMPLATES } from "@/lib/types";
import { cn } from "@/lib/utils";

interface TemplateSelectorProps {
  onSelect: (framework: Framework, template: ProjectTemplate) => void;
  onClose: () => void;
}

type CategoryFilter = "all" | "web2" | "web3" | "saas" | "social" | "ai" | "web5";

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
    { id: "ai", label: "AI / Web4", icon: "🤖" },
    { id: "web5", label: "Web5", icon: "🆔" },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(12px)" }}
    >
      <Card
        className="w-full max-w-3xl max-h-[80vh] flex flex-col border-border/30 bg-card shadow-2xl"
        style={{ boxShadow: "var(--shadow-lg), var(--shadow-glow)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <div>
            <h2 className="text-xl font-bold text-shimmer">New Project</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Choose your stack and template</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X size={16} />
          </Button>
        </div>

        {/* Framework selector */}
        <div className="px-6 pb-3">
          <label className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground mb-2 block">
            Framework
          </label>
          <div className="flex flex-wrap gap-2">
            {FRAMEWORKS.map((fw) => (
              <Button
                key={fw.id}
                variant={selectedFramework === fw.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFramework(fw.id)}
                className={cn(
                  "gap-1.5 cursor-pointer transition-all",
                  selectedFramework === fw.id && "shadow-md"
                )}
              >
                <span>{fw.icon}</span>
                {fw.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Category filter tabs */}
        <div className="px-6 pb-3">
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className={cn(
                  "flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer",
                  categoryFilter === cat.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                )}
              >
                <span className="text-[11px]">{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Template grid */}
        <ScrollArea className="flex-1 px-6 pb-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredTemplates.map((tmpl) => (
              <button
                key={tmpl.id}
                onClick={() => onSelect(selectedFramework, tmpl.id)}
                className={cn(
                  "flex flex-col items-start p-4 rounded-xl text-left",
                  "bg-secondary/60 hover:bg-secondary border border-transparent hover:border-primary/30",
                  "transition-all duration-200 cursor-pointer",
                  "hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5"
                )}
              >
                <span className="text-2xl mb-2">{tmpl.icon}</span>
                <span className="text-sm font-semibold text-foreground">{tmpl.name}</span>
                <span className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{tmpl.description}</span>
                <Badge variant="secondary" className="mt-2 text-[9px] uppercase tracking-wider">
                  {tmpl.category}
                </Badge>
              </button>
            ))}
          </div>
          {filteredTemplates.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-sm text-muted-foreground">No templates available for this combination</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Try selecting a different framework or category</p>
            </div>
          )}
        </ScrollArea>
      </Card>
    </div>
  );
}
