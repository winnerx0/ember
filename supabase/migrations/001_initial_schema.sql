-- System Design Canvas Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Diagrams table
CREATE TABLE IF NOT EXISTS diagrams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  data JSONB NOT NULL DEFAULT '{"nodes": [], "edges": []}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Custom elements table
CREATE TABLE IF NOT EXISTS custom_elements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Diagram versions table (for version history)
CREATE TABLE IF NOT EXISTS diagram_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  diagram_id UUID REFERENCES diagrams(id) ON DELETE CASCADE NOT NULL,
  data JSONB NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS diagrams_user_id_idx ON diagrams(user_id);
CREATE INDEX IF NOT EXISTS diagrams_created_at_idx ON diagrams(created_at DESC);
CREATE INDEX IF NOT EXISTS custom_elements_user_id_idx ON custom_elements(user_id);
CREATE INDEX IF NOT EXISTS custom_elements_category_idx ON custom_elements(category);
CREATE INDEX IF NOT EXISTS diagram_versions_diagram_id_idx ON diagram_versions(diagram_id);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_diagrams_updated_at
  BEFORE UPDATE ON diagrams
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
-- For now, we'll allow anonymous access for development
-- Later, these can be restricted to authenticated users

ALTER TABLE diagrams ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_elements ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagram_versions ENABLE ROW LEVEL SECURITY;

-- Diagrams policies (allow all for now, can be restricted later)
CREATE POLICY "Allow anonymous read access on diagrams"
  ON diagrams FOR SELECT
  USING (true);

CREATE POLICY "Allow anonymous insert on diagrams"
  ON diagrams FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow anonymous update on diagrams"
  ON diagrams FOR UPDATE
  USING (true);

CREATE POLICY "Allow anonymous delete on diagrams"
  ON diagrams FOR DELETE
  USING (true);

-- Custom elements policies
CREATE POLICY "Allow anonymous read access on custom_elements"
  ON custom_elements FOR SELECT
  USING (true);

CREATE POLICY "Allow anonymous insert on custom_elements"
  ON custom_elements FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow anonymous update on custom_elements"
  ON custom_elements FOR UPDATE
  USING (true);

CREATE POLICY "Allow anonymous delete on custom_elements"
  ON custom_elements FOR DELETE
  USING (true);

-- Diagram versions policies
CREATE POLICY "Allow anonymous read access on diagram_versions"
  ON diagram_versions FOR SELECT
  USING (true);

CREATE POLICY "Allow anonymous insert on diagram_versions"
  ON diagram_versions FOR INSERT
  WITH CHECK (true);

-- Optional: When authentication is enabled, replace the above policies with user-specific ones
-- Example (leave commented for now):
-- CREATE POLICY "Users can view their own diagrams"
--   ON diagrams FOR SELECT
--   USING (auth.uid() = user_id OR user_id IS NULL);
--
-- CREATE POLICY "Users can create diagrams"
--   ON diagrams FOR INSERT
--   WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
