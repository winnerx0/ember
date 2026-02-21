import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createSupabaseServerClient } from "~/lib/supabase";

export const addTable = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      projectId: z.string(),
      name: z.string(),
      color: z.string(),
      positionX: z.number(),
      positionY: z.number(),
    })
  )
  .handler(async ({ data, request }) => {
    const supabase = createSupabaseServerClient(request);

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    const { data: table, error } = await supabase
      .from("erd_tables")
      .insert({
        project_id: data.projectId,
        name: data.name,
        color: data.color,
        position_x: data.positionX,
        position_y: data.positionY,
      })
      .select()
      .single();

    if (error) throw error;

    return table;
  });

export const updateTable = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      id: z.string(),
      projectId: z.string(),
      name: z.string().optional(),
      color: z.string().optional(),
    })
  )
  .handler(async ({ data, request }) => {
    const supabase = createSupabaseServerClient(request);

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    const updates: any = {};
    if (data.name !== undefined) updates.name = data.name;
    if (data.color !== undefined) updates.color = data.color;

    const { error } = await supabase
      .from("erd_tables")
      .update(updates)
      .eq("id", data.id)
      .eq("project_id", data.projectId);

    if (error) throw error;

    return { success: true };
  });

export const deleteTable = createServerFn({ method: "POST" })
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
      .from("erd_tables")
      .delete()
      .eq("id", data.id)
      .eq("project_id", data.projectId);

    if (error) throw error;

    return { success: true };
  });

export const saveNodePositions = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      projectId: z.string(),
      nodes: z.array(
        z.object({
          id: z.string(),
          positionX: z.number(),
          positionY: z.number(),
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

    // Update positions for all nodes
    const updates = data.nodes.map((node) =>
      supabase
        .from("erd_tables")
        .update({
          position_x: node.positionX,
          position_y: node.positionY,
        })
        .eq("id", node.id)
        .eq("project_id", data.projectId)
    );

    const results = await Promise.all(updates);
    const errors = results.filter((r) => r.error);

    if (errors.length > 0) {
      throw errors[0].error;
    }

    return { success: true };
  });
