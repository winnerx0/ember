import { memo, useState, useCallback } from "react";
import { Handle, Position, NodeProps, useReactFlow } from "@xyflow/react";

export type TableNodeData = {
  id: string;
  name: string;
  color: string;
  projectId: string;
  columns: Array<{
    id: string;
    name: string;
    type: string;
    isPrimary: boolean;
    isUnique: boolean;
    nullable: boolean;
    defaultValue?: string | null;
    order: number;
  }>;
  onSelect?: (id: string) => void;
  onDelete?: (id: string) => void;
};

const TYPE_COLORS: Record<string, string> = {
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
  real: "var(--chart-4)",
};

function getTypeColor(type: string) {
  return TYPE_COLORS[type.toLowerCase()] || "var(--muted-foreground)";
}

function shortType(type: string) {
  const map: Record<string, string> = {
    "double precision": "float8",
    "character varying": "varchar",
    timestamptz: "timestamptz",
    timestamp: "timestamp",
  };
  return map[type] || type;
}

export const TableNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as TableNodeData;
  const { color, name, columns = [], onSelect, onDelete } = nodeData;
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="rounded-xl overflow-hidden transition-all duration-200"
      style={{
        minWidth: 220,
        maxWidth: 280,
        background: "var(--card)",
        border: `1px solid ${selected ? color : hovered ? color + "60" : "var(--border)"}`,
        boxShadow: selected
          ? `0 0 0 2px ${color}40, 0 8px 32px rgba(0,0,0,0.4)`
          : hovered
            ? `0 4px 20px rgba(0,0,0,0.3)`
            : `0 2px 8px rgba(0,0,0,0.2)`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Table header */}
      <div
        className="flex items-center gap-2 px-3 py-2.5 cursor-pointer"
        style={{
          background: `linear-gradient(135deg, ${color}20, ${color}08)`,
          borderBottom: `1px solid ${color}25`,
        }}
        onClick={() => onSelect?.(nodeData.id)}
      >
        <div
          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{ background: color, boxShadow: `0 0 6px ${color}80` }}
        />
        <span
          className="font-bold text-sm flex-1 truncate"
          style={{ color: color }}
        >
          {name}
        </span>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
          {(hovered || selected) && (
            <>
              <button
                className="p-1 rounded transition-all text-xs"
                style={{ color: "var(--muted-foreground)" }}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect?.(nodeData.id);
                }}
                title="Edit table"
              >
                ✎
              </button>
              <button
                className="p-1 rounded text-red-400 hover:bg-red-500/10 transition-all text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.(nodeData.id);
                }}
                title="Delete table"
              >
                ✕
              </button>
            </>
          )}
        </div>
      </div>

      {/* Columns */}
      <div>
        {columns.length === 0 ? (
          <div className="px-3 py-3 text-xs italic text-center" style={{ color: "var(--muted-foreground)" }}>
            No columns — click to add
          </div>
        ) : (
          columns.map((col, idx) => (
            <div key={col.id} className="relative table-node-column group/col">
              {/* Left handle (target) */}
              <Handle
                type="target"
                position={Position.Left}
                id={`${col.id}-target`}
                style={{
                  top: "50%",
                  left: -5,
                  transform: "translateY(-50%)",
                  opacity: hovered ? 1 : 0,
                  transition: "opacity 0.15s",
                }}
              />

              {/* PK / FK badge */}
              <div className="w-6 flex-shrink-0 flex items-center justify-center">
                {col.isPrimary ? (
                  <span className="text-yellow-400 text-[9px] font-black">
                    PK
                  </span>
                ) : col.isUnique ? (
                  <span className="text-blue-400 text-[9px] font-bold">UQ</span>
                ) : (
                  <span className="text-[9px]" style={{ color: "var(--muted-foreground)" }}>—</span>
                )}
              </div>

              {/* Column name */}
              <span className="flex-1 text-xs truncate" style={{ color: "var(--card-foreground)" }}>
                {col.name}
              </span>

              {/* Type badge */}
              <span
                className="text-[9px] font-mono px-1.5 py-0.5 rounded"
                style={{
                  color: getTypeColor(col.type),
                  background: `${getTypeColor(col.type)}15`,
                }}
              >
                {shortType(col.type)}
              </span>

              {/* Nullable indicator */}
              {col.nullable && !col.isPrimary && (
                <span className="text-[9px] ml-1" style={{ color: "var(--muted-foreground)" }}>?</span>
              )}

              {/* Right handle (source) */}
              <Handle
                type="source"
                position={Position.Right}
                id={`${col.id}-source`}
                style={{
                  top: "50%",
                  right: -5,
                  transform: "translateY(-50%)",
                  opacity: hovered ? 1 : 0,
                  transition: "opacity 0.15s",
                }}
              />
            </div>
          ))
        )}
      </div>

      {/* Table handle (whole-table connections) */}
      <Handle
        type="target"
        position={Position.Left}
        id={`${nodeData.id}-table-target`}
        style={{ top: "50%", left: -5, opacity: 0 }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id={`${nodeData.id}-table-source`}
        style={{ top: "50%", right: -5, opacity: 0 }}
      />
    </div>
  );
});

TableNode.displayName = "TableNode";
