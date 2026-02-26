import { supabase } from "~/lib/supabase";
import { format } from "sql-formatter";

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

  const { data: columns, error: columnsError } = await supabase
    .from("erd_columns")
    .select("*")
    .in(
      "table_id",
      tables.map((t) => t.id)
    )
    .order("order", { ascending: true });

  if (columnsError) throw columnsError;

  const { data: relationships, error: relationshipsError } = await supabase
    .from("erd_relationships")
    .select("*")
    .in(
      "source_table_id",
      tables.map((t) => t.id)
    );

  if (relationshipsError) throw relationshipsError;

  let sql = `-- Ember ERD Export: ${project.name}\n`;
  sql += `-- Generated: ${new Date().toISOString().split("T")[0]}\n\n`;

  for (const table of tables) {
    const tableCols = columns.filter((col) => col.table_id === table.id);

    sql += `CREATE TABLE "${table.name}" (\n`;
    sql += tableCols
      .map((col) => {
        let line = `  "${col.name}" ${col.type.toUpperCase()}`;
        if (col.is_primary) line += " PRIMARY KEY";
        if (!col.nullable) line += " NOT NULL";
        if (col.is_unique && !col.is_primary) line += " UNIQUE";
        if (col.default_value) line += ` DEFAULT ${col.default_value}`;
        return line;
      })
      .join(",\n");
    sql += `\n);\n\n`;
  }

  if (relationships.length > 0) {
    // Generate junction tables for many-to-many relationships
    const manyToManyRels = relationships.filter((r) => r.type === "many-to-many");
    if (manyToManyRels.length > 0) {
      sql += `-- Junction Tables for Many-to-Many Relationships\n`;
      for (const rel of manyToManyRels) {
        const sourceTable = tables.find((t) => t.id === rel.source_table_id);
        const targetTable = tables.find((t) => t.id === rel.target_table_id);
        const sourceCol = columns.find((c) => c.id === rel.source_column_id);
        const targetCol = columns.find((c) => c.id === rel.target_column_id);

        if (sourceTable && targetTable && sourceCol && targetCol) {
          const junctionTableName = `${sourceTable.name}_${targetTable.name}`;
          sql += `CREATE TABLE "${junctionTableName}" (\n`;
          sql += `  "${sourceTable.name}_id" ${sourceCol.type.toUpperCase()} NOT NULL,\n`;
          sql += `  "${targetTable.name}_id" ${targetCol.type.toUpperCase()} NOT NULL,\n`;
          sql += `  PRIMARY KEY ("${sourceTable.name}_id", "${targetTable.name}_id")\n`;
          sql += `);\n\n`;
        }
      }
    }

    // Generate foreign key constraints
    sql += `-- Foreign Key Constraints\n`;
    for (const rel of relationships) {
      const sourceTable = tables.find((t) => t.id === rel.source_table_id);
      const targetTable = tables.find((t) => t.id === rel.target_table_id);
      const sourceCol = columns.find((c) => c.id === rel.source_column_id);
      const targetCol = columns.find((c) => c.id === rel.target_column_id);

      if (sourceTable && targetTable && sourceCol && targetCol) {
        if (rel.type === "many-to-many") {
          // Foreign keys for junction table
          const junctionTableName = `${sourceTable.name}_${targetTable.name}`;
          sql += `ALTER TABLE "${junctionTableName}" ADD CONSTRAINT "fk_${junctionTableName}_${sourceTable.name}"\n`;
          sql += `  FOREIGN KEY ("${sourceTable.name}_id") REFERENCES "${sourceTable.name}" ("${sourceCol.name}") ON DELETE CASCADE;\n\n`;
          sql += `ALTER TABLE "${junctionTableName}" ADD CONSTRAINT "fk_${junctionTableName}_${targetTable.name}"\n`;
          sql += `  FOREIGN KEY ("${targetTable.name}_id") REFERENCES "${targetTable.name}" ("${targetCol.name}") ON DELETE CASCADE;\n\n`;
        } else if (rel.type === "many-to-one") {
          // For many-to-one, FK is on source table
          sql += `ALTER TABLE "${sourceTable.name}" ADD CONSTRAINT "fk_${sourceTable.name}_${targetTable.name}"\n`;
          sql += `  FOREIGN KEY ("${sourceCol.name}") REFERENCES "${targetTable.name}" ("${targetCol.name}");\n\n`;
        } else {
          // For one-to-one and one-to-many, FK is on target table
          sql += `ALTER TABLE "${targetTable.name}" ADD CONSTRAINT "fk_${targetTable.name}_${sourceTable.name}"\n`;
          sql += `  FOREIGN KEY ("${targetCol.name}") REFERENCES "${sourceTable.name}" ("${sourceCol.name}");\n\n`;
        }
      }
    }
  }

  try {
    sql = format(sql, { language: "postgresql" });
  } catch (e) {
    // If formatting fails, return unformatted SQL
  }

  return { sql };
}
