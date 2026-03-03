


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "drizzle";


ALTER SCHEMA "drizzle" OWNER TO "postgres";




ALTER SCHEMA "public" OWNER TO "postgres";


CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."column_type" AS ENUM (
    'serial',
    'bigserial',
    'integer',
    'bigint',
    'smallint',
    'numeric',
    'real',
    'double precision',
    'boolean',
    'text',
    'varchar',
    'char',
    'uuid',
    'date',
    'timestamp',
    'timestamptz',
    'json',
    'jsonb',
    'bytea'
);


ALTER TYPE "public"."column_type" OWNER TO "postgres";


CREATE TYPE "public"."relationship_type" AS ENUM (
    'one-to-one',
    'one-to-many',
    'many-to-many'
);


ALTER TYPE "public"."relationship_type" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "drizzle"."__drizzle_migrations" (
    "id" integer NOT NULL,
    "hash" "text" NOT NULL,
    "created_at" bigint
);


ALTER TABLE "drizzle"."__drizzle_migrations" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "drizzle"."__drizzle_migrations_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "drizzle"."__drizzle_migrations_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "drizzle"."__drizzle_migrations_id_seq" OWNED BY "drizzle"."__drizzle_migrations"."id";



CREATE TABLE IF NOT EXISTS "public"."erd_columns" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "table_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "type" "text" NOT NULL,
    "nullable" boolean DEFAULT true NOT NULL,
    "is_primary" boolean DEFAULT false NOT NULL,
    "is_unique" boolean DEFAULT false NOT NULL,
    "default_value" "text",
    "order" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."erd_columns" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."erd_projects" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."erd_projects" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."erd_relationships" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "source_table_id" "uuid" NOT NULL,
    "target_table_id" "uuid" NOT NULL,
    "source_column_id" "uuid" NOT NULL,
    "target_column_id" "uuid" NOT NULL,
    "type" "text" NOT NULL,
    "label" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "erd_relationships_type_check" CHECK (("type" = ANY (ARRAY['one-to-one'::"text", 'one-to-many'::"text", 'many-to-one'::"text", 'many-to-many'::"text"])))
);


ALTER TABLE "public"."erd_relationships" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."erd_tables" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "project_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "color" "text" DEFAULT 'var(--chart-1)'::"text" NOT NULL,
    "position_x" double precision DEFAULT 0 NOT NULL,
    "position_y" double precision DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."erd_tables" OWNER TO "postgres";


ALTER TABLE ONLY "drizzle"."__drizzle_migrations" ALTER COLUMN "id" SET DEFAULT "nextval"('"drizzle"."__drizzle_migrations_id_seq"'::"regclass");



ALTER TABLE ONLY "drizzle"."__drizzle_migrations"
    ADD CONSTRAINT "__drizzle_migrations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."erd_columns"
    ADD CONSTRAINT "erd_columns_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."erd_projects"
    ADD CONSTRAINT "erd_projects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."erd_relationships"
    ADD CONSTRAINT "erd_relationships_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."erd_tables"
    ADD CONSTRAINT "erd_tables_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_erd_columns_table_id" ON "public"."erd_columns" USING "btree" ("table_id");



CREATE INDEX "idx_erd_relationships_source_table_id" ON "public"."erd_relationships" USING "btree" ("source_table_id");



CREATE INDEX "idx_erd_relationships_target_table_id" ON "public"."erd_relationships" USING "btree" ("target_table_id");



CREATE INDEX "idx_erd_tables_project_id" ON "public"."erd_tables" USING "btree" ("project_id");



CREATE INDEX "idx_projects_user_id" ON "public"."erd_projects" USING "btree" ("user_id");



CREATE OR REPLACE TRIGGER "update_erd_columns_updated_at" BEFORE UPDATE ON "public"."erd_columns" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_erd_relationships_updated_at" BEFORE UPDATE ON "public"."erd_relationships" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_erd_tables_updated_at" BEFORE UPDATE ON "public"."erd_tables" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_projects_updated_at" BEFORE UPDATE ON "public"."erd_projects" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."erd_columns"
    ADD CONSTRAINT "erd_columns_table_id_fkey" FOREIGN KEY ("table_id") REFERENCES "public"."erd_tables"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."erd_projects"
    ADD CONSTRAINT "erd_projects_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."erd_relationships"
    ADD CONSTRAINT "erd_relationships_source_column_id_fkey" FOREIGN KEY ("source_column_id") REFERENCES "public"."erd_columns"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."erd_relationships"
    ADD CONSTRAINT "erd_relationships_source_table_id_fkey" FOREIGN KEY ("source_table_id") REFERENCES "public"."erd_tables"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."erd_relationships"
    ADD CONSTRAINT "erd_relationships_target_column_id_fkey" FOREIGN KEY ("target_column_id") REFERENCES "public"."erd_columns"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."erd_relationships"
    ADD CONSTRAINT "erd_relationships_target_table_id_fkey" FOREIGN KEY ("target_table_id") REFERENCES "public"."erd_tables"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."erd_tables"
    ADD CONSTRAINT "erd_tables_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."erd_projects"("id") ON DELETE CASCADE;



CREATE POLICY "Users can create tables in their projects" ON "public"."erd_tables" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."erd_projects"
  WHERE (("erd_projects"."id" = "erd_tables"."project_id") AND ("erd_projects"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can create their own projects" ON "public"."erd_projects" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete tables in their projects" ON "public"."erd_tables" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."erd_projects"
  WHERE (("erd_projects"."id" = "erd_tables"."project_id") AND ("erd_projects"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can delete their own projects" ON "public"."erd_projects" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update tables in their projects" ON "public"."erd_tables" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."erd_projects"
  WHERE (("erd_projects"."id" = "erd_tables"."project_id") AND ("erd_projects"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can update their own projects" ON "public"."erd_projects" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view tables in their projects" ON "public"."erd_tables" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."erd_projects"
  WHERE (("erd_projects"."id" = "erd_tables"."project_id") AND ("erd_projects"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can view their own projects" ON "public"."erd_projects" FOR SELECT USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."erd_projects" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."erd_tables" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."erd_columns";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."erd_projects";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."erd_relationships";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."erd_tables";



REVOKE USAGE ON SCHEMA "public" FROM PUBLIC;
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";








































































































































































GRANT ALL ON TABLE "public"."erd_columns" TO "anon";
GRANT ALL ON TABLE "public"."erd_columns" TO "authenticated";



GRANT ALL ON TABLE "public"."erd_projects" TO "anon";
GRANT ALL ON TABLE "public"."erd_projects" TO "authenticated";



GRANT ALL ON TABLE "public"."erd_relationships" TO "anon";
GRANT ALL ON TABLE "public"."erd_relationships" TO "authenticated";



GRANT ALL ON TABLE "public"."erd_tables" TO "anon";
GRANT ALL ON TABLE "public"."erd_tables" TO "authenticated";


































