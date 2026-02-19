import { createServerFn } from "@tanstack/react-start";
import { db } from "~/db";
import { erdTables, erdColumns, erdRelationships, projects } from "~/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const PG_TYPE_MAP: Record<string, string> = {
  serial: "SERIAL",
  bigserial: "BIGSERIAL",
  integer: "INTEGER",
  bigint: "BIGINT",
  smallint: "SMALLINT",
  numeric: "NUMERIC",
  real: "REAL",
  "double precision": "DOUBLE PRECISION",
  boolean: "BOOLEAN",
  text: "TEXT",
  varchar: "VARCHAR(255)",
  char: "CHAR(1)",
  uuid: "UUID",
  date: "DATE",
  timestamp: "TIMESTAMP",
  timestamptz: "TIMESTAMPTZ",
  json: "JSON",
  jsonb: "JSONB",
  bytea: "BYTEA",
};

export const exportSQL = createServerFn({ method: "GET" })
  .inputValidator(z.object({ projectId: z.string() }))
  .handler(async ({ data }) => {
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, data.projectId));
    if (!project) throw new Error("Project not found");

    const tables = await db
      .select()
      .from(erdTables)
      .where(eq(erdTables.projectId, data.projectId));

    const allColumns = await Promise.all(
      tables.map((t) =>
        db
          .select()
          .from(erdColumns)
          .where(eq(erdColumns.tableId, t.id))
          .then((cols) => cols.sort((a, b) => a.order - b.order)),
      ),
    );

    const relationships = await db
      .select()
      .from(erdRelationships)
      .where(eq(erdRelationships.projectId, data.projectId));

    const lines: string[] = [];

    lines.push(
      `-- ============================================================`,
    );
    lines.push(`-- Ember ERD Export: ${project.name}`);
    lines.push(`-- Generated: ${new Date().toISOString()}`);
    lines.push(
      `-- ============================================================`,
    );
    lines.push(``);

    // CREATE TABLE statements
    tables.forEach((table, i) => {
      const cols = allColumns[i] || [];
      lines.push(`CREATE TABLE IF NOT EXISTS "${table.name}" (`);

      const colDefs: string[] = [];

      cols.forEach((col) => {
        const pgType = PG_TYPE_MAP[col.type] || col.type.toUpperCase();
        let def = `  "${col.name}" ${pgType}`;

        if (col.isPrimary) {
          def += ` PRIMARY KEY`;
        } else {
          if (!col.nullable) def += ` NOT NULL`;
          if (col.isUnique) def += ` UNIQUE`;
        }

        if (col.defaultValue) {
          def += ` DEFAULT ${col.defaultValue}`;
        }

        colDefs.push(def);
      });

      lines.push(colDefs.join(",\n"));
      lines.push(`);`);
      lines.push(``);
    });

    // ALTER TABLE ADD CONSTRAINT FOREIGN KEY
    const tableNameMap = Object.fromEntries(tables.map((t) => [t.id, t.name]));
    const columnNameMap: Record<string, string> = {};
    allColumns.forEach((cols) => {
      cols.forEach((col) => {
        columnNameMap[col.id] = col.name;
      });
    });

    if (relationships.length > 0) {
      lines.push(`-- Foreign Key Constraints`);
      relationships.forEach((rel, idx) => {
        const sourceTable = tableNameMap[rel.sourceTableId];
        const targetTable = tableNameMap[rel.targetTableId];
        const sourceCol = rel.sourceColumnId
          ? columnNameMap[rel.sourceColumnId]
          : "id";
        const targetCol = rel.targetColumnId
          ? columnNameMap[rel.targetColumnId]
          : "id";

        if (sourceTable && targetTable) {
          // For one-to-many and one-to-one: FK is on the child (target) table
          // For many-to-many: typically requires a junction table (not handled here)

          // The FK constraint should be on the target (child) table
          // It references the source (parent) table
          const constraintName = `fk_${targetTable}_${sourceTable}_${idx}`;
          lines.push(
            `ALTER TABLE "${targetTable}" ADD CONSTRAINT "${constraintName}"`,
          );
          lines.push(
            `  FOREIGN KEY ("${targetCol}") REFERENCES "${sourceTable}" ("${sourceCol}");`,
          );
          lines.push(``);
        }
      });
    }

    // Indexes for FK columns
    if (relationships.length > 0) {
      lines.push(`-- Indexes`);
      relationships.forEach((rel, idx) => {
        const targetTable = tableNameMap[rel.targetTableId];
        const targetCol = rel.targetColumnId
          ? columnNameMap[rel.targetColumnId]
          : null;
        // Create index on the child table's FK column
        if (targetTable && targetCol) {
          lines.push(
            `CREATE INDEX IF NOT EXISTS "idx_${targetTable}_${targetCol}" ON "${targetTable}" ("${targetCol}");`,
          );
        }
      });
    }

    return { sql: lines.join("\n"), projectName: project.name };
  });
