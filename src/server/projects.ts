import { z } from "zod";
import { supabase } from "~/lib/supabase";

export async function getProjects() {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("Unauthorized");
  }

  const { data: projects, error } = await supabase
    .from("erd_projects")
    .select(
      `
      id,
      name,
      description,
      updated_at,
      erd_tables (count)
    `
    )
    .order("updated_at", { ascending: false });

  if (error) throw error;

  return projects.map((p: any) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    updatedAt: new Date(p.updated_at),
    tableCount: p.erd_tables[0]?.count || 0,
  }));
}

export async function getProject({ data }: { data: { id: string } }) {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("Unauthorized");
  }

  const { data: project, error: projectError } = await supabase
    .from("erd_projects")
    .select("*")
    .eq("id", data.id)
    .single();

  if (projectError) throw projectError;

  const { data: tables, error: tablesError } = await supabase
    .from("erd_tables")
    .select("*")
    .eq("project_id", data.id)
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

  const tablesWithColumns = tables.map((table) => ({
    id: table.id,
    name: table.name,
    color: table.color,
    positionX: table.position_x,
    positionY: table.position_y,
    columns: columns
      .filter((col) => col.table_id === table.id)
      .map((col) => ({
        id: col.id,
        name: col.name,
        type: col.type,
        nullable: col.nullable,
        isPrimary: col.is_primary,
        isUnique: col.is_unique,
        defaultValue: col.default_value ?? "",
        order: col.order,
      })),
  }));

  return {
    name: project.name,
    description: project.description,
    tables: tablesWithColumns,
    relationships: relationships.map((rel) => ({
      id: rel.id,
      sourceTableId: rel.source_table_id,
      targetTableId: rel.target_table_id,
      sourceColumnId: rel.source_column_id,
      targetColumnId: rel.target_column_id,
      type: rel.type,
      label: rel.label,
    })),
  };
}

export async function createProject({
  data,
}: {
  data: { name: string; description?: string };
}) {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("Unauthorized");
  }

  const { data: project, error } = await supabase
    .from("erd_projects")
    .insert({
      name: data.name,
      description: data.description || null,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: project.id,
    name: project.name,
    description: project.description,
    updatedAt: new Date(project.updated_at),
  };
}

export async function deleteProject({ data }: { data: { id: string } }) {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase
    .from("erd_projects")
    .delete()
    .eq("id", data.id)
    .eq("user_id", user.id);

  if (error) throw error;

  return { success: true };
}
