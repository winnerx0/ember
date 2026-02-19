import { createServerFn } from "@tanstack/react-start";
import { db } from "~/db";
import { erdRelationships } from "~/db/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { z } from "zod";
import { invalidateCache, CACHE_KEYS } from "~/lib/redis";

export const addRelationship = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      projectId: z.string(),
      sourceTableId: z.string(),
      sourceColumnId: z.string().optional(),
      targetTableId: z.string(),
      targetColumnId: z.string().optional(),
      type: z
        .enum(["one-to-one", "one-to-many", "many-to-many"])
        .default("one-to-many"),
      label: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const id = nanoid();
    const [rel] = await db
      .insert(erdRelationships)
      .values({ id, ...data })
      .returning();
    await invalidateCache(CACHE_KEYS.project(data.projectId));
    return rel;
  });

export const deleteRelationship = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string(), projectId: z.string() }))
  .handler(async ({ data }) => {
    await db.delete(erdRelationships).where(eq(erdRelationships.id, data.id));
    await invalidateCache(CACHE_KEYS.project(data.projectId));
    return { success: true };
  });

export const updateRelationship = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      id: z.string(),
      projectId: z.string(),
      type: z.enum(["one-to-one", "one-to-many", "many-to-many"]).optional(),
      label: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const { id, projectId, ...rest } = data;
    const [updated] = await db
      .update(erdRelationships)
      .set(rest)
      .where(eq(erdRelationships.id, id))
      .returning();
    await invalidateCache(CACHE_KEYS.project(projectId));
    return updated;
  });
