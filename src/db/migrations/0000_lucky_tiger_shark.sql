CREATE TYPE "public"."column_type" AS ENUM('serial', 'bigserial', 'integer', 'bigint', 'smallint', 'numeric', 'real', 'double precision', 'boolean', 'text', 'varchar', 'char', 'uuid', 'date', 'timestamp', 'timestamptz', 'json', 'jsonb', 'bytea');--> statement-breakpoint
CREATE TYPE "public"."relationship_type" AS ENUM('one-to-one', 'one-to-many', 'many-to-many');--> statement-breakpoint
CREATE TABLE "erd_columns" (
	"id" text PRIMARY KEY NOT NULL,
	"table_id" text NOT NULL,
	"name" text NOT NULL,
	"type" text DEFAULT 'text' NOT NULL,
	"nullable" boolean DEFAULT true NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"is_unique" boolean DEFAULT false NOT NULL,
	"default_value" text,
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "erd_relationships" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"source_table_id" text NOT NULL,
	"source_column_id" text,
	"target_table_id" text NOT NULL,
	"target_column_id" text,
	"type" text DEFAULT 'one-to-many' NOT NULL,
	"label" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "erd_tables" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"name" text NOT NULL,
	"color" text DEFAULT '#f97316' NOT NULL,
	"position_x" real DEFAULT 0 NOT NULL,
	"position_y" real DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "erd_columns" ADD CONSTRAINT "erd_columns_table_id_erd_tables_id_fk" FOREIGN KEY ("table_id") REFERENCES "public"."erd_tables"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "erd_relationships" ADD CONSTRAINT "erd_relationships_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "erd_relationships" ADD CONSTRAINT "erd_relationships_source_table_id_erd_tables_id_fk" FOREIGN KEY ("source_table_id") REFERENCES "public"."erd_tables"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "erd_relationships" ADD CONSTRAINT "erd_relationships_source_column_id_erd_columns_id_fk" FOREIGN KEY ("source_column_id") REFERENCES "public"."erd_columns"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "erd_relationships" ADD CONSTRAINT "erd_relationships_target_table_id_erd_tables_id_fk" FOREIGN KEY ("target_table_id") REFERENCES "public"."erd_tables"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "erd_relationships" ADD CONSTRAINT "erd_relationships_target_column_id_erd_columns_id_fk" FOREIGN KEY ("target_column_id") REFERENCES "public"."erd_columns"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "erd_tables" ADD CONSTRAINT "erd_tables_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;