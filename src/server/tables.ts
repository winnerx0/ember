import { createServerFn } from "@tanstack/react-start";
import { db } from "~/db";
import { erdTables, projects } from "~/db/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { z } from "zod";
import { invalidateCache, CACHE_KEYS } from "~/lib/redis";

export const addTable = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      projectId: z.string(),
      name: z.string().min(1).max(100),
      color: z.string().default("#f97316"),
      positionX: z.number().default(100),
      positionY: z.number().default(100),
    }),
  )
  .handler(async ({ data }) => {
    const id = nanoid();
    const [table] = await db
      .insert(erdTables)
      .values({
        id,
        projectId: data.projectId,
        name: data.name,
        color: data.color,
        positionX: data.positionX,
        positionY: data.positionY,
      })
      .returning();
    await invalidateCache(CACHE_KEYS.project(data.projectId));
    return table;
  });

export const updateTable = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      id: z.string(),
      projectId: z.string(),
      name: z.string().min(1).max(100).optional(),
      color: z.string().optional(),
      positionX: z.number().optional(),
      positionY: z.number().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const { id, projectId, ...rest } = data;
    const [updated] = await db
      .update(erdTables)
      .set({ ...rest, updatedAt: new Date() })
      .where(eq(erdTables.id, id))
      .returning();
    await invalidateCache(CACHE_KEYS.project(projectId));
    return updated;
  });

export const deleteTable = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string(), projectId: z.string() }))
  .handler(async ({ data }) => {
    await db.delete(erdTables).where(eq(erdTables.id, data.id));
    await invalidateCache(CACHE_KEYS.project(data.projectId));
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
        }),
      ),
    }),
  )
  .handler(async ({ data }) => {
    await Promise.all(
      data.nodes.map((node) =>
        db
          .update(erdTables)
          .set({ positionX: node.positionX, positionY: node.positionY })
          .where(eq(erdTables.id, node.id)),
      ),
    );
    await invalidateCache(CACHE_KEYS.project(data.projectId));
    return { success: true };
  });
