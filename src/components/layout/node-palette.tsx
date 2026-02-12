"use client";

import { DragEvent, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  useSidebar,
} from "@/components/ui/sidebar";
import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CATEGORY_CONFIGS,
  IMPLEMENTATIONS,
} from "@/lib/constants/implementations";
import type { NodeCategory } from "@/lib/types";
import { ModeToggle } from "@/components/mode-toggle";
import { useCanvasStore } from "@/stores/canvas-store";

const SIDEBAR_WIDTH = "20rem";

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
    event.dataTransfer.setData("application/reactflow-label", label);
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
  const { toggleSidebar } = useSidebar();
  const { customElements, deleteCustomElement } = useCanvasStore();

  const categories = Object.entries(CATEGORY_CONFIGS)
    .filter(([key]) => key !== "custom")
    .filter(
      ([_, config]) =>
        config.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        config.description.toLowerCase().includes(searchQuery.toLowerCase()),
    );

  return (
    <Sidebar
      collapsible="offcanvas"
      className="border-r"
      style={{ "--sidebar-width": SIDEBAR_WIDTH } as React.CSSProperties}
    >
      <SidebarHeader className="border-b p-0">
        <div className="flex items-center justify-between px-4 py-3">
          <h2 className="text-lg font-semibold">Components</h2>
          <div className="flex items-center gap-2">
            <ModeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="h-8 w-8"
            >
              <LucideIcons.PanelLeftClose className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="px-4 pb-3">
          <div className="relative">
            <LucideIcons.Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search components..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Drag to Canvas</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="px-2 space-y-2">
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
                  No components found
                </div>
              )}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator className="my-4" />

        <SidebarGroup>
          <SidebarGroupLabel>Implementations</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="px-4 space-y-3 text-xs text-muted-foreground">
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
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Custom Elements Section */}
        {customElements.length > 0 && (
          <>
            <Separator className="my-4" />
            <SidebarGroup>
              <SidebarGroupLabel>Custom Elements</SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="px-2 space-y-2">
                  {customElements
                    .filter(
                      (el) =>
                        el.name
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase()) ||
                        el.description
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase()),
                    )
                    .map((element) => {
                      const config =
                        CATEGORY_CONFIGS[element.category as NodeCategory] ||
                        CATEGORY_CONFIGS.custom;
                      return (
                        <div key={element.id} className="relative group/custom">
                          <DraggableNode
                            category={element.category as NodeCategory}
                            label={element.name}
                            icon={element.icon}
                            color={config.color}
                            bgColor={config.bgColor}
                            borderColor={config.borderColor}
                            description={element.description}
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteCustomElement(element.id);
                            }}
                            className="absolute top-1.5 right-1.5 p-1 rounded-md bg-destructive/90 text-destructive-foreground opacity-0 group-hover/custom:opacity-100 transition-opacity hover:bg-destructive"
                            title="Remove custom element"
                          >
                            <LucideIcons.X className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })}
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <Button
          onClick={() => {
            console.log("Button clicked!");
            console.log("onAddCustomElement exists:", !!onAddCustomElement);
            if (onAddCustomElement) {
              onAddCustomElement();
            } else {
              console.error("onAddCustomElement is undefined!");
            }
          }}
          className="w-full"
          variant="outline"
        >
          <LucideIcons.Plus className="mr-2 h-4 w-4" />
          Create Custom Element
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
