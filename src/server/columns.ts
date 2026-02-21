import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createSupabaseServerClient } from "~/lib/supabase";

export const saveColumns = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      tableId: z.string(),
      projectId: z.string(),
      columns: z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          type: z.string(),
          nullable: z.boolean(),
          isPrimary: z.boolean(),
          isUnique: z.boolean(),
          defaultValue: z.string().optional(),
          order: z.number(),
        })
      ),
    })
  )
  .handler(async ({ data, request }) => {
    const supabase = createSupabaseServerClient(request);

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    // Get existing columns for this table
    const { data: existingColumns, error: fetchError } = await supabase
      .from("erd_columns")
      .select("id")
      .eq("table_id", data.tableId);

    if (fetchError) throw fetchError;

    const existingIds = new Set(existingColumns?.map((c: any) => c.id) || []);
    const newIds = new Set(data.columns.map((c) => c.id));

    // Delete columns that are no longer in the list
    const toDelete = [...existingIds].filter((id) => !newIds.has(id));
    if (toDelete.length > 0) {
      const { error: deleteError } = await supabase
        .from("erd_columns")
        .delete()
        .in("id", toDelete);

      if (deleteError) throw deleteError;
    }

    // Upsert all columns
    const { error: upsertError } = await supabase
      .from("erd_columns")
      .upsert(
        data.columns.map((col) => ({
          id: col.id,
          table_id: data.tableId,
          name: col.name,
          type: col.type,
          nullable: col.nullable,
          is_primary: col.isPrimary,
          is_unique: col.isUnique,
          default_value: col.defaultValue || null,
          order: col.order,
        })),
        { onConflict: "id" }
      );

    if (upsertError) throw upsertError;

    return { success: true };
  });
