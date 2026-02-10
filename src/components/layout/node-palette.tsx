"use client";

import { DragEvent, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CATEGORY_CONFIGS,
  IMPLEMENTATIONS,
} from "@/lib/constants/implementations";
import type { NodeCategory } from "@/lib/types";
import { ModeToggle } from "@/components/mode-toggle";

interface DraggableNodeProps {
  category: NodeCategory;
  label: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
}

function DraggableNode({
  category,
  label,
  icon,
  color,
  bgColor,
  borderColor,
  description,
}: DraggableNodeProps) {
  const Icon = LucideIcons[
    icon as keyof typeof LucideIcons
  ] as React.ComponentType<{ className?: string }>;

  const onDragStart = (event: DragEvent<HTMLDivElement>) => {
    event.dataTransfer.setData("application/reactflow", category);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className={cn(
        "group relative cursor-grab active:cursor-grabbing rounded-lg border-2 p-3 transition-all duration-200",
        "hover:shadow-md hover:scale-105",
        borderColor,
        bgColor,
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center",
            bgColor,
            borderColor,
            "border",
          )}
        >
          {Icon && <Icon className={cn("w-4 h-4", color)} />}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm text-foreground truncate">
            {label}
          </h4>
          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

interface NodePaletteProps {
  onAddCustomElement?: () => void;
}

export function NodePalette({ onAddCustomElement }: NodePaletteProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const categories = Object.entries(CATEGORY_CONFIGS)
    .filter(([key]) => key !== "custom")
    .filter(
      ([_, config]) =>
        config.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        config.description.toLowerCase().includes(searchQuery.toLowerCase()),
    );

  return (
    <div className="w-80 h-full border-r border-border bg-background flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground">Components</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Drag to canvas to add
            </p>
          </div>
          <ModeToggle />
        </div>

        {/* Search */}
        <div className="relative">
          <LucideIcons.Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search components..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Custom Element Button */}
        <button
          onClick={onAddCustomElement}
          className="w-full py-2 px-3 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
        >
          <LucideIcons.Plus className="w-4 h-4" />
          Create Custom Element
        </button>
      </div>

      {/* Node List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {categories.map(([category, config]) => (
            <DraggableNode
              key={category}
              category={category as NodeCategory}
              label={config.label}
              icon={config.icon}
              color={config.color}
              bgColor={config.bgColor}
              borderColor={config.borderColor}
              description={config.description}
            />
          ))}

          {categories.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No components found matching "{searchQuery}"
            </div>
          )}
        </div>

        <Separator className="my-4" />

        {/* Implementation Info */}
        <div className="p-4 pb-8">
          <h3 className="text-sm font-semibold text-foreground mb-2">
            Available Implementations
          </h3>
          <div className="space-y-3 text-xs text-muted-foreground">
            {Object.entries(IMPLEMENTATIONS)
              .slice(0, 5)
              .map(([category, impls]) => (
                <div key={category}>
                  <div className="font-medium text-foreground mb-1">
                    {CATEGORY_CONFIGS[category as NodeCategory]?.label}
                  </div>
                  <div className="space-y-0.5 pl-2">
                    {impls.map((impl) => (
                      <div key={impl.id}>• {impl.name}</div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
