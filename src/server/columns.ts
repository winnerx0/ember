import { supabase } from "~/lib/supabase";

type ColumnInput = {
  id: string;
  name: string;
  type: string;
  nullable: boolean;
  isPrimary: boolean;
  isUnique: boolean;
  defaultValue?: string;
  order: number;
};

export async function saveColumns({
  data,
}: {
  data: {
    tableId: string;
    projectId: string;
    columns: Array<ColumnInput>;
  };
}) {
  return saveColumnsBatch({ data: [{ tableId: data.tableId, columns: data.columns }] });
}

// Saves columns for multiple tables in 3 requests total (GET, DELETE, UPSERT)
export async function saveColumnsBatch({
  data,
}: {
  data: Array<{ tableId: string; columns: Array<ColumnInput> }>;
}) {
  const tableIds = data.map((d) => d.tableId);
  const allNewColumns = data.flatMap((d) =>
    d.columns.map((col) => ({
      id: col.id,
      table_id: d.tableId,
      name: col.name,
      type: col.type,
      nullable: col.nullable,
      is_primary: col.isPrimary,
      is_unique: col.isUnique,
      default_value: col.defaultValue || null,
      order: col.order,
    })),
  );

  // 1 request: get all existing column IDs for these tables
  const { data: existingColumns } = await supabase
    .from("erd_columns")
    .select("id")
    .in("table_id", tableIds);

  const existingIds = new Set(existingColumns?.map((c) => c.id) || []);
  const newIds = new Set(allNewColumns.map((c) => c.id));
  const idsToDelete = Array.from(existingIds).filter((id) => !newIds.has(id));

  // 1 request: delete removed columns (if any)
  if (idsToDelete.length > 0) {
    const { error: deleteError } = await supabase
      .from("erd_columns")
      .delete()
      .in("id", idsToDelete);
    if (deleteError) throw deleteError;
  }

  // 1 request: batch upsert all columns
  if (allNewColumns.length > 0) {
    const { error: upsertError } = await supabase
      .from("erd_columns")
      .upsert(allNewColumns, { onConflict: "id" });
    if (upsertError) throw upsertError;
  }

  return { success: true };
}
