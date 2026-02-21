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
const saveColumns_createServerFn_handler = createServerRpc({
  id: "f1f7d63a0ede53dd53af980cac9f4135a56de345c948383ed39062aca8096776",
  name: "saveColumns",
  filename: "src/server/columns.ts"
}, (opts) => saveColumns.__executeServer(opts));
const saveColumns = createServerFn({
  method: "POST"
}).inputValidator(z.object({
  tableId: z.string(),
  projectId: z.string(),
  columns: z.array(z.object({
    id: z.string(),
    name: z.string(),
    type: z.string(),
    nullable: z.boolean(),
    isPrimary: z.boolean(),
    isUnique: z.boolean(),
    defaultValue: z.string().optional(),
    order: z.number()
  }))
})).handler(saveColumns_createServerFn_handler, async ({
  data,
  request
}) => {
  const supabase = createSupabaseServerClient(request);
  const {
    data: existingColumns,
    error: fetchError
  } = await supabase.from("erd_columns").select("id").eq("table_id", data.tableId);
  if (fetchError) throw fetchError;
  const existingIds = new Set(existingColumns?.map((c) => c.id) || []);
  const newIds = new Set(data.columns.map((c) => c.id));
  const toDelete = [...existingIds].filter((id) => !newIds.has(id));
  if (toDelete.length > 0) {
    const {
      error: deleteError
    } = await supabase.from("erd_columns").delete().in("id", toDelete);
    if (deleteError) throw deleteError;
  }
  const {
    error: upsertError
  } = await supabase.from("erd_columns").upsert(data.columns.map((col) => ({
    id: col.id,
    table_id: data.tableId,
    name: col.name,
    type: col.type,
    nullable: col.nullable,
    is_primary: col.isPrimary,
    is_unique: col.isUnique,
    default_value: col.defaultValue || null,
    order: col.order
  })), {
    onConflict: "id"
  });
  if (upsertError) throw upsertError;
  return {
    success: true
  };
});
export {
  saveColumns_createServerFn_handler
};
