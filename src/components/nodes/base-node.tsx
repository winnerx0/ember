"use client";

import { memo, useState, useCallback } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CATEGORY_CONFIGS,
  getImplementationById,
} from "@/lib/constants/implementations";
import { useCanvasStore } from "@/stores/canvas-store";
import type { NodeData, NodeCategory } from "@/lib/types";

// Health Status Colors
const healthStatusColors = {
  healthy: "bg-green-500",
  degraded: "bg-yellow-500",
  down: "bg-red-500",
};

export const BaseNode = memo(function BaseNode({
  id,
  data,
  selected,
  fanOutCount = 0, // Add fanOutCount prop with default value
}: NodeProps<NodeData> & { fanOutCount?: number }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(data.label);
  const { updateNode, deleteNode, highlightedNodes, isObservabilityMode, nodeMetrics } = useCanvasStore();

  const isHighlighted = highlightedNodes.has(id);
  const metrics = nodeMetrics.get(id);

  const category = data.category as NodeCategory;
  const config = CATEGORY_CONFIGS[category] || CATEGORY_CONFIGS.service;

  // Determine bottleneck style
  let bottleneckStyle = "";
  if (isObservabilityMode && metrics) {
    if (metrics.errorRate > 5 || metrics.latency > 500) {
      bottleneckStyle = "ring-4 ring-red-500 ring-opacity-75"; // High severity
    } else if (metrics.errorRate > 1 || metrics.latency > 200) {
      bottleneckStyle = "ring-4 ring-yellow-500 ring-opacity-75"; // Medium severity
    }
  }

  // Fix: Ensure we pass a string ID to getImplementationById
  const implementationId =
    typeof data.implementation === "string"
      ? data.implementation
      : data.implementation?.id;

  const implementation = implementationId
    ? getImplementationById(implementationId)
    : null;

  // Get icon component
  const iconName = implementation?.icon || config.icon;
  const Icon = LucideIcons[
    iconName as keyof typeof LucideIcons
  ] as React.ComponentType<{ className?: string }>;

  // Handle double-click to edit
  const handleDoubleClick = useCallback(() => {
    setIsEditing(true);
    setEditValue(data.label);
  }, [data.label]);

  // Handle edit submit
  const handleEditSubmit = useCallback(() => {
    if (editValue.trim()) {
      updateNode(id, { label: editValue.trim() });
    }
    setIsEditing(false);
  }, [id, editValue, updateNode]);

  // Handle key press
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleEditSubmit();
      } else if (e.key === "Escape") {
        setIsEditing(false);
        setEditValue(data.label);
      }
    },
    [handleEditSubmit, data.label],
  );

  // Handle delete
  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      deleteNode(id);
    },
    [id, deleteNode],
  );

  return (
    <div
      className={cn(
        "min-w-[200px] max-w-[300px] rounded-lg border p-3",
        "bg-card/95 backdrop-blur-sm",
        selected ? "scale-[1.02] border-primary" : "border-border/50",
        isHighlighted && "ring-4 ring-red-500 ring-opacity-75", // Analysis Highlight style
        bottleneckStyle, // Observability bottleneck style
        config.bgColor,
      )}
      onDoubleClick={handleDoubleClick}
    >
      {selected && (
        <button
          onClick={handleDelete}
          className="absolute -top-2 -right-2 p-1.5 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-all hover:scale-110 z-10"
        >
          <LucideIcons.X className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Health Status Indicator */}
      {data.healthStatus && !isObservabilityMode && (
        <div
          className={cn(
            "absolute -top-1.5 -left-1.5 w-3 h-3 rounded-full border-2 border-background",
            healthStatusColors[data.healthStatus],
          )}
        />
      )}

      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center border shadow-sm",
            config.bgColor,
            config.borderColor,
          )}
        >
          {Icon && <Icon className={cn("w-5 h-5", config.color)} />}
        </div>

        <div className="flex-1 min-w-0">
          {/* Title - Editable */}
          {isEditing ? (
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleEditSubmit}
              onKeyDown={handleKeyDown}
              className="w-full bg-transparent border-b border-primary text-foreground font-semibold text-sm focus:outline-none p-0"
              autoFocus
            />
          ) : (
            <h3 className="font-semibold text-sm text-foreground leading-tight truncate">
              {data.label}
            </h3>
          )}

          {/* Tech Stack */}
          {data.techStack && (
            <p className="text-xs text-muted-foreground mt-1">{data.techStack}</p>
          )}
        </div>
      </div>

      {/* Badges */}
      <div className="mt-2 flex items-center flex-wrap gap-1.5">
        {implementation && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-background/50 border border-border text-muted-foreground">
            {implementation.name}
          </span>
        )}
        {typeof fanOutCount === 'number' && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary-foreground">
            Fan-out: {fanOutCount}
          </span>
        )}
      </div>

      {/* Observability Metrics Overlay */}
      {isObservabilityMode && metrics && (
        <div className="mt-2 text-xs text-muted-foreground space-y-0.5">
          <p>Req/s: {metrics.requestRate.toFixed(1)}</p>
          <p>Err%: {metrics.errorRate.toFixed(1)}</p>
          <p>Latency: {metrics.latency.toFixed(1)}ms</p>
        </div>
      )}

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Top}
        className={cn(
          "w-3 h-3 !bg-muted-foreground/50 !border-2 !border-background shadow-sm",
          "hover:!bg-primary hover:scale-125 transition-all",
        )}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className={cn(
          "w-3 h-3 !bg-muted-foreground/50 !border-2 !border-background shadow-sm",
          "hover:!bg-primary hover:scale-125 transition-all",
        )}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className={cn(
          "w-3 h-3 !bg-muted-foreground/50 !border-2 !border-background shadow-sm",
          "hover:!bg-primary hover:scale-125 transition-all",
        )}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className={cn(
          "w-3 h-3 !bg-muted-foreground/50 !border-2 !border-background shadow-sm",
          "hover:!bg-primary hover:scale-125 transition-all",
        )}
      />
    </div>
  );
});
