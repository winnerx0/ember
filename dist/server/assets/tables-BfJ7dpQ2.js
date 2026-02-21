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
const addTable_createServerFn_handler = createServerRpc({
  id: "9f3591552cd5e37328a63e295f233b095dba2494d628446d804fb1b7a5c4ec75",
  name: "addTable",
  filename: "src/server/tables.ts"
}, (opts) => addTable.__executeServer(opts));
const addTable = createServerFn({
  method: "POST"
}).inputValidator(z.object({
  projectId: z.string(),
  name: z.string(),
  color: z.string(),
  positionX: z.number(),
  positionY: z.number()
})).handler(addTable_createServerFn_handler, async ({
  data,
  request
}) => {
  const supabase = createSupabaseServerClient(request);
  const {
    data: table,
    error
  } = await supabase.from("erd_tables").insert({
    project_id: data.projectId,
    name: data.name,
    color: data.color,
    position_x: data.positionX,
    position_y: data.positionY
  }).select().single();
  if (error) throw error;
  return table;
});
const updateTable_createServerFn_handler = createServerRpc({
  id: "e28ba7ed4f93954c9b8ed7cc711a7758d7b2f5919a12fc34011f281e0bfcf22a",
  name: "updateTable",
  filename: "src/server/tables.ts"
}, (opts) => updateTable.__executeServer(opts));
const updateTable = createServerFn({
  method: "POST"
}).inputValidator(z.object({
  id: z.string(),
  projectId: z.string(),
  name: z.string().optional(),
  color: z.string().optional()
})).handler(updateTable_createServerFn_handler, async ({
  data,
  request
}) => {
  const supabase = createSupabaseServerClient(request);
  const updates = {};
  if (data.name !== void 0) updates.name = data.name;
  if (data.color !== void 0) updates.color = data.color;
  const {
    error
  } = await supabase.from("erd_tables").update(updates).eq("id", data.id).eq("project_id", data.projectId);
  if (error) throw error;
  return {
    success: true
  };
});
const deleteTable_createServerFn_handler = createServerRpc({
  id: "06b3be462e99b83664173521250b7d37727a2b0daecd7420b719c9fdd0f91d25",
  name: "deleteTable",
  filename: "src/server/tables.ts"
}, (opts) => deleteTable.__executeServer(opts));
const deleteTable = createServerFn({
  method: "POST"
}).inputValidator(z.object({
  id: z.string(),
  projectId: z.string()
})).handler(deleteTable_createServerFn_handler, async ({
  data,
  request
}) => {
  const supabase = createSupabaseServerClient(request);
  const {
    error
  } = await supabase.from("erd_tables").delete().eq("id", data.id).eq("project_id", data.projectId);
  if (error) throw error;
  return {
    success: true
  };
});
const saveNodePositions_createServerFn_handler = createServerRpc({
  id: "142c5bccf32e890a2ebd2a0b39aa09e35def82403b965f8a2015dce75ccdd69b",
  name: "saveNodePositions",
  filename: "src/server/tables.ts"
}, (opts) => saveNodePositions.__executeServer(opts));
const saveNodePositions = createServerFn({
  method: "POST"
}).inputValidator(z.object({
  projectId: z.string(),
  nodes: z.array(z.object({
    id: z.string(),
    positionX: z.number(),
    positionY: z.number()
  }))
})).handler(saveNodePositions_createServerFn_handler, async ({
  data,
  request
}) => {
  const supabase = createSupabaseServerClient(request);
  const updates = data.nodes.map((node) => supabase.from("erd_tables").update({
    position_x: node.positionX,
    position_y: node.positionY
  }).eq("id", node.id).eq("project_id", data.projectId));
  const results = await Promise.all(updates);
  const errors = results.filter((r) => r.error);
  if (errors.length > 0) {
    throw errors[0].error;
  }
  return {
    success: true
  };
});
export {
  addTable_createServerFn_handler,
  deleteTable_createServerFn_handler,
  saveNodePositions_createServerFn_handler,
  updateTable_createServerFn_handler
};
