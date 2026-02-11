"use client";

import { memo, useState, useCallback } from "react";
import {
  EdgeProps,
  getBezierPath,
  EdgeLabelRenderer,
  BaseEdge,
} from "reactflow";
import { cn } from "@/lib/utils";
import { useCanvasStore } from "@/stores/canvas-store";

export const LabeledEdge = memo(function LabeledEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}: EdgeProps<{ label?: string }>) {
  const { updateEdge } = useCanvasStore();
  const [isEditing, setIsEditing] = useState(false);
  const [labelValue, setLabelValue] = useState(data?.label || "");

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const handleDoubleClick = useCallback(() => {
    setIsEditing(true);
    setLabelValue(data?.label || "");
  }, [data?.label]);

  const handleSubmit = useCallback(() => {
    if (labelValue.trim()) {
      updateEdge(id, { label: labelValue.trim() });
    }
    setIsEditing(false);
  }, [id, labelValue, updateEdge]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleSubmit();
      } else if (e.key === "Escape") {
        setIsEditing(false);
      }
    },
    [handleSubmit],
  );

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          strokeWidth: 2.5,
          stroke: "hsl(var(--foreground))",
          opacity: 0.7,
        }}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: "all",
          }}
          className="nodrag nopan"
          onDoubleClick={handleDoubleClick}
        >
          {isEditing ? (
            <input
              type="text"
              value={labelValue}
              onChange={(e) => setLabelValue(e.target.value)}
              onBlur={handleSubmit}
              onKeyDown={handleKeyDown}
              className="px-2 py-0.5 text-[10px] bg-card border border-primary rounded text-foreground focus:outline-none min-w-[60px]"
              autoFocus
            />
          ) : (
            <div
              className={cn(
                "px-2 py-0.5 text-[10px] font-medium rounded cursor-pointer",
                "bg-card/90 border border-border text-foreground",
                "hover:bg-muted transition-colors",
              )}
            >
              {data?.label || "Click to add label"}
            </div>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
});
