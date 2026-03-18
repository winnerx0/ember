import YAML from "yaml";
import { supabase } from "~/lib/supabase";

type YAMLColumn = {
  type?: string;
  primary?: boolean;
  unique?: boolean;
  nullable?: boolean;
  default?: string;
};

type YAMLTable = {
  columns?: Record<string, YAMLColumn | string>;
};

type YAMLRelationship = {
  from: string;
  to: string;
  type?: "one-to-one" | "one-to-many" | "many-to-one" | "many-to-many";
  via?: string;
};

type YAMLSchema = {
  tables?: Record<string, YAMLTable>;
  relationships?: YAMLRelationship[];
};

const VALID_TYPES = new Set([
  "uuid", "serial", "bigserial", "integer", "int", "bigint", "smallint",
  "numeric", "decimal", "real", "double precision", "boolean", "text", "varchar",
  "char", "date", "timestamp", "timestamptz", "json", "jsonb", "bytea",
]);

const TABLE_COLORS = [
  "oklch(0.488 0.243 264.376)",
  "oklch(0.696 0.17 162.48)",
  "oklch(0.769 0.188 70.08)",
  "oklch(0.627 0.265 303.9)",
  "oklch(0.645 0.246 16.439)",
];

function singularize(word: string): string {
  if (word.endsWith("ies")) return word.slice(0, -3) + "y";  // categories → category
  if (word.endsWith("ses") || word.endsWith("xes") || word.endsWith("zes")) return word.slice(0, -2); // classes → class
  if (word.endsWith("s")) return word.slice(0, -1);           // orders → order
  return word;
}

// Find an existing FK column in tableDef that references referencedTable.
function findFKColumn(tableDef: YAMLTable, referencedTable: string): string | null {
  const cols = tableDef.columns || {};
  const exact = `${referencedTable}_id`;
  if (exact in cols) return exact;
  const singular = singularize(referencedTable);
  if (singular !== referencedTable) {
    const singularCol = `${singular}_id`;
    if (singularCol in cols) return singularCol;
  }
  return null;
}

export function parseYAMLSchema(yamlString: string): {
  schema: YAMLSchema;
  errors: string[];
} {
  const errors: string[] = [];

  let parsed: any;
  try {
    parsed = YAML.parse(yamlString);
  } catch (e: any) {
    return { schema: {}, errors: [`Invalid YAML: ${e.message}`] };
  }

  if (!parsed || typeof parsed !== "object") {
    return { schema: {}, errors: ["YAML must be an object with a 'tables' key"] };
  }

  if (!parsed.tables || typeof parsed.tables !== "object") {
    return { schema: parsed, errors: ["Missing or invalid 'tables' key"] };
  }

  // Validate tables
  for (const [tableName, table] of Object.entries(parsed.tables)) {
    if (!tableName.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/)) {
      errors.push(`Invalid table name: "${tableName}" (use letters, numbers, underscores)`);
    }
    const t = table as YAMLTable;
    if (t.columns) {
      for (const [colName, col] of Object.entries(t.columns)) {
        if (!colName.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/)) {
          errors.push(`Invalid column name "${colName}" in table "${tableName}"`);
        }
        // Support shorthand: column_name: type
        const colType = typeof col === "string" ? col : col?.type;
        if (colType && !VALID_TYPES.has(colType.toLowerCase())) {
          errors.push(`Unknown type "${colType}" for ${tableName}.${colName}`);
        }
      }
    }
  }

  // Validate relationships
  if (parsed.relationships) {
    if (!Array.isArray(parsed.relationships)) {
      errors.push("'relationships' must be an array");
    } else {
      const tableNames = new Set(Object.keys(parsed.tables || {}));
      const validTypes = new Set(["one-to-one", "one-to-many", "many-to-one", "many-to-many"]);

      for (const [i, rel] of parsed.relationships.entries()) {
        if (!rel.from) errors.push(`Relationship ${i + 1}: missing 'from'`);
        if (!rel.to) errors.push(`Relationship ${i + 1}: missing 'to'`);
        if (rel.from && !tableNames.has(rel.from)) {
          errors.push(`Relationship ${i + 1}: unknown table "${rel.from}"`);
        }
        if (rel.to && !tableNames.has(rel.to)) {
          errors.push(`Relationship ${i + 1}: unknown table "${rel.to}"`);
        }
        if (rel.type && !validTypes.has(rel.type)) {
          errors.push(`Relationship ${i + 1}: invalid type "${rel.type}" (use one-to-one, one-to-many, many-to-one, many-to-many)`);
        }
        if (rel.via && !tableNames.has(rel.via)) {
          errors.push(`Relationship ${i + 1}: unknown via table "${rel.via}"`);
        }
      }
    }
  }

  return { schema: parsed as YAMLSchema, errors };
}

export async function importYAML({
  data,
}: {
  data: {
    projectId: string;
    yaml: string;
  };
}): Promise<{ tableCount: number; relationshipCount: number }> {
  const { schema, errors } = parseYAMLSchema(data.yaml);

  if (errors.length > 0) {
    throw new Error(errors.join("\n"));
  }

  if (!schema.tables) {
    throw new Error("No tables defined");
  }

  const tableNames = Object.keys(schema.tables);

  // Layout tables in a grid
  const COLS = Math.ceil(Math.sqrt(tableNames.length));
  const SPACING_X = 350;
  const SPACING_Y = 300;

  // Map table names to their IDs and column IDs
  const tableIdMap = new Map<string, string>();
  const columnIdMap = new Map<string, Map<string, string>>(); // tableName -> colName -> colId

  // Create all tables
  for (let i = 0; i < tableNames.length; i++) {
    const tableName = tableNames[i];
    const tableId = crypto.randomUUID();
    tableIdMap.set(tableName, tableId);
    columnIdMap.set(tableName, new Map());

    const col = i % COLS;
    const row = Math.floor(i / COLS);
    const color = TABLE_COLORS[i % TABLE_COLORS.length];

    const { error } = await supabase
      .from("erd_tables")
      .insert({
        id: tableId,
        project_id: data.projectId,
        name: tableName.replace(/\s+/g, "_"),
        color,
        position_x: 100 + col * SPACING_X,
        position_y: 100 + row * SPACING_Y,
      });

    if (error) throw new Error(`Failed to create table "${tableName}": ${error.message}`);
  }

  // Create columns for all tables
  for (const [tableName, tableDef] of Object.entries(schema.tables)) {
    const tableId = tableIdMap.get(tableName)!;
    const cols = tableDef.columns || {};
    const colMap = columnIdMap.get(tableName)!;

    let order = 0;
    for (const [colName, colDef] of Object.entries(cols)) {
      const colId = crypto.randomUUID();
      colMap.set(colName, colId);

      // Support shorthand: column_name: type
      const isShorthand = typeof colDef === "string";
      const colType = isShorthand ? colDef : (colDef?.type || "text");
      const isPrimary = isShorthand ? false : (colDef?.primary || false);
      const isUnique = isShorthand ? false : (colDef?.unique || false);
      const nullable = isShorthand ? true : (colDef?.nullable !== false && !isPrimary);
      const defaultValue = isShorthand ? null : (colDef?.default || null);

      const { error } = await supabase
        .from("erd_columns")
        .insert({
          id: colId,
          table_id: tableId,
          name: colName,
          type: colType.toLowerCase(),
          is_primary: isPrimary,
          is_unique: isUnique,
          nullable: nullable,
          default_value: defaultValue,
          order: order++,
        });

      if (error) throw new Error(`Failed to create column "${tableName}.${colName}": ${error.message}`);
    }
  }

  // Create relationships and FK columns
  let relationshipCount = 0;

  if (schema.relationships) {
    for (const rel of schema.relationships) {
      const relType = rel.type || "one-to-many";
      const sourceTableId = tableIdMap.get(rel.from)!;
      const targetTableId = tableIdMap.get(rel.to)!;
      const sourceColMap = columnIdMap.get(rel.from)!;
      const targetColMap = columnIdMap.get(rel.to)!;

      // Find primary keys
      const sourcePKName = Object.entries(schema.tables![rel.from].columns || {}).find(
        ([, col]) => typeof col !== "string" && col?.primary
      )?.[0];
      const targetPKName = Object.entries(schema.tables![rel.to].columns || {}).find(
        ([, col]) => typeof col !== "string" && col?.primary
      )?.[0];

      // many-to-many with explicit junction table: route as two one-to-many relationships
      if (relType === "many-to-many" && rel.via) {
        const viaTableId = tableIdMap.get(rel.via);
        if (!viaTableId) continue;
        const viaColMap = columnIdMap.get(rel.via)!;
        const viaTableDef = schema.tables![rel.via];

        const fromFKName = findFKColumn(viaTableDef, rel.from);
        const toFKName = findFKColumn(viaTableDef, rel.to);
        const fromPKId = sourcePKName ? sourceColMap.get(sourcePKName) : undefined;
        const toPKId = targetPKName ? targetColMap.get(targetPKName) : undefined;
        const fromFKId = fromFKName ? viaColMap.get(fromFKName) : undefined;
        const toFKId = toFKName ? viaColMap.get(toFKName) : undefined;

        if (fromPKId && fromFKId) {
          const { error } = await supabase.from("erd_relationships").insert({
            id: crypto.randomUUID(),
            source_table_id: sourceTableId,
            target_table_id: viaTableId,
            source_column_id: fromPKId,
            target_column_id: fromFKId,
            type: "one-to-many",
          });
          if (error) throw new Error(`Failed to create relationship ${rel.from} -> ${rel.via}: ${error.message}`);
        }

        if (toPKId && toFKId) {
          const { error } = await supabase.from("erd_relationships").insert({
            id: crypto.randomUUID(),
            source_table_id: targetTableId,
            target_table_id: viaTableId,
            source_column_id: toPKId,
            target_column_id: toFKId,
            type: "one-to-many",
          });
          if (error) throw new Error(`Failed to create relationship ${rel.to} -> ${rel.via}: ${error.message}`);
        }

        relationshipCount++;
        continue;
      }

      let sourceColumnId: string;
      let targetColumnId: string;

      if (relType === "many-to-many") {
        // No via: use PKs from both sides
        sourceColumnId = sourcePKName ? sourceColMap.get(sourcePKName)! : [...sourceColMap.values()][0];
        targetColumnId = targetPKName ? targetColMap.get(targetPKName)! : [...targetColMap.values()][0];
      } else if (relType === "many-to-one") {
        // FK in source table referencing target — reuse existing column if present
        const existingFKName = findFKColumn(schema.tables![rel.from], rel.to);
        if (existingFKName && sourceColMap.has(existingFKName)) {
          sourceColumnId = sourceColMap.get(existingFKName)!;
        } else {
          const fkColName = `${rel.to}_id`;
          const fkColId = crypto.randomUUID();
          const targetPKDef = targetPKName ? schema.tables![rel.to].columns![targetPKName] : null;
          const fkType = targetPKDef
            ? (typeof targetPKDef === "string" ? targetPKDef : targetPKDef.type || "uuid")
            : "uuid";

          const { error } = await supabase.from("erd_columns").insert({
            id: fkColId,
            table_id: sourceTableId,
            name: fkColName,
            type: fkType.toLowerCase(),
            is_primary: false,
            is_unique: false,
            nullable: false,
            default_value: null,
            order: sourceColMap.size,
          });
          if (error) throw new Error(`Failed to create FK column "${fkColName}": ${error.message}`);
          sourceColMap.set(fkColName, fkColId);
          sourceColumnId = fkColId;
        }
        targetColumnId = targetPKName ? targetColMap.get(targetPKName)! : [...targetColMap.values()][0];
      } else {
        // one-to-one, one-to-many: FK in target table referencing source — reuse existing column if present
        const existingFKName = findFKColumn(schema.tables![rel.to], rel.from);
        if (existingFKName && targetColMap.has(existingFKName)) {
          targetColumnId = targetColMap.get(existingFKName)!;
        } else {
          const fkColName = `${rel.from}_id`;
          const fkColId = crypto.randomUUID();
          const sourcePKDef = sourcePKName ? schema.tables![rel.from].columns![sourcePKName] : null;
          const fkType = sourcePKDef
            ? (typeof sourcePKDef === "string" ? sourcePKDef : sourcePKDef.type || "uuid")
            : "uuid";

          const { error } = await supabase.from("erd_columns").insert({
            id: fkColId,
            table_id: targetTableId,
            name: fkColName,
            type: fkType.toLowerCase(),
            is_primary: false,
            is_unique: relType === "one-to-one",
            nullable: false,
            default_value: null,
            order: targetColMap.size,
          });
          if (error) throw new Error(`Failed to create FK column "${fkColName}": ${error.message}`);
          targetColMap.set(fkColName, fkColId);
          targetColumnId = fkColId;
        }
        sourceColumnId = sourcePKName ? sourceColMap.get(sourcePKName)! : [...sourceColMap.values()][0];
      }

      // Create the relationship
      const { error } = await supabase.from("erd_relationships").insert({
        id: crypto.randomUUID(),
        source_table_id: sourceTableId,
        target_table_id: targetTableId,
        source_column_id: sourceColumnId,
        target_column_id: targetColumnId,
        type: relType,
      });

      if (error) throw new Error(`Failed to create relationship ${rel.from} -> ${rel.to}: ${error.message}`);
      relationshipCount++;
    }
  }

  return { tableCount: tableNames.length, relationshipCount };
}
