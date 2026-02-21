import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createSupabaseServerClient } from "~/lib/supabase";

export const getProjects = createServerFn({ method: "GET" }).handler(
  async ({ request }) => {
    const supabase = createSupabaseServerClient(request);

    // Verify user is authenticated
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
);

export const getProject = createServerFn({ method: "GET" })
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data, request }) => {
    const supabase = createSupabaseServerClient(request);

    // Verify user is authenticated
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
      .select(
        `
        *,
        erd_columns (*)
      `
      )
      .eq("project_id", data.id)
      .order("created_at", { ascending: true });

    if (tablesError) throw tablesError;

    const { data: relationships, error: relationshipsError } = await supabase
      .from("erd_relationships")
      .select("*")
      .in(
        "source_table_id",
        tables.map((t: any) => t.id)
      );

    if (relationshipsError) throw relationshipsError;

    return {
      name: project.name,
      description: project.description,
      tables: tables.map((t: any) => ({
        id: t.id,
        name: t.name,
        color: t.color,
        positionX: t.position_x,
        positionY: t.position_y,
        columns: (t.erd_columns || [])
          .map((c: any) => ({
            id: c.id,
            name: c.name,
            type: c.type,
            nullable: c.nullable,
            isPrimary: c.is_primary,
            isUnique: c.is_unique,
            defaultValue: c.default_value,
            order: c.order,
          }))
          .sort((a: any, b: any) => a.order - b.order),
      })),
      relationships: (relationships || []).map((r: any) => ({
        id: r.id,
        sourceTableId: r.source_table_id,
        targetTableId: r.target_table_id,
        sourceColumnId: r.source_column_id,
        targetColumnId: r.target_column_id,
        type: r.type,
        label: r.label,
      })),
    };
  });

export const createProject = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      name: z.string(),
      description: z.string().optional(),
    })
  )
  .handler(async ({ data, request }) => {
    const supabase = createSupabaseServerClient(request);

    // Debug: Log cookies
    console.log('=== CREATE PROJECT DEBUG ===');
    console.log('Cookie header:', request.headers.get('Cookie'));

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('User:', user);
    console.log('Auth error:', authError);

    if (authError || !user) {
      console.error('Authentication failed:', authError);
      throw new Error("Unauthorized - please sign in again");
    }

    console.log('Creating project for user:', user.id);

    const { data: project, error } = await supabase
      .from("erd_projects")
      .insert({
        name: data.name,
        description: data.description,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    console.log('Project created:', project);
    return project;
  });

export const deleteProject = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data, request }) => {
    const supabase = createSupabaseServerClient(request);

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    const { error } = await supabase
      .from("erd_projects")
      .delete()
      .eq("id", data.id);

    if (error) throw error;

    return { success: true };
  });
