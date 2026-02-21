import { c as createServerRpc } from "./createServerRpc-Bd3B-Ah9.js";
import { z } from "zod";
import { c as createSupabaseServerClient } from "./supabase-9upaG8fM.js";
import { c as createServerFn } from "../server.js";
import "@supabase/supabase-js";
import "@supabase/ssr";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core";
import "node:async_hooks";
import "@tanstack/router-core/ssr/server";
import "h3-v2";
import "tiny-invariant";
import "seroval";
import "react/jsx-runtime";
import "@tanstack/react-router/ssr/server";
import "@tanstack/react-router";
const getProjects_createServerFn_handler = createServerRpc({
  id: "cc7cd7848f868afd6039be219de40080fb83f7d9940fd5b40cf6821674ff7eb6",
  name: "getProjects",
  filename: "src/server/projects.ts"
}, (opts) => getProjects.__executeServer(opts));
const getProjects = createServerFn({
  method: "GET"
}).handler(getProjects_createServerFn_handler, async ({
  request
}) => {
  const supabase = createSupabaseServerClient(request);
  const {
    data: projects,
    error
  } = await supabase.from("projects").select(`
        id,
        name,
        description,
        updated_at,
        erd_tables (count)
      `).order("updated_at", {
    ascending: false
  });
  if (error) throw error;
  return projects.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    updatedAt: new Date(p.updated_at),
    tableCount: p.erd_tables[0]?.count || 0
  }));
});
const getProject_createServerFn_handler = createServerRpc({
  id: "0ef74326a5824c919c0259568e0bd5aa072fcba8ef27f40999ce5806d6baf0d1",
  name: "getProject",
  filename: "src/server/projects.ts"
}, (opts) => getProject.__executeServer(opts));
const getProject = createServerFn({
  method: "GET"
}).inputValidator(z.object({
  id: z.string()
})).handler(getProject_createServerFn_handler, async ({
  data,
  request
}) => {
  const supabase = createSupabaseServerClient(request);
  const {
    data: project,
    error: projectError
  } = await supabase.from("projects").select("*").eq("id", data.id).single();
  if (projectError) throw projectError;
  const {
    data: tables,
    error: tablesError
  } = await supabase.from("erd_tables").select(`
        *,
        erd_columns (*)
      `).eq("project_id", data.id).order("created_at", {
    ascending: true
  });
  if (tablesError) throw tablesError;
  const {
    data: relationships,
    error: relationshipsError
  } = await supabase.from("erd_relationships").select("*").in("source_table_id", tables.map((t) => t.id));
  if (relationshipsError) throw relationshipsError;
  return {
    name: project.name,
    description: project.description,
    tables: tables.map((t) => ({
      id: t.id,
      name: t.name,
      color: t.color,
      positionX: t.position_x,
      positionY: t.position_y,
      columns: (t.erd_columns || []).map((c) => ({
        id: c.id,
        name: c.name,
        type: c.type,
        nullable: c.nullable,
        isPrimary: c.is_primary,
        isUnique: c.is_unique,
        defaultValue: c.default_value,
        order: c.order
      })).sort((a, b) => a.order - b.order)
    })),
    relationships: (relationships || []).map((r) => ({
      id: r.id,
      sourceTableId: r.source_table_id,
      targetTableId: r.target_table_id,
      sourceColumnId: r.source_column_id,
      targetColumnId: r.target_column_id,
      type: r.type,
      label: r.label
    }))
  };
});
const createProject_createServerFn_handler = createServerRpc({
  id: "5c086309e3adf1cf08705ff24355fff50f75d23ae63e4c2852d7ae44b3405e8a",
  name: "createProject",
  filename: "src/server/projects.ts"
}, (opts) => createProject.__executeServer(opts));
const createProject = createServerFn({
  method: "POST"
}).inputValidator(z.object({
  name: z.string(),
  description: z.string().optional(),
  user_id: z.string()
})).handler(createProject_createServerFn_handler, async ({
  data,
  request
}) => {
  const supabase = createSupabaseServerClient(request);
  const {
    data: project,
    error
  } = await supabase.from("projects").insert({
    name: data.name,
    description: data.description,
    user_id: data.user_id
  }).select().single();
  if (error) throw error;
  return project;
});
const deleteProject_createServerFn_handler = createServerRpc({
  id: "ac9aa40c7a11203f7df71da777fdcfc5fb81276636a3c9f904c150c900958276",
  name: "deleteProject",
  filename: "src/server/projects.ts"
}, (opts) => deleteProject.__executeServer(opts));
const deleteProject = createServerFn({
  method: "POST"
}).inputValidator(z.object({
  id: z.string()
})).handler(deleteProject_createServerFn_handler, async ({
  data,
  request
}) => {
  const supabase = createSupabaseServerClient(request);
  const {
    error
  } = await supabase.from("projects").delete().eq("id", data.id);
  if (error) throw error;
  return {
    success: true
  };
});
export {
  createProject_createServerFn_handler,
  deleteProject_createServerFn_handler,
  getProject_createServerFn_handler,
  getProjects_createServerFn_handler
};
