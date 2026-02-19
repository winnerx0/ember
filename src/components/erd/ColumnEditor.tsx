import { useState, useEffect } from "react";
import { nanoid } from "nanoid";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";

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
  "bytea",
];

const TABLE_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--primary)",
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
  onSave: (data: {
    name: string;
    color: string;
    columns: ColumnDraft[];
  }) => Promise<void>;
  onClose: () => void;
};

export function ColumnEditor({ table, onSave, onClose }: Props) {
  const [name, setName] = useState(table.name);
  const [color, setColor] = useState(table.color);
  const [columns, setColumns] = useState<ColumnDraft[]>(
    table.columns.length > 0
      ? table.columns
      : [
          {
            id: nanoid(),
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
    setSaving(true);
    try {
      // Replace spaces with underscores in table name
      const sanitizedName = name.trim().replace(/\s+/g, '_');

      await onSave({
        name: sanitizedName,
        color,
        columns: columns.map((c, i) => ({ ...c, order: i })),
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed right-0 top-0 bottom-0 w-96 z-40 flex flex-col border-l overflow-hidden"
      style={{ background: "var(--card)", borderColor: "var(--border)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
        <h3 className="font-bold text-base" style={{ color: "var(--card-foreground)" }}>Edit Table</h3>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg transition-all"
          style={{ color: "var(--muted-foreground)" }}
        >
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Table name */}
        <div className="space-y-2">
          <Label htmlFor="table-name" className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
            Table Name
          </Label>
          <Input
            id="table-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* Color picker */}
        <div>
          <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
            Color
          </label>
          <div className="flex gap-2 flex-wrap">
            {TABLE_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className="w-7 h-7 rounded-lg transition-all hover:scale-110"
                style={{
                  background: c,
                  boxShadow:
                    color === c ? `0 0 0 2px var(--border), 0 0 0 4px ${c}` : "none",
                }}
              />
            ))}
          </div>
        </div>

        {/* Columns */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <Label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
              Columns ({columns.length})
            </Label>
            <Button
              onClick={addColumn}
              variant="outline"
              size="sm"
            >
              + Add
            </Button>
          </div>

          <div className="space-y-2">
            {columns.map((col, idx) => (
              <div
                key={col.id}
                className="rounded-xl border overflow-hidden"
                style={{ background: "var(--accent)", borderColor: "var(--border)" }}
              >
                {/* Column row header */}
                <div className="flex items-center gap-2 px-3 py-2 border-b" style={{ borderColor: "var(--border)" }}>
                  <span className="text-xs w-4" style={{ color: "var(--muted-foreground)" }}>{idx + 1}</span>
                  <Input
                    type="text"
                    value={col.name}
                    onChange={(e) =>
                      updateColumn(col.id, "name", e.target.value)
                    }
                    placeholder="column_name"
                    className="flex-1 h-7 text-sm border-0 bg-transparent px-0 focus-visible:ring-0"
                  />
                  <Button
                    onClick={() => removeColumn(col.id)}
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-red-400 hover:text-red-300"
                  >
                    ✕
                  </Button>
                </div>

                {/* Column details */}
                <div className="px-3 py-2 space-y-2">
                  {/* Type */}
                  <Select
                    value={col.type}
                    onValueChange={(value) => updateColumn(col.id, "type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PG_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Flags */}
                  <div className="flex gap-3 flex-wrap">
                    {[
                      { key: "isPrimary", label: "PK" },
                      { key: "isUnique", label: "Unique" },
                      { key: "nullable", label: "Nullable" },
                    ].map(({ key, label }) => (
                      <label
                        key={key}
                        className="flex items-center gap-1.5 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={col[key as keyof ColumnDraft] as boolean}
                          onChange={(e) =>
                            updateColumn(
                              col.id,
                              key as keyof ColumnDraft,
                              e.target.checked,
                            )
                          }
                          className="w-3 h-3"
                        />
                        <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{label}</span>
                      </label>
                    ))}
                  </div>

                  {/* Default value */}
                  <Input
                    type="text"
                    value={col.defaultValue}
                    onChange={(e) =>
                      updateColumn(col.id, "defaultValue", e.target.value)
                    }
                    placeholder="Default value (optional)"
                    className="text-xs"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-4 border-t flex gap-3" style={{ borderColor: "var(--border)" }}>
        <Button
          onClick={onClose}
          variant="outline"
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={!name.trim() || saving}
          className="flex-1"
        >
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
