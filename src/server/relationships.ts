import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createSupabaseServerClient } from "~/lib/supabase";

export const addRelationship = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      sourceTableId: z.string(),
      targetTableId: z.string(),
      sourceColumnId: z.string(),
      targetColumnId: z.string(),
      type: z.enum(["one-to-one", "one-to-many", "many-to-one", "many-to-many"]),
    })
  )
  .handler(async ({ data, request }) => {
    const supabase = createSupabaseServerClient(request);

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    const { data: relationship, error } = await supabase
      .from("erd_relationships")
      .insert({
        source_table_id: data.sourceTableId,
        target_table_id: data.targetTableId,
        source_column_id: data.sourceColumnId,
        target_column_id: data.targetColumnId,
        type: data.type,
      })
      .select()
      .single();

    if (error) throw error;

    return relationship;
  });

export const updateRelationship = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      id: z.string(),
      projectId: z.string(),
      type: z.enum(["one-to-one", "one-to-many", "many-to-one", "many-to-many"]),
      label: z.string().optional(),
      sourceColumnId: z.string().optional(),
      targetColumnId: z.string().optional(),
    })
  )
  .handler(async ({ data, request }) => {
    const supabase = createSupabaseServerClient(request);

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    const updates: any = { type: data.type };
    if (data.label !== undefined) updates.label = data.label;
    if (data.sourceColumnId !== undefined) updates.source_column_id = data.sourceColumnId;
    if (data.targetColumnId !== undefined) updates.target_column_id = data.targetColumnId;

    const { error } = await supabase
      .from("erd_relationships")
      .update(updates)
      .eq("id", data.id);

    if (error) throw error;

    return { success: true };
  });

export const deleteRelationship = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      id: z.string(),
      projectId: z.string(),
    })
  )
  .handler(async ({ data, request }) => {
    const supabase = createSupabaseServerClient(request);

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    const { error } = await supabase
      .from("erd_relationships")
      .delete()
      .eq("id", data.id);

    if (error) throw error;

    return { success: true };
  });
