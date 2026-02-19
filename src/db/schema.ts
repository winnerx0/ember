import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  real,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums
export const relationshipTypeEnum = pgEnum("relationship_type", [
  "one-to-one",
  "one-to-many",
  "many-to-many",
]);

export const columnTypeEnum = pgEnum("column_type", [
  "serial",
  "bigserial",
  "integer",
  "bigint",
  "smallint",
  "numeric",
  "real",
  "double precision",
  "boolean",
  "text",
  "varchar",
  "char",
  "uuid",
  "date",
  "timestamp",
  "timestamptz",
  "json",
  "jsonb",
  "bytea",
]);

// Projects table
export const projects = pgTable("projects", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ERD Tables (nodes)
export const erdTables = pgTable("erd_tables", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  color: text("color").notNull().default("#f97316"),
  positionX: real("position_x").notNull().default(0),
  positionY: real("position_y").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ERD Columns (per table)
export const erdColumns = pgTable("erd_columns", {
  id: text("id").primaryKey(),
  tableId: text("table_id")
    .notNull()
    .references(() => erdTables.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  type: text("type").notNull().default("text"),
  nullable: boolean("nullable").notNull().default(true),
  isPrimary: boolean("is_primary").notNull().default(false),
  isUnique: boolean("is_unique").notNull().default(false),
  defaultValue: text("default_value"),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ERD Relationships (edges)
export const erdRelationships = pgTable("erd_relationships", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  sourceTableId: text("source_table_id")
    .notNull()
    .references(() => erdTables.id, { onDelete: "cascade" }),
  sourceColumnId: text("source_column_id").references(() => erdColumns.id, {
    onDelete: "set null",
  }),
  targetTableId: text("target_table_id")
    .notNull()
    .references(() => erdTables.id, { onDelete: "cascade" }),
  targetColumnId: text("target_column_id").references(() => erdColumns.id, {
    onDelete: "set null",
  }),
  type: text("type").notNull().default("one-to-many"),
  label: text("label"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const projectsRelations = relations(projects, ({ many }) => ({
  tables: many(erdTables),
  relationships: many(erdRelationships),
}));

export const erdTablesRelations = relations(erdTables, ({ one, many }) => ({
  project: one(projects, {
    fields: [erdTables.projectId],
    references: [projects.id],
  }),
  columns: many(erdColumns),
  sourceRelationships: many(erdRelationships, {
    relationName: "sourceTable",
  }),
  targetRelationships: many(erdRelationships, {
    relationName: "targetTable",
  }),
}));

export const erdColumnsRelations = relations(erdColumns, ({ one }) => ({
  table: one(erdTables, {
    fields: [erdColumns.tableId],
    references: [erdTables.id],
  }),
}));

export const erdRelationshipsRelations = relations(
  erdRelationships,
  ({ one }) => ({
    project: one(projects, {
      fields: [erdRelationships.projectId],
      references: [projects.id],
    }),
    sourceTable: one(erdTables, {
      fields: [erdRelationships.sourceTableId],
      references: [erdTables.id],
      relationName: "sourceTable",
    }),
    targetTable: one(erdTables, {
      fields: [erdRelationships.targetTableId],
      references: [erdTables.id],
      relationName: "targetTable",
    }),
  }),
);

// Types
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type ErdTable = typeof erdTables.$inferSelect;
export type NewErdTable = typeof erdTables.$inferInsert;
export type ErdColumn = typeof erdColumns.$inferSelect;
export type NewErdColumn = typeof erdColumns.$inferInsert;
export type ErdRelationship = typeof erdRelationships.$inferSelect;
export type NewErdRelationship = typeof erdRelationships.$inferInsert;
