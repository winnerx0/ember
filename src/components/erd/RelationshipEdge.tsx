import { memo, useState } from "react";
import {
  EdgeProps,
  getBezierPath,
  EdgeLabelRenderer,
  BaseEdge,
} from "@xyflow/react";

export type RelationshipEdgeData = {
  type: "one-to-one" | "one-to-many" | "many-to-one" | "many-to-many";
  label?: string;
  projectId: string;
  onDelete?: (id: string) => void;
  onTypeChange?: (
    id: string,
    type: "one-to-one" | "one-to-many" | "many-to-one" | "many-to-many",
  ) => void;
};

/**
 * Determine which side holds the FK based on relationship type.
 */
function getFKSides(type: string): {
  source: boolean;
  target: boolean;
  junction: boolean;
} {
  switch (type) {
    case "one-to-one":
      return { source: false, target: true, junction: false };
    case "one-to-many":
      return { source: false, target: true, junction: false };
    case "many-to-one":
      return { source: true, target: false, junction: false };
    case "many-to-many":
      return { source: false, target: false, junction: true };
    default:
      return { source: false, target: true, junction: false };
  }
}

/**
 * Get the unit direction vector pointing away from the node for a given handle position.
 */
function getHandleDirection(position: string): { dx: number; dy: number } {
  switch (position) {
    case "right":
      return { dx: 1, dy: 0 };
    case "left":
      return { dx: -1, dy: 0 };
    case "bottom":
      return { dx: 0, dy: 1 };
    case "top":
      return { dx: 0, dy: -1 };
    default:
      return { dx: 1, dy: 0 };
  }
}

const TYPE_LABELS: Record<string, string> = {
  "one-to-one": "1 : 1",
  "one-to-many": "1 : N",
  "many-to-one": "N : 1",
  "many-to-many": "N : N",
};

/**
 * Draw crow's foot marker lines at a connection point.
 *
 * @param cx      - x of the point on the edge (a small offset from the node)
 * @param cy      - y of that point
 * @param dx      - unit vector x from the node towards the interior of the edge
 * @param dy      - unit vector y from the node towards the interior of the edge
 * @param isMany  - whether to draw a crow's foot (many) or perpendicular line (one)
 * @param color   - stroke color
 * @param sw      - stroke width
 */
function CardinalityMarker({
  cx,
  cy,
  dx,
  dy,
  isMany,
  color,
  sw,
}: {
  cx: number;
  cy: number;
  dx: number;
  dy: number;
  isMany: boolean;
  color: string;
  sw: number;
}) {
  // Perpendicular direction
  const px = -dy;
  const py = dx;
  const SPREAD = 8; // how wide the perpendicular line / crow's foot is
  const DEPTH = 10; // how far back the crow's foot prongs reach

  if (isMany) {
    // Crow's foot: three prongs fanning out from (cx, cy) backwards
    const backX = cx - dx * DEPTH;
    const backY = cy - dy * DEPTH;
    const topX = backX + px * SPREAD;
    const topY = backY + py * SPREAD;
    const botX = backX - px * SPREAD;
    const botY = backY - py * SPREAD;

    return (
      <g>
        <line
          x1={cx}
          y1={cy}
          x2={topX}
          y2={topY}
          stroke={color}
          strokeWidth={sw}
          strokeLinecap="round"
        />
        <line
          x1={cx}
          y1={cy}
          x2={backX}
          y2={backY}
          stroke={color}
          strokeWidth={sw}
          strokeLinecap="round"
        />
        <line
          x1={cx}
          y1={cy}
          x2={botX}
          y2={botY}
          stroke={color}
          strokeWidth={sw}
          strokeLinecap="round"
        />
        {/* Small perpendicular bar behind the fork for clarity */}
        <line
          x1={backX + px * SPREAD}
          y1={backY + py * SPREAD}
          x2={backX - px * SPREAD}
          y2={backY - py * SPREAD}
          stroke={color}
          strokeWidth={sw}
          strokeLinecap="round"
          opacity={0.4}
        />
      </g>
    );
  } else {
    // "One" side: single perpendicular bar
    return (
      <line
        x1={cx + px * SPREAD}
        y1={cy + py * SPREAD}
        x2={cx - px * SPREAD}
        y2={cy - py * SPREAD}
        stroke={color}
        strokeWidth={sw}
        strokeLinecap="round"
      />
    );
  }
}

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
    const fkSides = getFKSides(type);

    const [edgePath, labelX, labelY] = getBezierPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
    });

    const edgeColor = selected ? "var(--primary)" : "var(--muted-foreground)";
    const strokeW = selected ? 2 : 1.5;
    const edgeOpacity = selected ? 1 : 0.55;

    const MARKER_OFFSET = 12; // px away from the node before drawing the marker
    const sourceDir = getHandleDirection(sourcePosition);
    const targetDir = getHandleDirection(targetPosition);
    const sourceIsMany = type === "many-to-one" || type === "many-to-many";
    const targetIsMany = type === "one-to-many" || type === "many-to-many";

    const handleTypeChange = (
      newType: "one-to-one" | "one-to-many" | "many-to-one" | "many-to-many",
    ) => {
      if (onTypeChange) {
        onTypeChange(id, newType);
      }
      setShowTypeMenu(false);
    };

    return (
      <>
        {/* Main edge path */}
        <BaseEdge
          id={id}
          path={edgePath}
          style={{
            stroke: edgeColor,
            strokeWidth: strokeW,
            opacity: edgeOpacity,
          }}
        />

        {/* Cardinality markers rendered in SVG space */}
        <CardinalityMarker
          cx={sourceX + sourceDir.dx * MARKER_OFFSET}
          cy={sourceY + sourceDir.dy * MARKER_OFFSET}
          dx={sourceDir.dx}
          dy={sourceDir.dy}
          isMany={sourceIsMany}
          color={edgeColor}
          sw={strokeW}
        />
        <CardinalityMarker
          cx={targetX + targetDir.dx * MARKER_OFFSET}
          cy={targetY + targetDir.dy * MARKER_OFFSET}
          dx={targetDir.dx}
          dy={targetDir.dy}
          isMany={targetIsMany}
          color={edgeColor}
          sw={strokeW}
        />

        <EdgeLabelRenderer>
          {/* Center label — type badge + controls */}
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: "all",
              zIndex: 10,
            }}
          >
            <div className="flex items-center gap-1.5">
              {/* Type badge */}
              <div
                className="relative px-2.5 py-1 rounded-full text-[10px] font-bold tracking-tight border cursor-pointer select-none"
                style={{
                  background: selected ? "var(--primary)" : "var(--card)",
                  color: selected
                    ? "var(--primary-foreground)"
                    : "var(--muted-foreground)",
                  borderColor: selected ? "var(--primary)" : "var(--border)",
                  opacity: selected ? 1 : 0.85,
                  boxShadow: selected
                    ? "0 2px 12px rgba(0,0,0,0.25)"
                    : "0 1px 4px rgba(0,0,0,0.15)",
                }}
                onClick={() => selected && setShowTypeMenu(!showTypeMenu)}
              >
                {label || TYPE_LABELS[type] || type}
                {selected && (
                  <span className="ml-1 text-[8px] opacity-60">▾</span>
                )}

                {/* Dropdown */}
                {selected && showTypeMenu && (
                  <div
                    className="absolute top-full mt-2 left-1/2 -translate-x-1/2 rounded-xl border overflow-hidden z-50"
                    style={{
                      background: "var(--card)",
                      borderColor: "var(--border)",
                      boxShadow: "0 12px 40px rgba(0,0,0,0.35)",
                      minWidth: 160,
                    }}
                  >
                    <div
                      className="px-3 py-1.5 text-[9px] uppercase tracking-widest font-bold border-b"
                      style={{
                        color: "var(--muted-foreground)",
                        borderColor: "var(--border)",
                      }}
                    >
                      Cardinality
                    </div>
                    {(
                      [
                        "one-to-one",
                        "one-to-many",
                        "many-to-one",
                        "many-to-many",
                      ] as const
                    ).map((t) => (
                      <button
                        key={t}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTypeChange(t);
                        }}
                        className="w-full px-3 py-2 text-left text-xs transition-colors flex items-center justify-between gap-3"
                        style={{
                          background:
                            type === t ? "var(--accent)" : "transparent",
                          color: "var(--foreground)",
                        }}
                      >
                        <span className="font-medium">{t}</span>
                        <span
                          className="text-[10px] font-mono px-1.5 py-0.5 rounded font-bold"
                          style={{
                            background:
                              type === t ? "var(--primary)" : "var(--muted)",
                            color:
                              type === t
                                ? "var(--primary-foreground)"
                                : "var(--muted-foreground)",
                          }}
                        >
                          {TYPE_LABELS[t]}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Delete button */}
              {selected && onDelete && (
                <button
                  onClick={() => onDelete(id)}
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] transition-all hover:scale-110 active:scale-95"
                  style={{
                    background: "var(--destructive)",
                    color: "#fff",
                    boxShadow: "0 2px 8px rgba(239,68,68,0.3)",
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Junction table hint for M:N */}
          {fkSides.junction && selected && (
            <div
              style={{
                position: "absolute",
                transform: `translate(-50%, 14px) translate(${labelX}px,${labelY}px)`,
                pointerEvents: "none",
                zIndex: 10,
              }}
            >
              <span
                className="text-[8px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap"
                style={{
                  color: "var(--chart-3)",
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                }}
              >
                needs junction table
              </span>
            </div>
          )}
        </EdgeLabelRenderer>
      </>
    );
  },
);

RelationshipEdge.displayName = "RelationshipEdge";
