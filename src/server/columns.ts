import { createServerFn } from "@tanstack/react-start";
import { db } from "~/db";
import { erdColumns } from "~/db/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { z } from "zod";
import { invalidateCache, CACHE_KEYS } from "~/lib/redis";

const columnSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.string().default("text"),
  nullable: z.boolean().default(true),
  isPrimary: z.boolean().default(false),
  isUnique: z.boolean().default(false),
  defaultValue: z.string().optional(),
  order: z.number().default(0),
});

export const addColumn = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      tableId: z.string(),
      projectId: z.string(),
      column: columnSchema,
    }),
  )
  .handler(async ({ data }) => {
    const id = nanoid();
    const [col] = await db
      .insert(erdColumns)
      .values({ id, tableId: data.tableId, ...data.column })
      .returning();
    await invalidateCache(CACHE_KEYS.project(data.projectId));
    return col;
  });

export const updateColumn = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      id: z.string(),
      projectId: z.string(),
      column: columnSchema.partial(),
    }),
  )
  .handler(async ({ data }) => {
    const [updated] = await db
      .update(erdColumns)
      .set(data.column)
      .where(eq(erdColumns.id, data.id))
      .returning();
    await invalidateCache(CACHE_KEYS.project(data.projectId));
    return updated;
  });

export const deleteColumn = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string(), projectId: z.string() }))
  .handler(async ({ data }) => {
    await db.delete(erdColumns).where(eq(erdColumns.id, data.id));
    await invalidateCache(CACHE_KEYS.project(data.projectId));
    return { success: true };
  });

export const saveColumns = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      tableId: z.string(),
      projectId: z.string(),
      columns: z.array(
        z.object({
          id: z.string().optional(),
          name: z.string().min(1),
          type: z.string(),
          nullable: z.boolean(),
          isPrimary: z.boolean(),
          isUnique: z.boolean(),
          defaultValue: z.string().optional(),
          order: z.number(),
        }),
      ),
    }),
  )
  .handler(async ({ data }) => {
    // Delete all existing columns for this table
    await db.delete(erdColumns).where(eq(erdColumns.tableId, data.tableId));

    // Re-insert all columns
    if (data.columns.length > 0) {
      await db.insert(erdColumns).values(
        data.columns.map((col) => ({
          id: col.id || nanoid(),
          tableId: data.tableId,
          name: col.name,
          type: col.type,
          nullable: col.nullable,
          isPrimary: col.isPrimary,
          isUnique: col.isUnique,
          defaultValue: col.defaultValue,
          order: col.order,
        })),
      );
    }

    await invalidateCache(CACHE_KEYS.project(data.projectId));
    return { success: true };
  });
