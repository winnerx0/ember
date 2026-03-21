import { supabase } from "~/lib/supabase";
import { format } from "sql-formatter";

// Map column types to proper PostgreSQL SQL syntax
function toSQLType(type: string): string {
  // Handle parameterized types like varchar(50), numeric(10,2)
  const match = type.match(/^([^(]+)(\(.*\))?$/);
  const base = match?.[1]?.trim().toLowerCase() ?? type.toLowerCase();
  const params = match?.[2] ?? "";

  const map: Record<string, string> = {
    uuid: "UUID",
    serial: "SERIAL",
    bigserial: "BIGSERIAL",
    integer: "INTEGER",
    int: "INT",
    bigint: "BIGINT",
    smallint: "SMALLINT",
    numeric: "NUMERIC",
    decimal: "DECIMAL",
    real: "REAL",
    "double precision": "DOUBLE PRECISION",
    boolean: "BOOLEAN",
    text: "TEXT",
    varchar: "VARCHAR",
    char: "CHAR",
    date: "DATE",
    time: "TIME",
    timetz: "TIMETZ",
    timestamp: "TIMESTAMP",
    timestamptz: "TIMESTAMPTZ",
    interval: "INTERVAL",
    json: "JSON",
    jsonb: "JSONB",
    bytea: "BYTEA",
    inet: "INET",
    cidr: "CIDR",
    macaddr: "MACADDR",
    money: "MONEY",
  };
  return (map[base] ?? base.toUpperCase()) + params;
}

export async function exportSQL({ data }: { data: { projectId: string } }) {
  const { data: project, error: projectError } = await supabase
    .from("erd_projects")
    .select("*")
    .eq("id", data.projectId)
    .single();

  if (projectError) throw projectError;

  const { data: tables, error: tablesError } = await supabase
    .from("erd_tables")
    .select("*")
    .eq("project_id", data.projectId)
    .order("created_at", { ascending: true });

  if (tablesError) throw tablesError;
  if (!tables || tables.length === 0) return { sql: "-- No tables found" };

  const { data: columns, error: columnsError } = await supabase
    .from("erd_columns")
    .select("*")
    .in(
      "table_id",
      tables.map((t) => t.id),
    )
    .order("order", { ascending: true });

  if (columnsError) throw columnsError;

  // Fetch relationships from both source and target perspectives to get all
  const { data: relationships, error: relationshipsError } = await supabase
    .from("erd_relationships")
    .select("*")
    .or(
      `source_table_id.in.(${tables.map((t) => t.id).join(",")}),target_table_id.in.(${tables.map((t) => t.id).join(",")})`,
    );

  if (relationshipsError) throw relationshipsError;

  // Deduplicate relationships (in case a relationship matches both filters)
  const uniqueRels = Array.from(
    new Map((relationships || []).map((r) => [r.id, r])).values(),
  );

  let sql = `-- Ember ERD Export: ${project.name}\n`;
  sql += `-- Generated: ${new Date().toISOString().split("T")[0]}\n\n`;

  // CREATE TABLE statements
  for (const table of tables) {
    const tableCols = (columns || []).filter((col) => col.table_id === table.id);
    const primaryCols = tableCols.filter((col) => col.is_primary);
    const isCompositePK = primaryCols.length > 1;

    sql += `CREATE TABLE "${table.name}" (\n`;
    const colDefs = tableCols.map((col) => {
      let line = `  "${col.name}" ${toSQLType(col.type)}`;
      // Only inline PRIMARY KEY for single-column PKs
      if (col.is_primary && !isCompositePK) line += " PRIMARY KEY";
      if (!col.nullable && !col.is_primary) line += " NOT NULL";
      if (col.is_unique && !col.is_primary) line += " UNIQUE";
      if (col.default_value) line += ` DEFAULT ${col.default_value}`;
      return line;
    });

    // Add composite primary key as table constraint
    if (isCompositePK) {
      colDefs.push(`  PRIMARY KEY (${primaryCols.map((c) => `"${c.name}"`).join(", ")})`);
    }

    sql += colDefs.join(",\n");
    sql += `\n);\n\n`;
  }

  if (uniqueRels.length > 0) {
    // Junction tables for many-to-many
    const manyToManyRels = uniqueRels.filter((r) => r.type === "many-to-many");
    if (manyToManyRels.length > 0) {
      sql += `-- Junction Tables for Many-to-Many Relationships\n`;
      for (const rel of manyToManyRels) {
        const sourceTable = tables.find((t) => t.id === rel.source_table_id);
        const targetTable = tables.find((t) => t.id === rel.target_table_id);
        // Find source PK and target PK (for many-to-many both sides reference PKs)
        const sourcePK =
          (columns || []).find(
            (c) => c.table_id === rel.source_table_id && c.is_primary,
          ) || (columns || []).find((c) => c.id === rel.source_column_id);
        const targetPK =
          (columns || []).find(
            (c) => c.table_id === rel.target_table_id && c.is_primary,
          ) || (columns || []).find((c) => c.id === rel.target_column_id);

        if (sourceTable && targetTable && sourcePK && targetPK) {
          const junctionName = `${sourceTable.name}_${targetTable.name}`;
          sql += `CREATE TABLE "${junctionName}" (\n`;
          sql += `  "${sourceTable.name}_id" ${toSQLType(sourcePK.type)} NOT NULL,\n`;
          sql += `  "${targetTable.name}_id" ${toSQLType(targetPK.type)} NOT NULL,\n`;
          sql += `  PRIMARY KEY ("${sourceTable.name}_id", "${targetTable.name}_id")\n`;
          sql += `);\n\n`;
        }
      }
    }

    // Foreign key constraints
    sql += `-- Foreign Key Constraints\n`;
    for (const rel of uniqueRels) {
      const sourceTable = tables.find((t) => t.id === rel.source_table_id);
      const targetTable = tables.find((t) => t.id === rel.target_table_id);

      // Look up columns by ID first, fall back to convention-based lookup
      let sourceCol = (columns || []).find((c) => c.id === rel.source_column_id);
      let targetCol = (columns || []).find((c) => c.id === rel.target_column_id);

      // Fallback: find by naming convention if IDs are stale
      const singularize = (w: string) => {
        if (w.endsWith("ies")) return w.slice(0, -3) + "y";
        if (w.endsWith("ses") || w.endsWith("xes") || w.endsWith("zes")) return w.slice(0, -2);
        if (w.endsWith("s")) return w.slice(0, -1);
        return w;
      };
      if (!sourceCol && sourceTable) {
        sourceCol = (columns || []).find(
          (c) => c.table_id === sourceTable.id && c.is_primary,
        );
      }
      if (!targetCol && targetTable && sourceTable) {
        const singular = singularize(sourceTable.name);
        targetCol =
          (columns || []).find(
            (c) => c.table_id === targetTable.id && c.name === `${singular}_id`,
          ) ??
          (columns || []).find(
            (c) => c.table_id === targetTable.id && c.name === `${sourceTable.name}_id`,
          );
      }

      if (!sourceTable || !targetTable || !sourceCol || !targetCol) continue;

      if (rel.type === "many-to-many") {
        const junctionName = `${sourceTable.name}_${targetTable.name}`;
        const sourcePK =
          (columns || []).find(
            (c) => c.table_id === sourceTable.id && c.is_primary,
          ) || sourceCol;
        const targetPK =
          (columns || []).find(
            (c) => c.table_id === targetTable.id && c.is_primary,
          ) || targetCol;

        sql += `ALTER TABLE "${junctionName}" ADD CONSTRAINT "fk_${junctionName}_${sourceTable.name}"\n`;
        sql += `  FOREIGN KEY ("${sourceTable.name}_id") REFERENCES "${sourceTable.name}" ("${sourcePK.name}") ON DELETE CASCADE;\n\n`;
        sql += `ALTER TABLE "${junctionName}" ADD CONSTRAINT "fk_${junctionName}_${targetTable.name}"\n`;
        sql += `  FOREIGN KEY ("${targetTable.name}_id") REFERENCES "${targetTable.name}" ("${targetPK.name}") ON DELETE CASCADE;\n\n`;
      } else if (rel.type === "many-to-one") {
        // FK is in SOURCE table referencing TARGET
        sql += `ALTER TABLE "${sourceTable.name}" ADD CONSTRAINT "fk_${sourceTable.name}_${sourceCol.name}"\n`;
        sql += `  FOREIGN KEY ("${sourceCol.name}") REFERENCES "${targetTable.name}" ("${targetCol.name}") ON DELETE CASCADE;\n\n`;
      } else if (rel.type === "one-to-one") {
        // FK is in TARGET table, must be UNIQUE
        sql += `ALTER TABLE "${targetTable.name}" ADD CONSTRAINT "fk_${targetTable.name}_${targetCol.name}"\n`;
        sql += `  FOREIGN KEY ("${targetCol.name}") REFERENCES "${sourceTable.name}" ("${sourceCol.name}") ON DELETE CASCADE;\n\n`;
        sql += `ALTER TABLE "${targetTable.name}" ADD CONSTRAINT "uq_${targetTable.name}_${targetCol.name}"\n`;
        sql += `  UNIQUE ("${targetCol.name}");\n\n`;
      } else {
        // one-to-many: FK is in TARGET table
        sql += `ALTER TABLE "${targetTable.name}" ADD CONSTRAINT "fk_${targetTable.name}_${targetCol.name}"\n`;
        sql += `  FOREIGN KEY ("${targetCol.name}") REFERENCES "${sourceTable.name}" ("${sourceCol.name}") ON DELETE CASCADE;\n\n`;
      }
    }
  }

  // CHECK constraints, indexes, and multi-column unique constraints from table metadata
  let hasConstraints = false;
  let hasIndexes = false;

  for (const table of tables) {
    const meta = (table as any).metadata || {};

    // CHECK constraints
    if (meta.checks && Array.isArray(meta.checks)) {
      if (!hasConstraints) {
        sql += `-- CHECK Constraints\n`;
        hasConstraints = true;
      }
      for (const check of meta.checks) {
        const constraintName = check.column
          ? `chk_${table.name}_${check.column}`
          : `chk_${table.name}_${meta.checks.indexOf(check)}`;
        sql += `ALTER TABLE "${table.name}" ADD CONSTRAINT "${constraintName}"\n`;
        sql += `  CHECK (${check.expression});\n\n`;
      }
    }

    // Multi-column unique constraints
    if (meta.unique && Array.isArray(meta.unique)) {
      if (!hasConstraints) {
        sql += `-- Constraints\n`;
        hasConstraints = true;
      }
      for (const cols of meta.unique) {
        if (Array.isArray(cols) && cols.length > 0) {
          const constraintName = `uq_${table.name}_${cols.join("_")}`;
          sql += `ALTER TABLE "${table.name}" ADD CONSTRAINT "${constraintName}"\n`;
          sql += `  UNIQUE (${cols.map((c: string) => `"${c}"`).join(", ")});\n\n`;
        }
      }
    }

    // Indexes
    if (meta.indexes && Array.isArray(meta.indexes)) {
      if (!hasIndexes) {
        sql += `-- Indexes\n`;
        hasIndexes = true;
      }
      for (const idx of meta.indexes) {
        if (idx.columns && Array.isArray(idx.columns)) {
          const indexName = idx.name || `idx_${table.name}_${idx.columns.join("_")}`;
          const uniquePrefix = idx.unique ? "UNIQUE " : "";
          sql += `CREATE ${uniquePrefix}INDEX "${indexName}" ON "${table.name}" (${idx.columns.map((c: string) => `"${c}"`).join(", ")});\n\n`;
        }
      }
    }
  }

  try {
    sql = format(sql, { language: "postgresql" });
  } catch {
    // Return unformatted if formatter fails
  }

  return { sql };
}
