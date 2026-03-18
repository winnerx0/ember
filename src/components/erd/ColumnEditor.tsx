import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Checkbox } from "~/components/ui/checkbox";
import { cn } from "~/lib/utils";

const PG_TYPES = [
  "uuid",
  "serial",
  "bigserial",
  "integer",
  "int",
  "bigint",
  "smallint",
  "numeric",
  "decimal",
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
  "bytea",
];

// Suggested default values per PostgreSQL type
function getSuggestedDefault(type: string): string {
  switch (type) {
    case "uuid": return "gen_random_uuid()";
    case "timestamptz":
    case "timestamp": return "now()";
    case "date": return "current_date";
    case "boolean": return "false";
    case "integer":
    case "bigint":
    case "smallint":
    case "numeric":
    case "real":
    case "double precision": return "0";
    case "serial":
    case "bigserial": return "";
    case "json":
    case "jsonb": return "'{}'";
    case "text":
    case "varchar":
    case "char": return "''";
    default: return "";
  }
}

const TABLE_COLORS = [
  "oklch(0.488 0.243 264.376)", // Blue/Purple - dark mode chart-1
  "oklch(0.696 0.17 162.48)",   // Teal - dark mode chart-2
  "oklch(0.769 0.188 70.08)",   // Green - dark mode chart-3
  "oklch(0.627 0.265 303.9)",   // Purple - dark mode chart-4
  "oklch(0.645 0.246 16.439)",  // Orange - dark mode chart-5
];

export type ColumnDraft = {
  id: string;
  name: string;
  type: string;
  isPrimary: boolean;
  isUnique: boolean;
  nullable: boolean;
  defaultValue: string;
  order: number;
};

type Props = {
  table: {
    id: string;
    name: string;
    color: string;
    columns: ColumnDraft[];
  };
  relationships?: Array<{
    id: string;
    sourceTableId: string;
    targetTableId: string;
    sourceTableName: string;
    targetTableName: string;
    type: string;
  }>;
  onSave: (data: {
    name: string;
    color: string;
    columns: ColumnDraft[];
  }) => Promise<void>;
  onClose: () => void;
};

export function ColumnEditor({
  table,
  relationships = [],
  onSave,
  onClose,
}: Props) {
  const [name, setName] = useState(table.name || "");
  const [color, setColor] = useState(table.color);
  const [columns, setColumns] = useState<ColumnDraft[]>(
    table.columns.length > 0
      ? table.columns
      : [
          {
            id: crypto.randomUUID(),
            name: "id",
            type: "uuid",
            isPrimary: true,
            isUnique: false,
            nullable: false,
            defaultValue: "gen_random_uuid()",
            order: 0,
          },
        ],
  );
  const [saving, setSaving] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-save and close when clicking outside the panel
  const handleSaveRef = useRef<() => Promise<void>>(async () => {});
  useEffect(() => {
    handleSaveRef.current = async () => {
      if (!name.trim()) { onClose(); return; }
      setSaving(true);
      try {
        const sanitizedName = name.trim().replace(/\s+/g, "_");
        await onSave({ name: sanitizedName, color, columns: columns.map((c, i) => ({ ...c, order: i })) });
      } catch { /* stay open on error */ }
      finally { setSaving(false); }
    };
  });

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        handleSaveRef.current?.();
      }
    };
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, []);

  // Helper to check if a column is a FK
  const getFKInfo = (columnName: string) => {
    // Check if this table is the target (has the FK)
    // For one-to-one, one-to-many, and many-to-one relationships
    const asTarget = relationships.find((rel) => {
      // For one-to-many and one-to-one: target table has FK
      if (
        (rel.type === "one-to-many" || rel.type === "one-to-one") &&
        rel.targetTableId === table.id
      ) {
        const expectedFKName = `${rel.sourceTableName}_id`;
        return columnName === expectedFKName;
      }
      // For many-to-one: source table has FK
      if (rel.type === "many-to-one" && rel.sourceTableId === table.id) {
        const expectedFKName = `${rel.targetTableName}_id`;
        return columnName === expectedFKName;
      }
      return false;
    });

    if (asTarget) {
      const referencedTable =
        asTarget.type === "many-to-one"
          ? asTarget.targetTableName
          : asTarget.sourceTableName;
      return {
        isFK: true,
        referencesTable: referencedTable,
        direction: "references",
      };
    }

    return { isFK: false, referencesTable: null, direction: null };
  };

  const addColumn = () => {
    setColumns((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: "",
        type: "text",
        isPrimary: false,
        isUnique: false,
        nullable: true,
        defaultValue: "",
        order: prev.length,
      },
    ]);
  };

  const removeColumn = (id: string) => {
    setColumns((prev) => prev.filter((c) => c.id !== id));
  };

  const updateColumn = (id: string, field: keyof ColumnDraft, value: any) => {
    setColumns((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const updated = { ...c, [field]: value };
        // If setting as PK, also set not nullable
        if (field === "isPrimary" && value) {
          updated.nullable = false;
          updated.isUnique = false;
        }
        return updated;
      }),
    );
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const sanitizedName = name.trim().replace(/\s+/g, "_");
      await onSave({
        name: sanitizedName,
        color,
        columns: columns.map((c, i) => ({ ...c, order: i })),
      });
      // onClose is called by parent (handleSaveTable sets selectedTableId to null)
    } catch (error) {
      console.error("Failed to save:", error);
      // Don't close on error so user can retry
    } finally {
      setSaving(false);
    }
  };

  return (
    <div ref={containerRef} className="fixed right-0 top-0 bottom-0 w-96 z-40 flex flex-col overflow-hidden border-l border-border bg-card shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <h3 className="font-bold text-base text-card-foreground">Edit Table</h3>
        <Button
          variant={"ghost"}
          onClick={onClose}
          className="p-1.5 rounded-full transition-all hover:bg-accent size-8 text-muted-foreground"
        >
          ✕
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* Table name */}
        <div className="space-y-2">
          <Label
            htmlFor="table-name"
            className="text-[10px] font-bold uppercase tracking-widest opacity-50"
          >
            Table Name
          </Label>
          <Input
            id="table-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value.replace(/^\s+/, "").replace(/\s/g, "_"))}
            className="h-10 text-sm font-medium focus-visible:ring-primary/50"
          />
        </div>

        {/* Color picker */}
        <div className="space-y-2">
          <Label className="text-[10px] font-bold uppercase tracking-widest opacity-50">
            Table Color
          </Label>
          <div className="flex gap-2 flex-wrap">
            {TABLE_COLORS.map((c) => (
              <Button
                key={c}
                onClick={() => setColor(c)}
                className={cn(
                  "w-8 h-8 rounded-lg transition-all hover:scale-110 active:scale-95 border",
                  color === c
                    ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                    : "border-border",
                )}
                style={{ background: c }}
              />
            ))}
          </div>
        </div>

        {/* Columns */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-[10px] font-bold uppercase tracking-widest opacity-50">
              Columns ({columns.length})
            </Label>
            <Button
              onClick={addColumn}
              variant="secondary"
              size="sm"
              className="h-8 px-3 text-xs font-bold"
            >
              + Add Column
            </Button>
          </div>

          <div className="space-y-3">
            {columns.map((col, idx) => {
              const fkInfo = getFKInfo(col.name);
              return (
                <div className="rounded-xl border border-border bg-background transition-all duration-200" key={col.id}>

                  {/* Column Header */}
                  <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border bg-card/30">
                    <span className="text-[10px] font-mono w-4 opacity-40">
                      {idx + 1}
                    </span>
                    <Input
                      type="text"
                      value={col.name}
                      onChange={(e) =>
                        updateColumn(col.id, "name", e.target.value)
                      }
                      placeholder="column_name"
                      className="flex-1 h-7 text-sm border-none bg-transparent px-0 font-medium focus-visible:ring-0 placeholder:opacity-30"
                    />
                    {fkInfo.isFK && (
                      <div
                        className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold shrink-0"
                        style={{
                          background: "oklch(0.708 0 0 / 10%)",
                          color: "oklch(0.488 0.243 264.376)",
                        }}
                      >
                        FK → {fkInfo.referencesTable}
                      </div>
                    )}
                    <Button
                      onClick={() => removeColumn(col.id)}
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                    >
                      ✕
                    </Button>
                  </div>

                  {/* Column Settings */}
                  <div className="p-3 space-y-3">
                    {/* Type Selection */}
                    <div className="space-y-1.5">
                      <Label className="text-[10px] uppercase font-bold opacity-50">
                        Type
                      </Label>
                      <Select
                        value={col.type}
                        onValueChange={(val) =>
                          updateColumn(col.id, "type", val)
                        }
                      >
                        <SelectTrigger className="h-8 text-xs bg-card/50 border-none ring-1 ring-border shadow-none">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PG_TYPES.map((t) => (
                            <SelectItem key={t} value={t} className="text-xs">
                              {t}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Flags */}
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { key: "isPrimary", label: "PK" },
                        { key: "isUnique", label: "Unique" },
                        { key: "nullable", label: "NN", inverse: true },
                      ].map(({ key, label, inverse }) => (
                        <label
                          key={key}
                          className="flex items-center justify-start px-4 gap-2 h-8 rounded-lg border border-border/50 bg-card/30 cursor-pointer hover:bg-card/50 transition-colors"
                        >
                          <Checkbox
                            checked={
                              inverse
                                ? !col.nullable
                                : !!col[key as keyof ColumnDraft]
                            }
                            onCheckedChange={(checked: boolean) =>
                              updateColumn(
                                col.id,
                                key as keyof ColumnDraft,
                                inverse ? !checked : checked,
                              )
                            }
                            className="h-3.5 w-3.5"
                          />
                          <span className="text-[10px] font-bold opacity-70">
                            {label}
                          </span>
                        </label>
                      ))}
                    </div>

                    {/* Default Value */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label className="text-[10px] uppercase font-bold opacity-50">
                          Default
                        </Label>
                        {getSuggestedDefault(col.type) && (
                          <button
                            type="button"
                            onClick={() => updateColumn(col.id, "defaultValue", getSuggestedDefault(col.type))}
                            className="text-[9px] px-1.5 py-0.5 rounded font-mono opacity-50 hover:opacity-100 transition-opacity border border-border"
                          >
                            {getSuggestedDefault(col.type)}
                          </button>
                        )}
                      </div>
                      <Input
                        type="text"
                        value={col.defaultValue ?? ""}
                        onChange={(e) =>
                          updateColumn(col.id, "defaultValue", e.target.value)
                        }
                        placeholder={getSuggestedDefault(col.type) || "no default"}
                        className="h-8 text-xs bg-card/50 border-none ring-1 ring-border shadow-none focus-visible:ring-primary/50"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-border flex gap-3 bg-card">
        <Button
          onClick={onClose}
          variant="ghost"
          className="flex-1 h-10 font-bold"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={!name.trim() || saving}
          className="flex-1 h-10 font-bold"
        >
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
