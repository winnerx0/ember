"use client";

import { memo, useState, useCallback } from "react";
import {
  EdgeProps,
  getBezierPath,
  getStraightPath,
  getSmoothStepPath,
  EdgeLabelRenderer,
  BaseEdge,
} from "reactflow";
import { cn } from "@/lib/utils";
import { useCanvasStore } from "@/stores/canvas-store";

import { EdgeData } from "@/lib/types";

function useEdgePath(
  type: string | undefined,
  params: {
    sourceX: number;
    sourceY: number;
    sourcePosition: any;
    targetX: number;
    targetY: number;
    targetPosition: any;
  },
) {
  switch (type) {
    case "straight":
      return getStraightPath(params);
    case "step":
      return getSmoothStepPath({ ...params, borderRadius: 0 });
    case "smoothstep":
      return getSmoothStepPath(params);
    case "default":
    default:
      return getBezierPath(params);
  }
}

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
}: EdgeProps<EdgeData>) {
  const { updateEdge, edgeType, highlightedEdges } = useCanvasStore();
  const [isEditing, setIsEditing] = useState(false);
  const [labelValue, setLabelValue] = useState(data?.label || "");

  const isHighlighted = highlightedEdges.has(id);

  const [edgePath, labelX, labelY] = useEdgePath(edgeType, {
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
          strokeWidth: isHighlighted ? 4 : 2, // Thicker stroke for highlighted edges
          stroke: isHighlighted ? "hsl(var(--destructive))" : "hsl(var(--foreground))", // Red color for highlighted
          opacity: isHighlighted ? 1 : 0.7,
          strokeDasharray: data?.isAsync ? "5 5" : "none",
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
                "px-2 py-1 text-center text-[10px] font-medium rounded cursor-pointer",
                "bg-card/90 border border-border text-foreground",
                "hover:bg-muted transition-colors",
                isHighlighted && "bg-destructive/90 text-destructive-foreground border-destructive", // Highlight style
              )}
            >
              <div className="font-bold">{data?.label || "No label"}</div>
              {data?.communicationType && (
                <div className="text-muted-foreground">
                  {data.communicationType.toUpperCase()}
                  {data.isAsync ? " (Async)" : ""}
                </div>
              )}
               {data?.latency && (
                <div className="text-muted-foreground">{data.latency}ms</div>
              )}
            </div>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
});
