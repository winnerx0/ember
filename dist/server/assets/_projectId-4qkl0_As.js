import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { Handle, Position, getBezierPath, BaseEdge, EdgeLabelRenderer, ReactFlowProvider, useReactFlow, useNodesState, useEdgesState, addEdge, ReactFlow, Background, BackgroundVariant, Controls, MiniMap } from "@xyflow/react";
import { c as createSsrRpc, a as cn, L as Label, I as Input, B as Button, R as Route, b as clearSessionCookies, T as ThemeToggle, C as ConfirmModal } from "./router-rD2NrRvA.js";
import * as React from "react";
import { memo, useState, useEffect, useRef, useCallback } from "react";
import { nanoid } from "nanoid";
import { z } from "zod";
import { c as createServerFn } from "../server.js";
import { s as supabase } from "./supabase-9upaG8fM.js";
import { toast } from "sonner";
import "@tanstack/react-query";
import "clsx";
import "tailwind-merge";
import "class-variance-authority";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core";
import "node:async_hooks";
import "@tanstack/router-core/ssr/server";
import "h3-v2";
import "tiny-invariant";
import "seroval";
import "@tanstack/react-router/ssr/server";
import "@supabase/supabase-js";
import "@supabase/ssr";
const addTable = createServerFn({
  method: "POST"
}).inputValidator(z.object({
  projectId: z.string(),
  name: z.string(),
  color: z.string(),
  positionX: z.number(),
  positionY: z.number()
})).handler(createSsrRpc("9f3591552cd5e37328a63e295f233b095dba2494d628446d804fb1b7a5c4ec75"));
const updateTable = createServerFn({
  method: "POST"
}).inputValidator(z.object({
  id: z.string(),
  projectId: z.string(),
  name: z.string().optional(),
  color: z.string().optional()
})).handler(createSsrRpc("e28ba7ed4f93954c9b8ed7cc711a7758d7b2f5919a12fc34011f281e0bfcf22a"));
const deleteTable = createServerFn({
  method: "POST"
}).inputValidator(z.object({
  id: z.string(),
  projectId: z.string()
})).handler(createSsrRpc("06b3be462e99b83664173521250b7d37727a2b0daecd7420b719c9fdd0f91d25"));
const saveNodePositions = createServerFn({
  method: "POST"
}).inputValidator(z.object({
  projectId: z.string(),
  nodes: z.array(z.object({
    id: z.string(),
    positionX: z.number(),
    positionY: z.number()
  }))
})).handler(createSsrRpc("142c5bccf32e890a2ebd2a0b39aa09e35def82403b965f8a2015dce75ccdd69b"));
const saveColumns = createServerFn({
  method: "POST"
}).inputValidator(z.object({
  tableId: z.string(),
  projectId: z.string(),
  columns: z.array(z.object({
    id: z.string(),
    name: z.string(),
    type: z.string(),
    nullable: z.boolean(),
    isPrimary: z.boolean(),
    isUnique: z.boolean(),
    defaultValue: z.string().optional(),
    order: z.number()
  }))
})).handler(createSsrRpc("f1f7d63a0ede53dd53af980cac9f4135a56de345c948383ed39062aca8096776"));
const addRelationship = createServerFn({
  method: "POST"
}).inputValidator(z.object({
  sourceTableId: z.string(),
  targetTableId: z.string(),
  sourceColumnId: z.string(),
  targetColumnId: z.string(),
  type: z.enum(["one-to-one", "one-to-many", "many-to-one", "many-to-many"])
})).handler(createSsrRpc("981ce0898eb85af859bfbd2a7094d57e619c32085e51290d8956b8bee1dbf266"));
const updateRelationship = createServerFn({
  method: "POST"
}).inputValidator(z.object({
  id: z.string(),
  projectId: z.string(),
  type: z.enum(["one-to-one", "one-to-many", "many-to-one", "many-to-many"]),
  label: z.string().optional()
})).handler(createSsrRpc("a3d4328b3a11a1e9408eea7ad16303f96e3aea5eeff419a92f5992e93d713b3b"));
const deleteRelationship = createServerFn({
  method: "POST"
}).inputValidator(z.object({
  id: z.string(),
  projectId: z.string()
})).handler(createSsrRpc("760f61dd91c43d5debcd16b0fb3389a01eb26db53e209591fba09deff78a1639"));
const TYPE_COLORS = {
  uuid: "var(--chart-1)",
  text: "var(--chart-2)",
  varchar: "var(--chart-2)",
  integer: "var(--chart-4)",
  bigint: "var(--chart-4)",
  serial: "var(--chart-4)",
  bigserial: "var(--chart-4)",
  boolean: "var(--chart-5)",
  timestamp: "var(--chart-3)",
  timestamptz: "var(--chart-3)",
  date: "var(--chart-3)",
  jsonb: "var(--primary)",
  json: "var(--primary)",
  numeric: "var(--chart-4)",
  real: "var(--chart-4)"
};
function getTypeColor(type) {
  return TYPE_COLORS[type.toLowerCase()] || "var(--muted-foreground)";
}
function shortType(type) {
  const map = {
    "double precision": "float8",
    "character varying": "varchar",
    timestamptz: "timestamptz",
    timestamp: "timestamp"
  };
  return map[type] || type;
}
const TableNode = memo(({ data, selected }) => {
  const nodeData = data;
  const { color, name, columns = [], onSelect, onDelete } = nodeData;
  const [hovered, setHovered] = useState(false);
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: "rounded-xl overflow-hidden transition-all duration-200",
      style: {
        minWidth: 220,
        maxWidth: 280,
        background: "var(--card)",
        border: `1px solid ${selected ? color : hovered ? color + "60" : "var(--border)"}`,
        boxShadow: selected ? `0 0 0 2px ${color}40, 0 8px 32px rgba(0,0,0,0.4)` : hovered ? `0 4px 20px rgba(0,0,0,0.3)` : `0 2px 8px rgba(0,0,0,0.2)`
      },
      onMouseEnter: () => setHovered(true),
      onMouseLeave: () => setHovered(false),
      children: [
        /* @__PURE__ */ jsxs(
          "div",
          {
            className: "flex items-center gap-2 px-3 py-2.5 cursor-pointer",
            style: {
              background: `linear-gradient(135deg, ${color}20, ${color}08)`,
              borderBottom: `1px solid ${color}25`
            },
            onClick: () => onSelect?.(nodeData.id),
            children: [
              /* @__PURE__ */ jsx(
                "div",
                {
                  className: "w-2.5 h-2.5 rounded-full flex-shrink-0",
                  style: { background: color, boxShadow: `0 0 6px ${color}80` }
                }
              ),
              /* @__PURE__ */ jsx(
                "span",
                {
                  className: "font-bold text-sm flex-1 truncate",
                  style: { color },
                  children: name
                }
              ),
              /* @__PURE__ */ jsx("div", { className: "flex items-center gap-1 opacity-0 group-hover:opacity-100", children: (hovered || selected) && /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    className: "p-1 rounded transition-all text-xs",
                    style: { color: "var(--muted-foreground)" },
                    onClick: (e) => {
                      e.stopPropagation();
                      onSelect?.(nodeData.id);
                    },
                    title: "Edit table",
                    children: "✎"
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    className: "p-1 rounded text-red-400 hover:bg-red-500/10 transition-all text-xs",
                    onClick: (e) => {
                      e.stopPropagation();
                      onDelete?.(nodeData.id);
                    },
                    title: "Delete table",
                    children: "✕"
                  }
                )
              ] }) })
            ]
          }
        ),
        /* @__PURE__ */ jsx("div", { children: columns.length === 0 ? /* @__PURE__ */ jsx("div", { className: "px-3 py-3 text-xs italic text-center", style: { color: "var(--muted-foreground)" }, children: "No columns — click to add" }) : columns.map((col, idx) => {
          const isForeignKey = col.name.endsWith("_id") && !col.isPrimary;
          return /* @__PURE__ */ jsxs("div", { className: "relative table-node-column group/col", children: [
            /* @__PURE__ */ jsx("div", { className: "w-6 flex-shrink-0 flex items-center justify-center", children: col.isPrimary ? /* @__PURE__ */ jsx("span", { className: "text-yellow-400 text-[9px] font-black", children: "PK" }) : isForeignKey ? /* @__PURE__ */ jsx("span", { className: "text-blue-400 text-[9px] font-black", children: "FK" }) : col.isUnique ? /* @__PURE__ */ jsx("span", { className: "text-purple-400 text-[9px] font-bold", children: "UQ" }) : /* @__PURE__ */ jsx("span", { className: "text-[9px]", style: { color: "var(--muted-foreground)" }, children: "—" }) }),
            /* @__PURE__ */ jsx("span", { className: "text-[10px] mr-1", style: { color: "var(--muted-foreground)" }, children: col.nullable ? "○" : "#" }),
            /* @__PURE__ */ jsx("span", { className: "flex-1 text-xs truncate", style: { color: "var(--card-foreground)" }, children: col.name }),
            /* @__PURE__ */ jsx(
              "span",
              {
                className: "text-[9px] font-mono px-1.5 py-0.5 rounded",
                style: {
                  color: getTypeColor(col.type),
                  background: `${getTypeColor(col.type)}15`
                },
                children: shortType(col.type)
              }
            )
          ] }, col.id);
        }) }),
        /* @__PURE__ */ jsx(
          Handle,
          {
            type: "target",
            position: Position.Left,
            id: `${nodeData.id}-table-target`,
            style: {
              top: "50%",
              left: -5,
              opacity: hovered ? 1 : 0,
              transition: "opacity 0.15s"
            }
          }
        ),
        /* @__PURE__ */ jsx(
          Handle,
          {
            type: "source",
            position: Position.Right,
            id: `${nodeData.id}-table-source`,
            style: {
              top: "50%",
              right: -5,
              opacity: hovered ? 1 : 0,
              transition: "opacity 0.15s"
            }
          }
        )
      ]
    }
  );
});
TableNode.displayName = "TableNode";
function getFKSides(type) {
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
function getHandleDirection(position) {
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
const TYPE_LABELS = {
  "one-to-one": "1 : 1",
  "one-to-many": "1 : N",
  "many-to-one": "N : 1",
  "many-to-many": "N : N"
};
function CardinalityMarker({
  cx,
  cy,
  dx,
  dy,
  isMany,
  color,
  sw
}) {
  const px = -dy;
  const py = dx;
  const SPREAD = 8;
  const DEPTH = 10;
  if (isMany) {
    const backX = cx - dx * DEPTH;
    const backY = cy - dy * DEPTH;
    const topX = backX + px * SPREAD;
    const topY = backY + py * SPREAD;
    const botX = backX - px * SPREAD;
    const botY = backY - py * SPREAD;
    return /* @__PURE__ */ jsxs("g", { children: [
      /* @__PURE__ */ jsx(
        "line",
        {
          x1: cx,
          y1: cy,
          x2: topX,
          y2: topY,
          stroke: color,
          strokeWidth: sw,
          strokeLinecap: "round"
        }
      ),
      /* @__PURE__ */ jsx(
        "line",
        {
          x1: cx,
          y1: cy,
          x2: backX,
          y2: backY,
          stroke: color,
          strokeWidth: sw,
          strokeLinecap: "round"
        }
      ),
      /* @__PURE__ */ jsx(
        "line",
        {
          x1: cx,
          y1: cy,
          x2: botX,
          y2: botY,
          stroke: color,
          strokeWidth: sw,
          strokeLinecap: "round"
        }
      ),
      /* @__PURE__ */ jsx(
        "line",
        {
          x1: backX + px * SPREAD,
          y1: backY + py * SPREAD,
          x2: backX - px * SPREAD,
          y2: backY - py * SPREAD,
          stroke: color,
          strokeWidth: sw,
          strokeLinecap: "round",
          opacity: 0.4
        }
      )
    ] });
  } else {
    return /* @__PURE__ */ jsx(
      "line",
      {
        x1: cx + px * SPREAD,
        y1: cy + py * SPREAD,
        x2: cx - px * SPREAD,
        y2: cy - py * SPREAD,
        stroke: color,
        strokeWidth: sw,
        strokeLinecap: "round"
      }
    );
  }
}
const RelationshipEdge = memo(
  ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    data,
    selected
  }) => {
    const edgeData = data || {};
    const { type = "one-to-many", label, onDelete, onTypeChange } = edgeData;
    const [showTypeMenu, setShowTypeMenu] = useState(false);
    const fkSides = getFKSides(type);
    const [edgePath, labelX, labelY] = getBezierPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition
    });
    const edgeColor = selected ? "var(--primary)" : "var(--muted-foreground)";
    const strokeW = selected ? 2 : 1.5;
    const edgeOpacity = selected ? 1 : 0.55;
    const MARKER_OFFSET = 12;
    const sourceDir = getHandleDirection(sourcePosition);
    const targetDir = getHandleDirection(targetPosition);
    const sourceIsMany = type === "many-to-one" || type === "many-to-many";
    const targetIsMany = type === "one-to-many" || type === "many-to-many";
    const handleTypeChange = (newType) => {
      if (onTypeChange) {
        onTypeChange(id, newType);
      }
      setShowTypeMenu(false);
    };
    return /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(
        BaseEdge,
        {
          id,
          path: edgePath,
          style: {
            stroke: edgeColor,
            strokeWidth: strokeW,
            opacity: edgeOpacity
          }
        }
      ),
      /* @__PURE__ */ jsx(
        CardinalityMarker,
        {
          cx: sourceX + sourceDir.dx * MARKER_OFFSET,
          cy: sourceY + sourceDir.dy * MARKER_OFFSET,
          dx: sourceDir.dx,
          dy: sourceDir.dy,
          isMany: sourceIsMany,
          color: edgeColor,
          sw: strokeW
        }
      ),
      /* @__PURE__ */ jsx(
        CardinalityMarker,
        {
          cx: targetX + targetDir.dx * MARKER_OFFSET,
          cy: targetY + targetDir.dy * MARKER_OFFSET,
          dx: targetDir.dx,
          dy: targetDir.dy,
          isMany: targetIsMany,
          color: edgeColor,
          sw: strokeW
        }
      ),
      /* @__PURE__ */ jsxs(EdgeLabelRenderer, { children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            style: {
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: "all",
              zIndex: 10
            },
            children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsxs(
                "div",
                {
                  className: "relative px-2.5 py-1 rounded-full text-[10px] font-bold tracking-tight border cursor-pointer select-none",
                  style: {
                    background: selected ? "var(--primary)" : "var(--card)",
                    color: selected ? "var(--primary-foreground)" : "var(--muted-foreground)",
                    borderColor: selected ? "var(--primary)" : "var(--border)",
                    opacity: selected ? 1 : 0.85,
                    boxShadow: selected ? "0 2px 12px rgba(0,0,0,0.25)" : "0 1px 4px rgba(0,0,0,0.15)"
                  },
                  onClick: () => selected && setShowTypeMenu(!showTypeMenu),
                  children: [
                    label || TYPE_LABELS[type] || type,
                    selected && /* @__PURE__ */ jsx("span", { className: "ml-1 text-[8px] opacity-60", children: "▾" }),
                    selected && showTypeMenu && /* @__PURE__ */ jsxs(
                      "div",
                      {
                        className: "absolute top-full mt-2 left-1/2 -translate-x-1/2 rounded-xl border overflow-hidden z-50",
                        style: {
                          background: "var(--card)",
                          borderColor: "var(--border)",
                          boxShadow: "0 12px 40px rgba(0,0,0,0.35)",
                          minWidth: 160
                        },
                        children: [
                          /* @__PURE__ */ jsx(
                            "div",
                            {
                              className: "px-3 py-1.5 text-[9px] uppercase tracking-widest font-bold border-b",
                              style: {
                                color: "var(--muted-foreground)",
                                borderColor: "var(--border)"
                              },
                              children: "Cardinality"
                            }
                          ),
                          [
                            "one-to-one",
                            "one-to-many",
                            "many-to-one",
                            "many-to-many"
                          ].map((t) => /* @__PURE__ */ jsxs(
                            "button",
                            {
                              onClick: (e) => {
                                e.stopPropagation();
                                handleTypeChange(t);
                              },
                              className: "w-full px-3 py-2 text-left text-xs transition-colors flex items-center justify-between gap-3",
                              style: {
                                background: type === t ? "var(--accent)" : "transparent",
                                color: "var(--foreground)"
                              },
                              children: [
                                /* @__PURE__ */ jsx("span", { className: "font-medium", children: t }),
                                /* @__PURE__ */ jsx(
                                  "span",
                                  {
                                    className: "text-[10px] font-mono px-1.5 py-0.5 rounded font-bold",
                                    style: {
                                      background: type === t ? "var(--primary)" : "var(--muted)",
                                      color: type === t ? "var(--primary-foreground)" : "var(--muted-foreground)"
                                    },
                                    children: TYPE_LABELS[t]
                                  }
                                )
                              ]
                            },
                            t
                          ))
                        ]
                      }
                    )
                  ]
                }
              ),
              selected && onDelete && /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => onDelete(id),
                  className: "w-5 h-5 rounded-full flex items-center justify-center text-[9px] transition-all hover:scale-110 active:scale-95",
                  style: {
                    background: "var(--destructive)",
                    color: "#fff",
                    boxShadow: "0 2px 8px rgba(239,68,68,0.3)"
                  },
                  children: "✕"
                }
              )
            ] })
          }
        ),
        fkSides.junction && selected && /* @__PURE__ */ jsx(
          "div",
          {
            style: {
              position: "absolute",
              transform: `translate(-50%, 14px) translate(${labelX}px,${labelY}px)`,
              pointerEvents: "none",
              zIndex: 10
            },
            children: /* @__PURE__ */ jsx(
              "span",
              {
                className: "text-[8px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap",
                style: {
                  color: "var(--chart-3)",
                  background: "var(--card)",
                  border: "1px solid var(--border)"
                },
                children: "needs junction table"
              }
            )
          }
        )
      ] })
    ] });
  }
);
RelationshipEdge.displayName = "RelationshipEdge";
const SelectContext = React.createContext(
  void 0
);
const useSelectContext = () => {
  const context = React.useContext(SelectContext);
  if (!context) {
    throw new Error("Select components must be used within a Select");
  }
  return context;
};
const Select = ({ value, onValueChange, children }) => {
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef(null);
  return /* @__PURE__ */ jsx(SelectContext.Provider, { value: { value, onValueChange, open, setOpen, triggerRef }, children: /* @__PURE__ */ jsx("div", { className: "relative", children }) });
};
const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => {
  const { open, setOpen, triggerRef } = useSelectContext();
  return /* @__PURE__ */ jsxs(
    "button",
    {
      ref: triggerRef,
      type: "button",
      onClick: () => setOpen(!open),
      className: cn(
        "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        className
      ),
      ...props,
      children: [
        children,
        /* @__PURE__ */ jsx(
          "svg",
          {
            width: "15",
            height: "15",
            viewBox: "0 0 15 15",
            fill: "none",
            xmlns: "http://www.w3.org/2000/svg",
            className: "h-4 w-4 opacity-50",
            children: /* @__PURE__ */ jsx(
              "path",
              {
                d: "M4.93179 5.43179C4.75605 5.60753 4.75605 5.89245 4.93179 6.06819C5.10753 6.24392 5.39245 6.24392 5.56819 6.06819L7.49999 4.13638L9.43179 6.06819C9.60753 6.24392 9.89245 6.24392 10.0682 6.06819C10.2439 5.89245 10.2439 5.60753 10.0682 5.43179L7.81819 3.18179C7.73379 3.0974 7.61933 3.04999 7.49999 3.04999C7.38064 3.04999 7.26618 3.0974 7.18179 3.18179L4.93179 5.43179ZM10.0682 9.56819C10.2439 9.39245 10.2439 9.10753 10.0682 8.93179C9.89245 8.75606 9.60753 8.75606 9.43179 8.93179L7.49999 10.8636L5.56819 8.93179C5.39245 8.75606 5.10753 8.75606 4.93179 8.93179C4.75605 9.10753 4.75605 9.39245 4.93179 9.56819L7.18179 11.8182C7.26618 11.9026 7.38064 11.95 7.49999 11.95C7.61933 11.95 7.73379 11.9026 7.81819 11.8182L10.0682 9.56819Z",
                fill: "currentColor",
                fillRule: "evenodd",
                clipRule: "evenodd"
              }
            )
          }
        )
      ]
    }
  );
});
SelectTrigger.displayName = "SelectTrigger";
const SelectValue = React.forwardRef(({ className, placeholder, ...props }, ref) => {
  const { value } = useSelectContext();
  return /* @__PURE__ */ jsx("span", { ref, className: cn(className), ...props, children: value || placeholder });
});
SelectValue.displayName = "SelectValue";
const SelectContent = React.forwardRef(({ className, children, ...props }, ref) => {
  const { open, setOpen, triggerRef } = useSelectContext();
  const contentRef = React.useRef(null);
  const [position, setPosition] = React.useState({ top: 0, left: 0, width: 0 });
  React.useEffect(() => {
    if (open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  }, [open, triggerRef]);
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (contentRef.current && !contentRef.current.contains(event.target) && triggerRef.current && !triggerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, setOpen, triggerRef]);
  if (!open) return null;
  return /* @__PURE__ */ jsx(
    "div",
    {
      ref: contentRef,
      className: cn(
        "fixed z-50 mt-1 max-h-[300px] overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md",
        className
      ),
      style: {
        top: `${position.top}px`,
        left: `${position.left}px`,
        width: `${position.width}px`
      },
      ...props,
      children
    }
  );
});
SelectContent.displayName = "SelectContent";
const SelectItem = React.forwardRef(({ className, children, value, ...props }, ref) => {
  const { value: selectedValue, onValueChange, setOpen } = useSelectContext();
  const isSelected = selectedValue === value;
  return /* @__PURE__ */ jsx(
    "div",
    {
      ref,
      className: cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        isSelected && "bg-accent",
        className
      ),
      onClick: () => {
        onValueChange(value);
        setOpen(false);
      },
      ...props,
      children
    }
  );
});
SelectItem.displayName = "SelectItem";
const Checkbox = React.forwardRef(
  ({ className, ...props }, ref) => {
    return /* @__PURE__ */ jsx(
      "input",
      {
        type: "checkbox",
        className: cn(
          "peer h-4 w-4 shrink-0 rounded-sm border ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer transition-all",
          "border-input hover:border-primary/50",
          "checked:bg-primary checked:border-primary",
          "focus-visible:ring-ring",
          className
        ),
        style: {
          accentColor: "var(--primary)"
        },
        ref,
        ...props
      }
    );
  }
);
Checkbox.displayName = "Checkbox";
const PG_TYPES = [
  "uuid",
  "serial",
  "bigserial",
  "integer",
  "bigint",
  "smallint",
  "numeric",
  "real",
  "double precision",
  "boolean",
  "text",
  "varchar",
  "char",
  "date",
  "timestamp",
  "timestamptz",
  "json",
  "jsonb",
  "bytea"
];
const TABLE_COLORS$1 = [
  "var(--chart-1)",
  // Blue - default
  "var(--chart-2)",
  // Teal
  "var(--chart-3)",
  // Green
  "var(--chart-4)",
  // Orange
  "var(--chart-5)"
  // Purple
];
function ColumnEditor({ table, relationships = [], onSave, onClose }) {
  const [name, setName] = useState(table.name);
  const [color, setColor] = useState(table.color);
  const [columns, setColumns] = useState(
    table.columns.length > 0 ? table.columns : [
      {
        id: nanoid(),
        name: "id",
        type: "uuid",
        isPrimary: true,
        isUnique: false,
        nullable: false,
        defaultValue: "gen_random_uuid()",
        order: 0
      }
    ]
  );
  const [saving, setSaving] = useState(false);
  const getFKInfo = (columnName) => {
    const asTarget = relationships.find(
      (rel) => {
        if ((rel.type === "one-to-many" || rel.type === "one-to-one") && rel.targetTableId === table.id) {
          const expectedFKName = `${rel.sourceTableName}_id`;
          return columnName === expectedFKName;
        }
        if (rel.type === "many-to-one" && rel.sourceTableId === table.id) {
          const expectedFKName = `${rel.targetTableName}_id`;
          return columnName === expectedFKName;
        }
        return false;
      }
    );
    if (asTarget) {
      const referencedTable = asTarget.type === "many-to-one" ? asTarget.targetTableName : asTarget.sourceTableName;
      return { isFK: true, referencesTable: referencedTable, direction: "references" };
    }
    return { isFK: false, referencesTable: null, direction: null };
  };
  const addColumn = () => {
    setColumns((prev) => [
      ...prev,
      {
        id: nanoid(),
        name: "",
        type: "text",
        isPrimary: false,
        isUnique: false,
        nullable: true,
        defaultValue: "",
        order: prev.length
      }
    ]);
  };
  const removeColumn = (id) => {
    setColumns((prev) => prev.filter((c) => c.id !== id));
  };
  const updateColumn = (id, field, value) => {
    setColumns(
      (prev) => prev.map((c) => {
        if (c.id !== id) return c;
        const updated = { ...c, [field]: value };
        if (field === "isPrimary" && value) {
          updated.nullable = false;
          updated.isUnique = false;
        }
        return updated;
      })
    );
  };
  const handleSave = async () => {
    setSaving(true);
    try {
      const sanitizedName = name.trim().replace(/\s+/g, "_");
      await onSave({
        name: sanitizedName,
        color,
        columns: columns.map((c, i) => ({ ...c, order: i }))
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: "fixed right-0 top-0 bottom-0 w-96 z-40 flex flex-col border-l overflow-hidden",
      style: { background: "var(--card)", borderColor: "var(--border)" },
      children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-5 py-4 border-b", style: { borderColor: "var(--border)" }, children: [
          /* @__PURE__ */ jsx("h3", { className: "font-bold text-base", style: { color: "var(--card-foreground)" }, children: "Edit Table" }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: onClose,
              className: "p-1.5 rounded-lg transition-all",
              style: { color: "var(--muted-foreground)" },
              children: "✕"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 overflow-y-auto p-5 space-y-5", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "table-name", className: "text-xs font-semibold uppercase tracking-wider", style: { color: "var(--muted-foreground)" }, children: "Table Name" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                id: "table-name",
                type: "text",
                value: name,
                onChange: (e) => setName(e.target.value)
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-xs font-semibold mb-2 uppercase tracking-wider", style: { color: "var(--muted-foreground)" }, children: "Color" }),
            /* @__PURE__ */ jsx("div", { className: "flex gap-2 flex-wrap", children: TABLE_COLORS$1.map((c) => /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => setColor(c),
                className: "w-7 h-7 rounded-lg transition-all hover:scale-110",
                style: {
                  background: c,
                  boxShadow: color === c ? `0 0 0 2px var(--border), 0 0 0 4px ${c}` : "none"
                }
              },
              c
            )) })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-3", children: [
              /* @__PURE__ */ jsxs(Label, { className: "text-xs font-semibold uppercase tracking-wider", style: { color: "var(--muted-foreground)" }, children: [
                "Columns (",
                columns.length,
                ")"
              ] }),
              /* @__PURE__ */ jsx(
                Button,
                {
                  onClick: addColumn,
                  variant: "outline",
                  size: "sm",
                  children: "+ Add"
                }
              )
            ] }),
            /* @__PURE__ */ jsx("div", { className: "space-y-2", children: columns.map((col, idx) => {
              const fkInfo = getFKInfo(col.name);
              return /* @__PURE__ */ jsxs(
                "div",
                {
                  className: "rounded-xl border overflow-hidden",
                  style: { background: "var(--accent)", borderColor: "var(--border)" },
                  children: [
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 px-3 py-2 border-b", style: { borderColor: "var(--border)" }, children: [
                      /* @__PURE__ */ jsx("span", { className: "text-xs w-4", style: { color: "var(--muted-foreground)" }, children: idx + 1 }),
                      /* @__PURE__ */ jsx(
                        Input,
                        {
                          type: "text",
                          value: col.name,
                          onChange: (e) => updateColumn(col.id, "name", e.target.value),
                          placeholder: "column_name",
                          className: "flex-1 h-7 text-sm border-0 bg-transparent px-0 focus-visible:ring-0"
                        }
                      ),
                      fkInfo.isFK && fkInfo.direction === "references" && /* @__PURE__ */ jsxs(
                        "span",
                        {
                          className: "text-[9px] px-2 py-0.5 rounded-full font-bold",
                          style: {
                            background: "rgba(96, 165, 250, 0.15)",
                            color: "#60a5fa",
                            border: "1px solid rgba(96, 165, 250, 0.3)"
                          },
                          title: `References ${fkInfo.referencesTable}`,
                          children: [
                            "FK → ",
                            fkInfo.referencesTable
                          ]
                        }
                      ),
                      /* @__PURE__ */ jsx(
                        Button,
                        {
                          onClick: () => removeColumn(col.id),
                          variant: "ghost",
                          size: "icon",
                          className: "h-6 w-6 text-red-400 hover:text-red-300",
                          children: "✕"
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "px-3 py-2 space-y-2", children: [
                      /* @__PURE__ */ jsxs(
                        Select,
                        {
                          value: col.type,
                          onValueChange: (value) => updateColumn(col.id, "type", value),
                          children: [
                            /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, {}) }),
                            /* @__PURE__ */ jsx(SelectContent, { children: PG_TYPES.map((t) => /* @__PURE__ */ jsx(SelectItem, { value: t, children: t }, t)) })
                          ]
                        }
                      ),
                      /* @__PURE__ */ jsxs("div", { className: "flex gap-3 flex-wrap", children: [
                        [
                          { key: "isPrimary", label: "PK" },
                          { key: "isUnique", label: "Unique" }
                        ].map(({ key, label }) => /* @__PURE__ */ jsxs(
                          "label",
                          {
                            className: "flex items-center gap-2 cursor-pointer",
                            children: [
                              /* @__PURE__ */ jsx(
                                Checkbox,
                                {
                                  checked: col[key],
                                  onChange: (e) => updateColumn(
                                    col.id,
                                    key,
                                    e.target.checked
                                  )
                                }
                              ),
                              /* @__PURE__ */ jsx("span", { className: "text-xs", style: { color: "var(--muted-foreground)" }, children: label })
                            ]
                          },
                          key
                        )),
                        /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 cursor-pointer", children: [
                          /* @__PURE__ */ jsx(
                            Checkbox,
                            {
                              checked: !col.nullable,
                              onChange: (e) => updateColumn(col.id, "nullable", !e.target.checked)
                            }
                          ),
                          /* @__PURE__ */ jsx("span", { className: "text-xs", style: { color: "var(--muted-foreground)" }, children: "Required" })
                        ] })
                      ] }),
                      /* @__PURE__ */ jsx(
                        Input,
                        {
                          type: "text",
                          value: col.defaultValue,
                          onChange: (e) => updateColumn(col.id, "defaultValue", e.target.value),
                          placeholder: "Default value (optional)",
                          className: "text-xs"
                        }
                      )
                    ] })
                  ]
                },
                col.id
              );
            }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "px-5 py-4 border-t flex gap-3", style: { borderColor: "var(--border)" }, children: [
          /* @__PURE__ */ jsx(
            Button,
            {
              onClick: onClose,
              variant: "outline",
              className: "flex-1",
              children: "Cancel"
            }
          ),
          /* @__PURE__ */ jsx(
            Button,
            {
              onClick: handleSave,
              disabled: !name.trim() || saving,
              className: "flex-1",
              children: saving ? "Saving..." : "Save Changes"
            }
          )
        ] })
      ]
    }
  );
}
const exportSQL = createServerFn({
  method: "GET"
}).inputValidator(z.object({
  projectId: z.string()
})).handler(createSsrRpc("a123ad1d907016675eb0c54288296093f35d718dce652176920e549a8bd5480a"));
function highlightSQL(sql) {
  return sql.replace(
    /\b(CREATE|TABLE|IF|NOT|EXISTS|ALTER|ADD|CONSTRAINT|FOREIGN|KEY|REFERENCES|PRIMARY|UNIQUE|DEFAULT|INDEX|ON)\b/g,
    '<span class="sql-keyword">$1</span>'
  ).replace(
    /\b(UUID|TEXT|VARCHAR|INTEGER|BIGINT|SMALLINT|SERIAL|BIGSERIAL|BOOLEAN|TIMESTAMP|TIMESTAMPTZ|DATE|JSON|JSONB|NUMERIC|REAL|BYTEA|CHAR)\b/g,
    '<span class="sql-type">$1</span>'
  ).replace(/(--[^\n]*)/g, '<span class="sql-comment">$1</span>').replace(/'([^']*)'/g, `<span class="sql-string">'$1'</span>`);
}
function ExportModal({ projectId, projectName, onClose }) {
  const [sql, setSql] = useState("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    exportSQL({ data: { projectId } }).then((result) => {
      setSql(result.sql);
    }).catch((err) => {
      setSql(`-- Error generating SQL: ${err.message}`);
    }).finally(() => setLoading(false));
  }, [projectId]);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2e3);
  };
  const handleDownload = () => {
    const blob = new Blob([sql], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${projectName.replace(/\s+/g, "_").toLowerCase()}.sql`;
    a.click();
    URL.revokeObjectURL(url);
  };
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: "fixed inset-0 z-50 flex items-center justify-center p-4",
      style: { background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" },
      onClick: (e) => e.target === e.currentTarget && onClose(),
      children: /* @__PURE__ */ jsxs(
        "div",
        {
          className: "w-full max-w-3xl rounded-2xl border flex flex-col overflow-hidden",
          style: { background: "var(--card)", borderColor: "var(--border)", maxHeight: "85vh" },
          children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-6 py-4 border-b", style: { borderColor: "var(--border)" }, children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("h2", { className: "font-bold text-lg", style: { color: "var(--card-foreground)" }, children: "Export SQL" }),
                /* @__PURE__ */ jsxs("p", { className: "text-xs mt-0.5", style: { color: "var(--muted-foreground)" }, children: [
                  "PostgreSQL DDL for",
                  " ",
                  /* @__PURE__ */ jsx("span", { style: { color: "var(--primary)" }, children: projectName })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx(
                  Button,
                  {
                    onClick: handleCopy,
                    disabled: loading || !sql,
                    variant: "outline",
                    size: "sm",
                    children: copied ? "✓ Copied!" : "Copy"
                  }
                ),
                /* @__PURE__ */ jsx(
                  Button,
                  {
                    onClick: handleDownload,
                    disabled: loading || !sql,
                    size: "sm",
                    children: "↓ Download .sql"
                  }
                ),
                /* @__PURE__ */ jsx(
                  Button,
                  {
                    onClick: onClose,
                    variant: "ghost",
                    size: "icon",
                    className: "h-8 w-8",
                    children: "✕"
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-auto p-6", children: loading ? /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center h-48", style: { color: "var(--muted-foreground)" }, children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsx("div", { className: "w-5 h-5 border-2 rounded-full animate-spin", style: { borderColor: "var(--border)", borderTopColor: "var(--primary)" } }),
              "Generating SQL..."
            ] }) }) : /* @__PURE__ */ jsx(
              "pre",
              {
                className: "sql-code whitespace-pre-wrap",
                style: { color: "var(--foreground)" },
                dangerouslySetInnerHTML: { __html: highlightSQL(sql) }
              }
            ) }),
            !loading && sql && /* @__PURE__ */ jsxs("div", { className: "px-6 py-3 border-t flex items-center gap-4 text-xs", style: { borderColor: "var(--border)", color: "var(--muted-foreground)" }, children: [
              /* @__PURE__ */ jsxs("span", { children: [
                sql.split("\n").length,
                " lines"
              ] }),
              /* @__PURE__ */ jsxs("span", { children: [
                sql.length,
                " characters"
              ] }),
              /* @__PURE__ */ jsx("span", { className: "ml-auto text-green-400", children: "✓ Valid PostgreSQL DDL" })
            ] })
          ]
        }
      )
    }
  );
}
const nodeTypes = {
  tableNode: TableNode
};
const edgeTypes = {
  relationship: RelationshipEdge
};
const TABLE_COLORS = [
  "var(--chart-1)",
  // Blue - default
  "var(--chart-2)",
  // Teal
  "var(--chart-3)",
  // Green
  "var(--chart-4)",
  // Orange
  "var(--chart-5)"
  // Purple
];
function ERDCanvas() {
  const project = Route.useLoaderData();
  const {
    projectId
  } = Route.useParams();
  const {
    fitView
  } = useReactFlow();
  const lsKey = `ember-${projectId}`;
  const savedNodes = typeof window !== "undefined" ? localStorage.getItem(`${lsKey}-nodes`) : null;
  const initialNodes = savedNodes ? JSON.parse(savedNodes) : project.tables.map((table) => ({
    id: table.id,
    type: "tableNode",
    position: {
      x: table.positionX,
      y: table.positionY
    },
    data: {
      id: table.id,
      name: table.name,
      color: table.color,
      projectId,
      columns: table.columns || []
    }
  }));
  const initialEdges = project.relationships.map((rel) => ({
    id: rel.id,
    source: rel.sourceTableId,
    target: rel.targetTableId,
    sourceHandle: `${rel.sourceTableId}-table-source`,
    targetHandle: `${rel.targetTableId}-table-target`,
    type: "relationship",
    data: {
      type: rel.type,
      label: rel.label,
      projectId
    }
  }));
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedTableId, setSelectedTableId] = useState(null);
  const [showExport, setShowExport] = useState(false);
  const [addingTable, setAddingTable] = useState(false);
  const [newTableName, setNewTableName] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    tableId: null,
    tableName: ""
  });
  const [user, setUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const saveTimer = useRef(null);
  const colorIdx = useRef(0);
  useEffect(() => {
    const getUser = async () => {
      const {
        data: {
          user: user2
        }
      } = await supabase.auth.getUser();
      setUser(user2);
      if (window.location.hash.includes("access_token")) {
        window.history.replaceState(null, "", window.location.pathname);
      }
    };
    getUser();
  }, []);
  useEffect(() => {
    setTimeout(() => fitView({
      padding: 0.2,
      duration: 500
    }), 100);
  }, []);
  useEffect(() => {
    const channel = supabase.channel(`erd_relationships:${projectId}`).on("postgres_changes", {
      event: "INSERT",
      schema: "public",
      table: "erd_relationships",
      filter: `source_table_id=in.(${nodes.map((n) => n.id).join(",")})`
    }, (payload) => {
      console.log("Relationship inserted:", payload);
      const newRel = payload.new;
      const edgeExists = edges.some((e) => e.id === newRel.id);
      if (edgeExists) return;
      const newEdge = {
        id: newRel.id,
        source: newRel.source_table_id,
        target: newRel.target_table_id,
        sourceHandle: `${newRel.source_table_id}-table-source`,
        targetHandle: `${newRel.target_table_id}-table-target`,
        type: "relationship",
        data: {
          type: newRel.type,
          label: newRel.label,
          projectId
        }
      };
      setEdges((eds) => [...eds, newEdge]);
      toast.info("Relationship added by collaborator");
    }).on("postgres_changes", {
      event: "UPDATE",
      schema: "public",
      table: "erd_relationships",
      filter: `source_table_id=in.(${nodes.map((n) => n.id).join(",")})`
    }, (payload) => {
      console.log("Relationship updated:", payload);
      const updatedRel = payload.new;
      setEdges((eds) => eds.map((e) => e.id === updatedRel.id ? {
        ...e,
        data: {
          ...e.data,
          type: updatedRel.type,
          label: updatedRel.label
        }
      } : e));
      toast.info("Relationship updated by collaborator");
    }).on("postgres_changes", {
      event: "DELETE",
      schema: "public",
      table: "erd_relationships"
    }, (payload) => {
      console.log("Relationship deleted:", payload);
      const deletedRel = payload.old;
      setEdges((eds) => eds.filter((e) => e.id !== deletedRel.id));
      toast.info("Relationship removed by collaborator");
    }).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, nodes, edges, setEdges]);
  useEffect(() => {
    const channel = supabase.channel(`erd_tables:${projectId}`).on("postgres_changes", {
      event: "INSERT",
      schema: "public",
      table: "erd_tables",
      filter: `project_id=eq.${projectId}`
    }, (payload) => {
      console.log("Table inserted:", payload);
      const newTable = payload.new;
      const nodeExists = nodes.some((n) => n.id === newTable.id);
      if (nodeExists) return;
      const newNode = {
        id: newTable.id,
        type: "tableNode",
        position: {
          x: newTable.position_x,
          y: newTable.position_y
        },
        data: {
          id: newTable.id,
          name: newTable.name,
          color: newTable.color,
          projectId,
          columns: []
        }
      };
      setNodes((nds) => [...nds, newNode]);
      toast.info(`Table "${newTable.name}" added by collaborator`);
    }).on("postgres_changes", {
      event: "UPDATE",
      schema: "public",
      table: "erd_tables",
      filter: `project_id=eq.${projectId}`
    }, (payload) => {
      console.log("Table updated:", payload);
      const updatedTable = payload.new;
      setNodes((nds) => nds.map((n) => n.id === updatedTable.id ? {
        ...n,
        position: {
          x: updatedTable.position_x,
          y: updatedTable.position_y
        },
        data: {
          ...n.data,
          name: updatedTable.name,
          color: updatedTable.color
        }
      } : n));
      toast.info(`Table "${updatedTable.name}" updated by collaborator`);
    }).on("postgres_changes", {
      event: "DELETE",
      schema: "public",
      table: "erd_tables"
    }, (payload) => {
      console.log("Table deleted:", payload);
      const deletedTable = payload.old;
      setNodes((nds) => nds.filter((n) => n.id !== deletedTable.id));
      toast.info(`Table "${deletedTable.name}" removed by collaborator`);
    }).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, nodes, setNodes]);
  useEffect(() => {
    const channel = supabase.channel(`erd_columns:${projectId}`).on("postgres_changes", {
      event: "INSERT",
      schema: "public",
      table: "erd_columns"
    }, (payload) => {
      console.log("Column inserted:", payload);
      const newColumn = payload.new;
      setNodes((nds) => nds.map((n) => {
        if (n.id === newColumn.table_id) {
          const tableData = n.data;
          const columnExists = tableData.columns?.some((c) => c.id === newColumn.id);
          if (columnExists) return n;
          const updatedColumns = [...tableData.columns || [], {
            id: newColumn.id,
            name: newColumn.name,
            type: newColumn.type,
            nullable: newColumn.nullable,
            isPrimary: newColumn.is_primary,
            isUnique: newColumn.is_unique,
            defaultValue: newColumn.default_value,
            order: newColumn.order
          }].sort((a, b) => a.order - b.order);
          return {
            ...n,
            data: {
              ...n.data,
              columns: updatedColumns
            }
          };
        }
        return n;
      }));
    }).on("postgres_changes", {
      event: "UPDATE",
      schema: "public",
      table: "erd_columns"
    }, (payload) => {
      console.log("Column updated:", payload);
      const updatedColumn = payload.new;
      setNodes((nds) => nds.map((n) => {
        if (n.id === updatedColumn.table_id) {
          const tableData = n.data;
          const updatedColumns = (tableData.columns || []).map((c) => c.id === updatedColumn.id ? {
            id: updatedColumn.id,
            name: updatedColumn.name,
            type: updatedColumn.type,
            nullable: updatedColumn.nullable,
            isPrimary: updatedColumn.is_primary,
            isUnique: updatedColumn.is_unique,
            defaultValue: updatedColumn.default_value,
            order: updatedColumn.order
          } : c).sort((a, b) => a.order - b.order);
          return {
            ...n,
            data: {
              ...n.data,
              columns: updatedColumns
            }
          };
        }
        return n;
      }));
    }).on("postgres_changes", {
      event: "DELETE",
      schema: "public",
      table: "erd_columns"
    }, (payload) => {
      console.log("Column deleted:", payload);
      const deletedColumn = payload.old;
      setNodes((nds) => nds.map((n) => {
        const tableData = n.data;
        const hasColumn = tableData.columns?.some((c) => c.id === deletedColumn.id);
        if (hasColumn) {
          const updatedColumns = (tableData.columns || []).filter((c) => c.id !== deletedColumn.id);
          return {
            ...n,
            data: {
              ...n.data,
              columns: updatedColumns
            }
          };
        }
        return n;
      }));
    }).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, nodes, setNodes]);
  const scheduleSave = useCallback((updatedNodes) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSaving(true);
      try {
        await saveNodePositions({
          data: {
            projectId,
            nodes: updatedNodes.map((n) => ({
              id: n.id,
              positionX: n.position.x,
              positionY: n.position.y
            }))
          }
        });
      } finally {
        setSaving(false);
      }
    }, 1e3);
  }, [projectId]);
  const handleNodesChange = useCallback((changes) => {
    onNodesChange(changes);
    const hasMoved = changes.some((c) => c.type === "position" && c.dragging === false);
    if (hasMoved) {
      setNodes((nds) => {
        scheduleSave(nds);
        return nds;
      });
    }
  }, [onNodesChange, scheduleSave]);
  const onConnect = useCallback(async (connection) => {
    if (!connection.source || !connection.target) return;
    const id = nanoid();
    const sourceNode = nodes.find((n) => n.id === connection.source);
    const targetNode = nodes.find((n) => n.id === connection.target);
    if (!sourceNode || !targetNode) return;
    const sourceTableData = sourceNode.data;
    const targetTableData = targetNode.data;
    const fkColumnName = `${sourceTableData.name}_id`;
    const fkExists = targetTableData.columns?.some((col) => col.name === fkColumnName);
    let updatedTargetColumns = targetTableData.columns || [];
    if (!fkExists) {
      const sourcePK2 = sourceTableData.columns?.find((col) => col.isPrimary);
      const fkType = sourcePK2?.type || "uuid";
      const newFkColumn = {
        id: nanoid(),
        name: fkColumnName,
        type: fkType,
        isPrimary: false,
        isUnique: false,
        nullable: false,
        defaultValue: null,
        order: updatedTargetColumns.length
      };
      updatedTargetColumns = [...updatedTargetColumns, newFkColumn];
      console.log("Adding FK:", fkColumnName, "to child table", targetTableData.name);
      setNodes((nds) => nds.map((n) => n.id === connection.target ? {
        ...n,
        data: {
          ...n.data,
          columns: [...updatedTargetColumns]
        }
      } : n));
      try {
        await saveColumns({
          data: {
            tableId: connection.target,
            projectId,
            columns: updatedTargetColumns.map((c, i) => ({
              id: c.id,
              name: c.name,
              type: c.type,
              nullable: c.nullable,
              isPrimary: c.isPrimary,
              isUnique: c.isUnique,
              defaultValue: c.defaultValue || void 0,
              order: i
            }))
          }
        });
      } catch (error) {
        console.error("Failed to save FK column:", error);
      }
    }
    const newEdge = {
      id,
      ...connection,
      type: "relationship",
      data: {
        type: "one-to-many",
        projectId
      }
    };
    setEdges((eds) => addEdge(newEdge, eds));
    const sourcePK = sourceTableData.columns?.find((col) => col.isPrimary);
    const targetFK = updatedTargetColumns.find((col) => col.name === fkColumnName);
    if (!sourcePK || !targetFK) {
      console.error("Missing source PK or target FK column");
      return;
    }
    await addRelationship({
      data: {
        sourceTableId: connection.source,
        targetTableId: connection.target,
        sourceColumnId: sourcePK.id,
        targetColumnId: targetFK.id,
        type: "one-to-many"
      }
    });
  }, [projectId, setEdges, nodes, setNodes]);
  const handleDeleteEdge = useCallback(async (edgeId) => {
    const edge = edges.find((e) => e.id === edgeId);
    if (edge) {
      const sourceNode = nodes.find((n) => n.id === edge.source);
      const targetNode = nodes.find((n) => n.id === edge.target);
      if (sourceNode && targetNode) {
        const sourceTableData = sourceNode.data;
        const targetTableData = targetNode.data;
        const fkColumnName = `${sourceTableData.name}_id`;
        const updatedColumns = (targetTableData.columns || []).filter((col) => col.name !== fkColumnName);
        setNodes((nds) => nds.map((n) => n.id === edge.target ? {
          ...n,
          data: {
            ...n.data,
            columns: [...updatedColumns]
          }
        } : n));
        try {
          await saveColumns({
            data: {
              tableId: edge.target,
              projectId,
              columns: updatedColumns.map((c, i) => ({
                id: c.id,
                name: c.name,
                type: c.type,
                nullable: c.nullable,
                isPrimary: c.isPrimary,
                isUnique: c.isUnique,
                defaultValue: c.defaultValue || void 0,
                order: i
              }))
            }
          });
        } catch (error) {
          console.error("Failed to remove FK column:", error);
        }
      }
    }
    setEdges((eds) => eds.filter((e) => e.id !== edgeId));
    await deleteRelationship({
      data: {
        id: edgeId,
        projectId
      }
    });
  }, [projectId, setEdges, edges, nodes, setNodes]);
  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut();
    await clearSessionCookies();
    window.location.href = "/";
  }, []);
  const handleUpdateEdgeType = useCallback(async (edgeId, newType) => {
    const edge = edges.find((e) => e.id === edgeId);
    if (!edge) return;
    const oldType = edge.data?.type || "one-to-many";
    const oldFKSide = oldType === "many-to-one" ? "source" : oldType === "many-to-many" ? "none" : "target";
    const newFKSide = newType === "many-to-one" ? "source" : newType === "many-to-many" ? "none" : "target";
    setEdges((eds) => eds.map((e) => e.id === edgeId ? {
      ...e,
      data: {
        ...e.data,
        type: newType
      }
    } : e));
    if (edge.source && edge.target) {
      const sourceNode = nodes.find((n) => n.id === edge.source);
      const targetNode = nodes.find((n) => n.id === edge.target);
      if (sourceNode && targetNode) {
        const sourceData = sourceNode.data;
        const targetData = targetNode.data;
        const sourcePK = sourceData.columns?.find((col) => col.isPrimary);
        const targetPK = targetData.columns?.find((col) => col.isPrimary);
        const sourceFKName = `${sourceData.name}_id`;
        const targetFKName = `${targetData.name}_id`;
        if (oldFKSide === "source") {
          const columnsWithoutFK = (sourceData.columns || []).filter((col) => col.name !== targetFKName);
          setNodes((nds) => nds.map((n) => n.id === edge.source ? {
            ...n,
            data: {
              ...n.data,
              columns: [...columnsWithoutFK]
            }
          } : n));
          await saveColumns({
            data: {
              tableId: edge.source,
              projectId,
              columns: columnsWithoutFK.map((c, i) => ({
                id: c.id,
                name: c.name,
                type: c.type,
                nullable: c.nullable,
                isPrimary: c.isPrimary,
                isUnique: c.isUnique,
                defaultValue: c.defaultValue || void 0,
                order: i
              }))
            }
          });
        } else if (oldFKSide === "target") {
          const columnsWithoutFK = (targetData.columns || []).filter((col) => col.name !== sourceFKName);
          setNodes((nds) => nds.map((n) => n.id === edge.target ? {
            ...n,
            data: {
              ...n.data,
              columns: [...columnsWithoutFK]
            }
          } : n));
          await saveColumns({
            data: {
              tableId: edge.target,
              projectId,
              columns: columnsWithoutFK.map((c, i) => ({
                id: c.id,
                name: c.name,
                type: c.type,
                nullable: c.nullable,
                isPrimary: c.isPrimary,
                isUnique: c.isUnique,
                defaultValue: c.defaultValue || void 0,
                order: i
              }))
            }
          });
        }
        if (newFKSide === "source") {
          const fkExists = (sourceData.columns || []).some((col) => col.name === targetFKName);
          if (!fkExists) {
            const updatedColumns = [...(sourceData.columns || []).filter((col) => col.name !== targetFKName), {
              id: nanoid(),
              name: targetFKName,
              type: targetPK?.type || "uuid",
              isPrimary: false,
              isUnique: false,
              nullable: false,
              defaultValue: null,
              order: (sourceData.columns || []).length
            }];
            setNodes((nds) => nds.map((n) => n.id === edge.source ? {
              ...n,
              data: {
                ...n.data,
                columns: [...updatedColumns]
              }
            } : n));
            await saveColumns({
              data: {
                tableId: edge.source,
                projectId,
                columns: updatedColumns.map((c, i) => ({
                  id: c.id,
                  name: c.name,
                  type: c.type,
                  nullable: c.nullable,
                  isPrimary: c.isPrimary,
                  isUnique: c.isUnique,
                  defaultValue: c.defaultValue || void 0,
                  order: i
                }))
              }
            });
          }
        } else if (newFKSide === "target") {
          const fkExists = (targetData.columns || []).some((col) => col.name === sourceFKName);
          if (!fkExists) {
            const updatedColumns = [...(targetData.columns || []).filter((col) => col.name !== sourceFKName), {
              id: nanoid(),
              name: sourceFKName,
              type: sourcePK?.type || "uuid",
              isPrimary: false,
              isUnique: false,
              nullable: false,
              defaultValue: null,
              order: (targetData.columns || []).length
            }];
            setNodes((nds) => nds.map((n) => n.id === edge.target ? {
              ...n,
              data: {
                ...n.data,
                columns: [...updatedColumns]
              }
            } : n));
            await saveColumns({
              data: {
                tableId: edge.target,
                projectId,
                columns: updatedColumns.map((c, i) => ({
                  id: c.id,
                  name: c.name,
                  type: c.type,
                  nullable: c.nullable,
                  isPrimary: c.isPrimary,
                  isUnique: c.isUnique,
                  defaultValue: c.defaultValue || void 0,
                  order: i
                }))
              }
            });
          }
        }
      }
    }
    await updateRelationship({
      data: {
        id: edgeId,
        projectId,
        type: newType
      }
    });
  }, [projectId, setEdges, edges, nodes, setNodes]);
  const edgesWithHandlers = edges.map((e) => ({
    ...e,
    data: {
      ...e.data,
      onDelete: handleDeleteEdge,
      onTypeChange: handleUpdateEdgeType
    }
  }));
  const handleAddTable = async () => {
    if (!newTableName.trim()) return;
    const id = nanoid();
    const color = TABLE_COLORS[colorIdx.current % TABLE_COLORS.length];
    colorIdx.current++;
    const sanitizedName = newTableName.trim().replace(/\s+/g, "_");
    const position = {
      x: 100 + Math.random() * 300,
      y: 100 + Math.random() * 200
    };
    const newNode = {
      id,
      type: "tableNode",
      position,
      data: {
        id,
        name: sanitizedName,
        color,
        projectId,
        columns: [],
        onSelect: setSelectedTableId,
        onDelete: handleDeleteTable
      }
    };
    setNodes((nds) => [...nds, newNode]);
    setNewTableName("");
    setAddingTable(false);
    setSelectedTableId(id);
    await addTable({
      data: {
        projectId,
        name: sanitizedName,
        color,
        positionX: position.x,
        positionY: position.y
      }
    });
  };
  const handleDeleteTable = useCallback(async (tableId) => {
    const table = nodes.find((n) => n.id === tableId);
    if (!table) return;
    const tableName = table.data.name;
    setDeleteConfirm({
      isOpen: true,
      tableId,
      tableName
    });
  }, [nodes]);
  const confirmDeleteTable = useCallback(async () => {
    const {
      tableId
    } = deleteConfirm;
    if (!tableId) return;
    setNodes((nds) => nds.filter((n) => n.id !== tableId));
    setEdges((eds) => eds.filter((e) => e.source !== tableId && e.target !== tableId));
    if (selectedTableId === tableId) setSelectedTableId(null);
    await deleteTable({
      data: {
        id: tableId,
        projectId
      }
    });
    setDeleteConfirm({
      isOpen: false,
      tableId: null,
      tableName: ""
    });
  }, [projectId, selectedTableId, setNodes, setEdges, deleteConfirm]);
  const nodesWithHandlers = nodes.map((n) => ({
    ...n,
    data: {
      ...n.data,
      onSelect: setSelectedTableId,
      onDelete: handleDeleteTable
    }
  }));
  const selectedNode = nodes.find((n) => n.id === selectedTableId);
  const selectedTableData = selectedNode?.data;
  const handleSaveTable = async (edits) => {
    if (!selectedTableId) return;
    const currentNode = nodes.find((n) => n.id === selectedTableId);
    const currentData = currentNode?.data;
    const currentTableName = currentData?.name || "";
    const newPK = edits.columns.find((c) => c.isPrimary);
    const oldPK = currentData?.columns?.find((c) => c.isPrimary);
    const pkTypeChanged = newPK && oldPK && newPK.type !== oldPK.type;
    const fkName = `${currentTableName}_id`;
    setNodes((nds) => nds.map((n) => {
      if (n.id === selectedTableId) {
        return {
          ...n,
          data: {
            ...n.data,
            name: edits.name,
            color: edits.color,
            columns: edits.columns
          }
        };
      }
      if (pkTypeChanged && newPK) {
        const tableData = n.data;
        const hasFKRef = tableData.columns?.some((col) => col.name === fkName);
        if (hasFKRef) {
          return {
            ...n,
            data: {
              ...n.data,
              columns: tableData.columns.map((col) => col.name === fkName ? {
                ...col,
                type: newPK.type
              } : col)
            }
          };
        }
      }
      return n;
    }));
    await updateTable({
      data: {
        id: selectedTableId,
        projectId,
        name: edits.name,
        color: edits.color
      }
    });
    await saveColumns({
      data: {
        tableId: selectedTableId,
        projectId,
        columns: edits.columns.map((c) => ({
          id: c.id,
          name: c.name,
          type: c.type,
          nullable: c.nullable,
          isPrimary: c.isPrimary,
          isUnique: c.isUnique,
          defaultValue: c.defaultValue || void 0,
          order: c.order
        }))
      }
    });
    if (pkTypeChanged && newPK) {
      const affectedNodes = nodes.filter((n) => {
        if (n.id === selectedTableId) return false;
        const td = n.data;
        return td.columns?.some((col) => col.name === fkName);
      });
      for (const affNode of affectedNodes) {
        const td = affNode.data;
        const updatedCols = td.columns.map((col) => col.name === fkName ? {
          ...col,
          type: newPK.type
        } : col);
        try {
          await saveColumns({
            data: {
              tableId: affNode.id,
              projectId,
              columns: updatedCols.map((c, i) => ({
                id: c.id,
                name: c.name,
                type: c.type,
                nullable: c.nullable,
                isPrimary: c.isPrimary,
                isUnique: c.isUnique,
                defaultValue: c.defaultValue || void 0,
                order: i
              }))
            }
          });
        } catch (error) {
          console.error(`Failed to update FK type in table ${td.name}:`, error);
        }
      }
    }
    setSelectedTableId(null);
  };
  const handleAutoLayout = () => {
    const cols = Math.ceil(Math.sqrt(nodes.length));
    const GAP_X = 320;
    const GAP_Y = 280;
    setNodes((nds) => nds.map((n, i) => ({
      ...n,
      position: {
        x: i % cols * GAP_X + 60,
        y: Math.floor(i / cols) * GAP_Y + 60
      }
    })));
    setTimeout(() => fitView({
      padding: 0.15,
      duration: 400
    }), 50);
  };
  return /* @__PURE__ */ jsxs("div", { className: "flex h-screen", style: {
    background: "var(--background)"
  }, children: [
    /* @__PURE__ */ jsxs("div", { className: "w-56 flex-shrink-0 flex flex-col border-r", style: {
      background: "var(--card)",
      borderColor: "var(--border)"
    }, children: [
      /* @__PURE__ */ jsxs("div", { className: "px-4 py-3 border-b flex items-center justify-between", style: {
        borderColor: "var(--border)"
      }, children: [
        /* @__PURE__ */ jsxs(Link, { to: "/app", className: "flex items-center gap-2 hover:opacity-80 transition-opacity", children: [
          /* @__PURE__ */ jsx("div", { className: "w-6 h-6 rounded flex items-center justify-center", style: {
            background: "var(--primary)",
            color: "var(--primary-foreground)"
          }, children: /* @__PURE__ */ jsx("span", { className: "font-black text-[10px]", children: "E" }) }),
          /* @__PURE__ */ jsx("span", { className: "text-xs font-medium", style: {
            color: "var(--muted-foreground)"
          }, children: "Projects" })
        ] }),
        /* @__PURE__ */ jsx(ThemeToggle, {})
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "px-4 py-3 border-b", style: {
        borderColor: "var(--border)"
      }, children: [
        /* @__PURE__ */ jsx("p", { className: "text-[10px] uppercase tracking-wider mb-1", style: {
          color: "var(--muted-foreground)"
        }, children: "Project" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm font-bold truncate", style: {
          color: "var(--card-foreground)"
        }, children: project.name }),
        project.description && /* @__PURE__ */ jsx("p", { className: "text-xs mt-0.5 truncate", style: {
          color: "var(--muted-foreground)"
        }, children: project.description })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex-1 overflow-y-auto p-3", children: [
        /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between mb-2", children: /* @__PURE__ */ jsxs("p", { className: "text-[10px] uppercase tracking-wider", style: {
          color: "var(--muted-foreground)"
        }, children: [
          "Tables (",
          nodes.length,
          ")"
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "space-y-1", children: nodes.map((n) => {
          const d = n.data;
          return /* @__PURE__ */ jsxs("div", { className: "group flex items-center gap-2 rounded-lg transition-all border", style: {
            background: selectedTableId === n.id ? "var(--accent)" : "transparent",
            borderColor: selectedTableId === n.id ? "var(--border)" : "transparent"
          }, children: [
            /* @__PURE__ */ jsxs("button", { onClick: () => setSelectedTableId(n.id), className: "flex-1 flex items-center gap-2 px-2.5 py-2 text-left", children: [
              /* @__PURE__ */ jsx("div", { className: "w-2 h-2 rounded-full flex-shrink-0", style: {
                background: d.color
              } }),
              /* @__PURE__ */ jsx("span", { className: "text-xs truncate flex-1", style: {
                color: "var(--foreground)"
              }, children: d.name }),
              /* @__PURE__ */ jsx("span", { className: "text-[10px]", style: {
                color: "var(--muted-foreground)"
              }, children: d.columns?.length || 0 })
            ] }),
            /* @__PURE__ */ jsx("button", { onClick: (e) => {
              e.stopPropagation();
              handleDeleteTable(n.id);
            }, className: "px-2 py-2 opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300", title: "Delete table", children: /* @__PURE__ */ jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
              /* @__PURE__ */ jsx("path", { d: "M3 6h18" }),
              /* @__PURE__ */ jsx("path", { d: "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" }),
              /* @__PURE__ */ jsx("path", { d: "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" })
            ] }) })
          ] }, n.id);
        }) }),
        addingTable ? /* @__PURE__ */ jsxs("div", { className: "mt-2 space-y-2", children: [
          /* @__PURE__ */ jsx("input", { type: "text", value: newTableName, onChange: (e) => setNewTableName(e.target.value), onKeyDown: (e) => {
            if (e.key === "Enter") handleAddTable();
            if (e.key === "Escape") setAddingTable(false);
          }, placeholder: "table_name", className: "w-full px-2.5 py-2 rounded-lg text-xs border focus:outline-none", style: {
            background: "var(--input)",
            borderColor: "var(--border)",
            color: "var(--foreground)"
          }, autoFocus: true }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-1.5", children: [
            /* @__PURE__ */ jsx("button", { onClick: handleAddTable, disabled: !newTableName.trim(), className: "flex-1 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50", style: {
              background: "var(--primary)",
              color: "var(--primary-foreground)"
            }, children: "Add" }),
            /* @__PURE__ */ jsx("button", { onClick: () => setAddingTable(false), className: "flex-1 py-1.5 rounded-lg text-xs border transition-all", style: {
              color: "var(--muted-foreground)",
              borderColor: "var(--border)"
            }, children: "Cancel" })
          ] })
        ] }) : /* @__PURE__ */ jsxs("button", { onClick: () => setAddingTable(true), className: "w-full mt-2 flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs border border-dashed transition-all", style: {
          color: "var(--muted-foreground)",
          borderColor: "var(--border)"
        }, children: [
          /* @__PURE__ */ jsx("span", { children: "+" }),
          /* @__PURE__ */ jsx("span", { children: "Add Table" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "p-3 border-t space-y-2", style: {
        borderColor: "var(--border)"
      }, children: [
        /* @__PURE__ */ jsx("button", { onClick: handleAutoLayout, className: "w-full py-2 rounded-lg text-xs font-medium border transition-all", style: {
          color: "var(--foreground)",
          borderColor: "var(--border)"
        }, children: "⊞ Auto Layout" }),
        /* @__PURE__ */ jsx("button", { onClick: () => setShowExport(true), className: "w-full py-2 rounded-lg text-xs font-semibold transition-all hover:opacity-90", style: {
          background: "var(--primary)",
          color: "var(--primary-foreground)"
        }, children: "↓ Export SQL" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 relative", children: [
      /* @__PURE__ */ jsxs("div", { className: "absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-2.5 border-b", style: {
        background: "var(--card)",
        backdropFilter: "blur(8px)",
        borderColor: "var(--border)"
      }, children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 text-xs", style: {
          color: "var(--muted-foreground)"
        }, children: [
          /* @__PURE__ */ jsxs("span", { children: [
            nodes.length,
            " tables"
          ] }),
          /* @__PURE__ */ jsx("span", { children: "·" }),
          /* @__PURE__ */ jsxs("span", { children: [
            edges.length,
            " relationships"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          saving && /* @__PURE__ */ jsxs("span", { className: "text-xs flex items-center gap-1.5", style: {
            color: "var(--muted-foreground)"
          }, children: [
            /* @__PURE__ */ jsx("div", { className: "w-3 h-3 border rounded-full animate-spin", style: {
              borderColor: "var(--border)",
              borderTopColor: "var(--primary)"
            } }),
            "Saving..."
          ] }),
          /* @__PURE__ */ jsx("span", { className: "text-xs hidden sm:inline", style: {
            color: "var(--muted-foreground)"
          }, children: "Drag from owner → child to connect" }),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx("button", { onClick: () => setShowUserMenu(!showUserMenu), className: "flex items-center gap-2 p-1 rounded-lg transition-all hover:opacity-80", style: {
              background: "var(--accent)"
            }, children: user?.user_metadata?.avatar_url ? /* @__PURE__ */ jsx("img", { src: user.user_metadata.avatar_url, alt: "Profile", className: "w-6 h-6 rounded-full" }) : /* @__PURE__ */ jsx("div", { className: "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold", style: {
              background: "var(--primary)",
              color: "var(--primary-foreground)"
            }, children: user?.email?.[0]?.toUpperCase() || "?" }) }),
            showUserMenu && /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-40", onClick: () => setShowUserMenu(false) }),
              /* @__PURE__ */ jsxs("div", { className: "absolute right-0 top-full mt-1 z-50 rounded-lg border shadow-lg overflow-hidden min-w-[160px]", style: {
                background: "var(--card)",
                borderColor: "var(--border)"
              }, children: [
                user && /* @__PURE__ */ jsxs("div", { className: "px-3 py-2 border-b text-xs", style: {
                  borderColor: "var(--border)"
                }, children: [
                  /* @__PURE__ */ jsx("p", { className: "font-medium truncate max-w-[200px]", children: user.user_metadata?.full_name || "User" }),
                  /* @__PURE__ */ jsx("p", { className: "truncate max-w-[200px]", style: {
                    color: "var(--muted-foreground)"
                  }, children: user.email })
                ] }),
                /* @__PURE__ */ jsxs(Link, { to: "/settings", className: "flex items-center gap-2 px-3 py-2 text-xs hover:opacity-80 transition-opacity", style: {
                  color: "var(--foreground)"
                }, onClick: () => setShowUserMenu(false), children: [
                  /* @__PURE__ */ jsx("span", { children: "⚙" }),
                  /* @__PURE__ */ jsx("span", { children: "Settings" })
                ] }),
                /* @__PURE__ */ jsxs("button", { onClick: handleSignOut, className: "w-full flex items-center gap-2 px-3 py-2 text-xs hover:opacity-80 transition-opacity text-left", style: {
                  color: "var(--destructive)"
                }, children: [
                  /* @__PURE__ */ jsx("span", { children: "→" }),
                  /* @__PURE__ */ jsx("span", { children: "Sign Out" })
                ] })
              ] })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(ReactFlow, { nodes: nodesWithHandlers, edges: edgesWithHandlers, onNodesChange: handleNodesChange, onEdgesChange, onConnect, nodeTypes, edgeTypes, fitView: true, fitViewOptions: {
        padding: 0.2
      }, minZoom: 0.1, maxZoom: 2, defaultEdgeOptions: {
        type: "relationship",
        animated: false
      }, style: {
        paddingTop: 44
      }, children: [
        /* @__PURE__ */ jsx(Background, { variant: BackgroundVariant.Dots, gap: 24, size: 1, style: {
          backgroundColor: "var(--background)"
        } }),
        /* @__PURE__ */ jsx(Controls, { position: "bottom-right", style: {
          bottom: 16,
          right: 16
        } }),
        /* @__PURE__ */ jsx(MiniMap, { position: "bottom-left", style: {
          bottom: 16,
          left: 16
        }, nodeColor: (n) => n.data.color || "var(--primary)", maskColor: "rgba(0,0,0,0.6)" })
      ] }),
      nodes.length === 0 && /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex items-center justify-center pointer-events-none", style: {
        paddingTop: 44
      }, children: /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
        /* @__PURE__ */ jsx("div", { className: "w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 border", style: {
          background: "var(--accent)",
          borderColor: "var(--border)"
        }, children: "⬡" }),
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-bold mb-2", style: {
          color: "var(--foreground)"
        }, children: "Empty Canvas" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm", style: {
          color: "var(--muted-foreground)"
        }, children: "Add your first table using the sidebar" })
      ] }) })
    ] }),
    selectedTableId && selectedTableData && /* @__PURE__ */ jsx(ColumnEditor, { table: {
      id: selectedTableId,
      name: selectedTableData.name,
      color: selectedTableData.color,
      columns: selectedTableData.columns || []
    }, relationships: edges.map((edge) => {
      const sourceNode = nodes.find((n) => n.id === edge.source);
      const targetNode = nodes.find((n) => n.id === edge.target);
      return {
        id: edge.id,
        sourceTableId: edge.source,
        targetTableId: edge.target,
        sourceTableName: sourceNode?.data?.name || "",
        targetTableName: targetNode?.data?.name || "",
        type: edge.data?.type || "one-to-many"
      };
    }), onSave: handleSaveTable, onClose: () => setSelectedTableId(null) }),
    showExport && /* @__PURE__ */ jsx(ExportModal, { projectId, projectName: project.name, onClose: () => setShowExport(false) }),
    /* @__PURE__ */ jsx(ConfirmModal, { isOpen: deleteConfirm.isOpen, onClose: () => setDeleteConfirm({
      isOpen: false,
      tableId: null,
      tableName: ""
    }), onConfirm: confirmDeleteTable, title: "Delete Table", description: `Are you sure you want to delete the table "${deleteConfirm.tableName}"? This will also delete all its columns and relationships. This action cannot be undone.`, confirmText: "Delete", cancelText: "Cancel", variant: "destructive" })
  ] });
}
const SplitComponent = () => /* @__PURE__ */ jsx(ReactFlowProvider, { children: /* @__PURE__ */ jsx(ERDCanvas, {}) });
export {
  SplitComponent as component
};
