import { createServerFn } from "@tanstack/react-start";
import { db } from "~/db";
import { projects, erdTables, erdColumns, erdRelationships } from "~/db/schema";
import { eq, desc, inArray, or } from "drizzle-orm";
import { nanoid } from "nanoid";
import { z } from "zod";
import { getCache, setCache, invalidateCache, CACHE_KEYS } from "~/lib/redis";

export type ProjectWithStats = {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  tableCount: number;
};

export const getProjects = createServerFn({ method: "GET" }).handler(
  async () => {
    const cached = await getCache<ProjectWithStats[]>(CACHE_KEYS.projects());
    if (cached) return cached;

    const rows = await db
      .select()
      .from(projects)
      .orderBy(desc(projects.updatedAt));

    const result: ProjectWithStats[] = await Promise.all(
      rows.map(async (p) => {
        const tables = await db
          .select()
          .from(erdTables)
          .where(eq(erdTables.projectId, p.id));
        return { ...p, tableCount: tables.length };
      }),
    );

    await setCache(CACHE_KEYS.projects(), result, 60);
    return result;
  },
);

export const createProject = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      name: z.string().min(1).max(100),
      description: z.string().optional(),
      user_id: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    const id = nanoid();
    const [project] = await db
      .insert(projects)
      .values({ id, name: data.name, description: data.description, user_id: data.user_id })
      .returning();
    await invalidateCache(CACHE_KEYS.projects());
    return project;
  });

export const getProject = createServerFn({ method: "GET" })
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const cached = await getCache(CACHE_KEYS.project(data.id));
    if (cached) return cached;

    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, data.id));
    if (!project) throw new Error("Project not found");

    const tables = await db
      .select()
      .from(erdTables)
      .where(eq(erdTables.projectId, data.id));

    const columns = tables.length
      ? await db
          .select()
          .from(erdColumns)
          .where(eq(erdColumns.tableId, tables.map((t) => t.id)[0]))
      : [];

    // Fetch all columns for all tables
    const allColumns =
      tables.length > 0
        ? await Promise.all(
            tables.map((t) =>
              db
                .select()
                .from(erdColumns)
                .where(eq(erdColumns.tableId, t.id))
                .then((cols) => cols.sort((a, b) => a.order - b.order)),
            ),
          )
        : [];

    // Get relationships through tables (normalized schema)
    const relationshipTableIds = tables.map((t) => t.id);
    const relationships =
      relationshipTableIds.length > 0
        ? await db
            .select()
            .from(erdRelationships)
            .where(
              or(
                inArray(erdRelationships.sourceTableId, relationshipTableIds),
                inArray(erdRelationships.targetTableId, relationshipTableIds),
              ),
            )
        : [];

    const result = {
      ...project,
      tables: tables.map((t, i) => ({ ...t, columns: allColumns[i] || [] })),
      relationships,
    };

    await setCache(CACHE_KEYS.project(data.id), result, 120);
    return result;
  });

export const deleteProject = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    await db.delete(projects).where(eq(projects.id, data.id));
    await invalidateCache(CACHE_KEYS.projects());
    await invalidateCache(CACHE_KEYS.project(data.id));
    return { success: true };
  });

export const updateProject = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      id: z.string(),
      name: z.string().min(1).max(100),
      description: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const [updated] = await db
      .update(projects)
      .set({
        name: data.name,
        description: data.description,
        updatedAt: new Date(),
      })
      .where(eq(projects.id, data.id))
      .returning();
    await invalidateCache(CACHE_KEYS.projects());
    await invalidateCache(CACHE_KEYS.project(data.id));
    return updated;
  });
