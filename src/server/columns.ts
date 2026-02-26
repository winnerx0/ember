import { supabase } from "~/lib/supabase";

export async function saveColumns({
  data,
}: {
  data: {
    tableId: string;
    projectId: string;
    columns: Array<{
      id: string;
      name: string;
      type: string;
      nullable: boolean;
      isPrimary: boolean;
      isUnique: boolean;
      defaultValue?: string;
      order: number;
    }>;
  };
}) {
  // Get existing columns to find which ones to delete
  const { data: existingColumns } = await supabase
    .from("erd_columns")
    .select("id")
    .eq("table_id", data.tableId);

  const existingIds = new Set(existingColumns?.map((c) => c.id) || []);
  const newIds = new Set(data.columns.map((c) => c.id));

  // Delete columns that are no longer in the list
  const idsToDelete = Array.from(existingIds).filter((id) => !newIds.has(id));
  if (idsToDelete.length > 0) {
    const { error: deleteError } = await supabase
      .from("erd_columns")
      .delete()
      .in("id", idsToDelete);

    if (deleteError) {
      console.error("Delete error:", deleteError);
      throw deleteError;
    }
  }

  // Upsert all columns (insert new ones, update existing ones)
  for (const col of data.columns) {
    const { error: upsertError } = await supabase
      .from("erd_columns")
      .upsert({
        id: col.id,
        table_id: data.tableId,
        name: col.name,
        type: col.type,
        nullable: col.nullable,
        is_primary: col.isPrimary,
        is_unique: col.isUnique,
        default_value: col.defaultValue || null,
        order: col.order,
      }, {
        onConflict: 'id'
      });

    if (upsertError) {
      console.error("Upsert error for column:", col.name, upsertError);
      throw upsertError;
    }
  }

  return { success: true };
}
