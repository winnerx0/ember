import { supabase } from "~/lib/supabase";

export async function addTable({
  data,
}: {
  data: {
    id?: string;
    projectId: string;
    name: string;
    color: string;
    positionX: number;
    positionY: number;
  };
}) {
  const { data: table, error } = await supabase
    .from("erd_tables")
    .insert({
      id: data.id,
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
}

export async function updateTable({
  data,
}: {
  data: {
    id: string;
    projectId: string;
    name: string;
    color: string;
  };
}) {
  const { error } = await supabase
    .from("erd_tables")
    .update({
      name: data.name,
      color: data.color,
    })
    .eq("id", data.id)
    .eq("project_id", data.projectId);

  if (error) throw error;
  return { success: true };
}

export async function deleteTable({
  data,
}: {
  data: { id: string; projectId: string };
}) {
  const { error } = await supabase
    .from("erd_tables")
    .delete()
    .eq("id", data.id)
    .eq("project_id", data.projectId);

  if (error) throw error;
  return { success: true };
}

export async function saveNodePositions({
  data,
}: {
  data: {
    projectId: string;
    nodes: Array<{ id: string; positionX: number; positionY: number }>;
  };
}) {
  if (data.nodes.length === 0) return { success: true };

  // Single batch upsert for all positions
  const { error } = await supabase
    .from("erd_tables")
    .upsert(
      data.nodes.map((node) => ({
        id: node.id,
        project_id: data.projectId,
        position_x: node.positionX,
        position_y: node.positionY,
      })),
      { onConflict: "id", ignoreDuplicates: false },
    );

  if (error) throw error;
  return { success: true };
}
