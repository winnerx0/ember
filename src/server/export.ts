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

    // Get all relationships where both source AND target are in this project's tables
    const tableIds = tables.map(t => t.id);
    const allRelationships = await db
      .select()
      .from(erdRelationships);

    const filteredRelationships = allRelationships.filter(rel =>
      tableIds.includes(rel.sourceTableId) && tableIds.includes(rel.targetTableId)
    );

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

    if (filteredRelationships.length > 0) {
      lines.push(`-- Foreign Key Constraints`);
      filteredRelationships.forEach((rel) => {
        // Skip many-to-many relationships (they need junction tables)
        if (rel.type === 'many-to-many') return;

        const sourceTable = tableNameMap[rel.sourceTableId];
        const targetTable = tableNameMap[rel.targetTableId];
        const sourceCol = columnNameMap[rel.sourceColumnId];
        const targetCol = columnNameMap[rel.targetColumnId];

        if (!sourceTable || !targetTable || !sourceCol || !targetCol) return;

        // Determine which table has the FK based on relationship type
        // one-to-one: FK on target table
        // one-to-many: FK on target table (many side)
        // many-to-one: FK on source table
        let fkTable: string;
        let fkColumn: string;
        let referencedTable: string;
        let referencedColumn: string;

        if (rel.type === 'many-to-one') {
          // FK is on source table
          fkTable = sourceTable;
          fkColumn = targetCol; // This is the FK column in source table
          referencedTable = targetTable;
          referencedColumn = sourceCol; // This is the PK in target table
        } else {
          // one-to-one or one-to-many: FK is on target table
          fkTable = targetTable;
          fkColumn = targetCol; // This is the FK column in target table
          referencedTable = sourceTable;
          referencedColumn = sourceCol; // This is the PK in source table
        }

        const constraintName = `fk_${fkTable}_${referencedTable}`;
        lines.push(
          `ALTER TABLE "${fkTable}" ADD CONSTRAINT "${constraintName}"`,
        );
        lines.push(
          `  FOREIGN KEY ("${fkColumn}") REFERENCES "${referencedTable}" ("${referencedColumn}");`,
        );
        lines.push(``);
      });
    }

    // Indexes for FK columns
    if (filteredRelationships.length > 0) {
      lines.push(`-- Indexes`);
      filteredRelationships.forEach((rel) => {
        // Skip many-to-many relationships
        if (rel.type === 'many-to-many') return;

        const sourceTable = tableNameMap[rel.sourceTableId];
        const targetTable = tableNameMap[rel.targetTableId];
        const sourceCol = columnNameMap[rel.sourceColumnId];
        const targetCol = columnNameMap[rel.targetColumnId];

        if (!sourceTable || !targetTable || !sourceCol || !targetCol) return;

        // Determine which table has the FK
        let fkTable: string;
        let fkColumn: string;

        if (rel.type === 'many-to-one') {
          fkTable = sourceTable;
          fkColumn = targetCol;
        } else {
          fkTable = targetTable;
          fkColumn = targetCol;
        }

        lines.push(
          `CREATE INDEX IF NOT EXISTS "idx_${fkTable}_${fkColumn}" ON "${fkTable}" ("${fkColumn}");`,
        );
      });
    }

    return { sql: lines.join("\n"), projectName: project.name };
  });
