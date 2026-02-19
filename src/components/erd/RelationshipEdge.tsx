import { memo, useState } from "react";
import {
  EdgeProps,
  getBezierPath,
  EdgeLabelRenderer,
  BaseEdge,
} from "@xyflow/react";

export type RelationshipEdgeData = {
  type: "one-to-one" | "one-to-many" | "many-to-many";
  label?: string;
  projectId: string;
  onDelete?: (id: string) => void;
  onTypeChange?: (id: string, type: "one-to-one" | "one-to-many" | "many-to-many") => void;
};

const CARDINALITY = {
  "one-to-one": { source: "1", target: "1" },
  "one-to-many": { source: "1", target: "∞" },
  "many-to-many": { source: "∞", target: "∞" },
};

// Crow's foot notation markers
// For "one" side: single perpendicular line
// For "many" side: crow's foot (three lines)
const getMarkerPath = (cardinality: "one" | "many") => {
  if (cardinality === "one") {
    // Single perpendicular line
    return "M 0,-6 L 0,6";
  } else {
    // Crow's foot - three lines forming a fork
    return "M 0,0 L -8,-6 M 0,0 L -8,0 M 0,0 L -8,6";
  }
};

export const RelationshipEdge = memo(
  ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    data,
    selected,
  }: EdgeProps) => {
    const edgeData = (data || {}) as RelationshipEdgeData;
    const { type = "one-to-many", label, onDelete, onTypeChange } = edgeData;
    const [showTypeMenu, setShowTypeMenu] = useState(false);
    const cardinality = CARDINALITY[type] || CARDINALITY["one-to-many"];

    const [edgePath, labelX, labelY] = getBezierPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
    });

    // Use CSS variable for color - will work in both light and dark mode
    const primaryColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--primary')
      .trim();

    // Determine marker types based on relationship type
    // Source is the parent (where the FK originates from)
    // Target is the child (where the FK points to)
    let sourceMarkerType: "one" | "many" | null = null;
    let targetMarkerType: "one" | "many" | null = null;

    switch (type) {
      case "one-to-one":
        // Parent has one, child has one
        sourceMarkerType = "one";
        targetMarkerType = "one";
        break;
      case "one-to-many":
        // Parent has one, child has many
        sourceMarkerType = "one";
        targetMarkerType = "many";
        break;
      case "many-to-many":
        // Both sides have many (junction table relationship)
        sourceMarkerType = "many";
        targetMarkerType = "many";
        break;
    }

    const handleTypeChange = (newType: "one-to-one" | "one-to-many" | "many-to-many") => {
      if (onTypeChange) {
        onTypeChange(id, newType);
      }
      setShowTypeMenu(false);
    };

    return (
      <>
        <defs>
          {/* Source marker (parent side) */}
          {sourceMarkerType && (
            <marker
              id={`marker-source-${id}`}
              markerWidth="16"
              markerHeight="16"
              refX="0"
              refY="0"
              orient="auto-start-reverse"
            >
              <path
                d={getMarkerPath(sourceMarkerType)}
                stroke={primaryColor || "#f97316"}
                strokeWidth="1.5"
                fill="none"
              />
            </marker>
          )}

          {/* Target marker (child side) */}
          {targetMarkerType && (
            <marker
              id={`marker-target-${id}`}
              markerWidth="16"
              markerHeight="16"
              refX="0"
              refY="0"
              orient="auto"
            >
              <path
                d={getMarkerPath(targetMarkerType)}
                stroke={primaryColor || "#f97316"}
                strokeWidth="1.5"
                fill="none"
              />
            </marker>
          )}
        </defs>

        <BaseEdge
          id={id}
          path={edgePath}
          markerStart={sourceMarkerType ? `url(#marker-source-${id})` : undefined}
          markerEnd={targetMarkerType ? `url(#marker-target-${id})` : undefined}
          style={{
            stroke: primaryColor || "#f97316",
            strokeWidth: selected ? 2.5 : 1.5,
            opacity: selected ? 1 : 0.7,
          }}
        />
        <EdgeLabelRenderer>
          {/* Center label with type selector */}
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: "all",
              zIndex: 10,
            }}
          >
            <div className="flex items-center gap-1">
              {selected && (
                <div className="flex items-center gap-1">
                  <div className="relative">
                    <button
                      onClick={() => setShowTypeMenu(!showTypeMenu)}
                      className="px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 border transition-all hover:opacity-80"
                      style={{
                        background: "var(--card)",
                        borderColor: "var(--border)",
                        color: "var(--primary)",
                      }}
                    >
                      {label || type}
                      <span className="text-[8px]">▼</span>
                    </button>

                    {showTypeMenu && (
                      <div
                        className="absolute top-full mt-1 left-0 rounded-lg border shadow-lg overflow-hidden min-w-[140px] z-50"
                        style={{
                          background: "var(--card)",
                          borderColor: "var(--border)",
                        }}
                      >
                        {(["one-to-one", "one-to-many", "many-to-many"] as const).map((t) => (
                          <button
                            key={t}
                            onClick={() => handleTypeChange(t)}
                            className="w-full px-3 py-2 text-left text-xs transition-all hover:bg-accent"
                            style={{
                              background: type === t ? "var(--accent)" : "transparent",
                              color: "var(--foreground)",
                            }}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {onDelete && (
                    <button
                      onClick={() => onDelete(id)}
                      className="px-1.5 py-0.5 rounded-full text-[10px] border transition-all hover:opacity-80"
                      style={{
                        background: "var(--card)",
                        borderColor: "var(--border)",
                        color: "var(--destructive)",
                      }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Source cardinality (parent side) */}
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${sourceX + (targetX > sourceX ? 20 : -20)}px,${sourceY}px)`,
              pointerEvents: "none",
              zIndex: 10,
            }}
          >
            <span
              className="text-[11px] font-bold"
              style={{ color: "var(--primary)", opacity: 0.8 }}
            >
              {cardinality.source}
            </span>
          </div>

          {/* Target cardinality (child side) */}
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${targetX + (targetX > sourceX ? -20 : 20)}px,${targetY}px)`,
              pointerEvents: "none",
              zIndex: 10,
            }}
          >
            <span
              className="text-[11px] font-bold"
              style={{ color: "var(--primary)", opacity: 0.8 }}
            >
              {cardinality.target}
            </span>
          </div>
        </EdgeLabelRenderer>
      </>
    );
  },
);

RelationshipEdge.displayName = "RelationshipEdge";
