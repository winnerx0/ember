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
const addRelationship_createServerFn_handler = createServerRpc({
  id: "981ce0898eb85af859bfbd2a7094d57e619c32085e51290d8956b8bee1dbf266",
  name: "addRelationship",
  filename: "src/server/relationships.ts"
}, (opts) => addRelationship.__executeServer(opts));
const addRelationship = createServerFn({
  method: "POST"
}).inputValidator(z.object({
  sourceTableId: z.string(),
  targetTableId: z.string(),
  sourceColumnId: z.string(),
  targetColumnId: z.string(),
  type: z.enum(["one-to-one", "one-to-many", "many-to-one", "many-to-many"])
})).handler(addRelationship_createServerFn_handler, async ({
  data,
  request
}) => {
  const supabase = createSupabaseServerClient(request);
  const {
    data: relationship,
    error
  } = await supabase.from("erd_relationships").insert({
    source_table_id: data.sourceTableId,
    target_table_id: data.targetTableId,
    source_column_id: data.sourceColumnId,
    target_column_id: data.targetColumnId,
    type: data.type
  }).select().single();
  if (error) throw error;
  return relationship;
});
const updateRelationship_createServerFn_handler = createServerRpc({
  id: "a3d4328b3a11a1e9408eea7ad16303f96e3aea5eeff419a92f5992e93d713b3b",
  name: "updateRelationship",
  filename: "src/server/relationships.ts"
}, (opts) => updateRelationship.__executeServer(opts));
const updateRelationship = createServerFn({
  method: "POST"
}).inputValidator(z.object({
  id: z.string(),
  projectId: z.string(),
  type: z.enum(["one-to-one", "one-to-many", "many-to-one", "many-to-many"]),
  label: z.string().optional()
})).handler(updateRelationship_createServerFn_handler, async ({
  data,
  request
}) => {
  const supabase = createSupabaseServerClient(request);
  const updates = {
    type: data.type
  };
  if (data.label !== void 0) updates.label = data.label;
  const {
    error
  } = await supabase.from("erd_relationships").update(updates).eq("id", data.id);
  if (error) throw error;
  return {
    success: true
  };
});
const deleteRelationship_createServerFn_handler = createServerRpc({
  id: "760f61dd91c43d5debcd16b0fb3389a01eb26db53e209591fba09deff78a1639",
  name: "deleteRelationship",
  filename: "src/server/relationships.ts"
}, (opts) => deleteRelationship.__executeServer(opts));
const deleteRelationship = createServerFn({
  method: "POST"
}).inputValidator(z.object({
  id: z.string(),
  projectId: z.string()
})).handler(deleteRelationship_createServerFn_handler, async ({
  data,
  request
}) => {
  const supabase = createSupabaseServerClient(request);
  const {
    error
  } = await supabase.from("erd_relationships").delete().eq("id", data.id);
  if (error) throw error;
  return {
    success: true
  };
});
export {
  addRelationship_createServerFn_handler,
  deleteRelationship_createServerFn_handler,
  updateRelationship_createServerFn_handler
};
