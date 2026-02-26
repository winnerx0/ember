import { supabase } from "~/lib/supabase";

export async function addRelationship({
  data,
}: {
  data: {
    id?: string;
    sourceTableId: string;
    targetTableId: string;
    sourceColumnId: string;
    targetColumnId: string;
    type: "one-to-one" | "one-to-many" | "many-to-one" | "many-to-many";
  };
}) {
  const { data: relationship, error } = await supabase
    .from("erd_relationships")
    .insert({
      id: data.id,
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
}

export async function updateRelationship({
  data,
}: {
  data: {
    id: string;
    projectId: string;
    type: "one-to-one" | "one-to-many" | "many-to-one" | "many-to-many";
    sourceColumnId?: string;
    targetColumnId?: string;
  };
}) {
  const updateData: any = { type: data.type };
  if (data.sourceColumnId) updateData.source_column_id = data.sourceColumnId;
  if (data.targetColumnId) updateData.target_column_id = data.targetColumnId;

  const { error } = await supabase
    .from("erd_relationships")
    .update(updateData)
    .eq("id", data.id);

  if (error) throw error;
  return { success: true };
}

export async function deleteRelationship({
  data,
}: {
  data: { id: string; projectId: string };
}) {
  const { error } = await supabase
    .from("erd_relationships")
    .delete()
    .eq("id", data.id);

  if (error) throw error;
  return { success: true };
}
