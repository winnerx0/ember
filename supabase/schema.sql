-- ===========================================
-- ERD Tool - Core Schema
-- ===========================================

-- Custom ENUM types
CREATE TYPE "column_type" AS ENUM (
    'serial', 'bigserial', 'integer', 'bigint', 'smallint',
    'numeric', 'real', 'double precision', 'boolean',
    'text', 'varchar', 'char', 'uuid',
    'date', 'timestamp', 'timestamptz',
    'json', 'jsonb', 'bytea'
);

CREATE TYPE "relationship_type" AS ENUM (
    'one-to-one', 'one-to-many', 'many-to-many'
);

-- Helper function for auto-updating updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ===========================================
-- Tables
-- ===========================================

CREATE TABLE erd_projects (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL,
    name        TEXT NOT NULL,
    description TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE erd_tables (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id  UUID NOT NULL REFERENCES erd_projects(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    color       TEXT NOT NULL DEFAULT 'var(--chart-1)',
    position_x  DOUBLE PRECISION NOT NULL DEFAULT 0,
    position_y  DOUBLE PRECISION NOT NULL DEFAULT 0,
    metadata    JSONB NOT NULL DEFAULT '{}',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE erd_columns (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_id      UUID NOT NULL REFERENCES erd_tables(id) ON DELETE CASCADE,
    name          TEXT NOT NULL,
    type          TEXT NOT NULL,
    nullable      BOOLEAN NOT NULL DEFAULT TRUE,
    is_primary    BOOLEAN NOT NULL DEFAULT FALSE,
    is_unique     BOOLEAN NOT NULL DEFAULT FALSE,
    default_value TEXT,
    "order"       INTEGER NOT NULL DEFAULT 0,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE erd_relationships (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_table_id  UUID NOT NULL REFERENCES erd_tables(id)  ON DELETE CASCADE,
    target_table_id  UUID NOT NULL REFERENCES erd_tables(id)  ON DELETE CASCADE,
    source_column_id UUID NOT NULL REFERENCES erd_columns(id) ON DELETE CASCADE,
    target_column_id UUID NOT NULL REFERENCES erd_columns(id) ON DELETE CASCADE,
    type             TEXT NOT NULL,
    label            TEXT,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT erd_relationships_type_check
        CHECK (type IN ('one-to-one', 'one-to-many', 'many-to-one', 'many-to-many'))
);


-- ===========================================
-- Indexes
-- ===========================================

CREATE INDEX idx_projects_user_id                  ON erd_projects(user_id);
CREATE INDEX idx_erd_tables_project_id             ON erd_tables(project_id);
CREATE INDEX idx_erd_columns_table_id              ON erd_columns(table_id);
CREATE INDEX idx_erd_relationships_source_table_id ON erd_relationships(source_table_id);
CREATE INDEX idx_erd_relationships_target_table_id ON erd_relationships(target_table_id);


-- ===========================================
-- Triggers (auto-update updated_at)
-- ===========================================

CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON erd_projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_erd_tables_updated_at
    BEFORE UPDATE ON erd_tables
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_erd_columns_updated_at
    BEFORE UPDATE ON erd_columns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_erd_relationships_updated_at
    BEFORE UPDATE ON erd_relationships
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();