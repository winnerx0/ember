#!/bin/bash

# Setup script for System Design Canvas Database

echo "===================================="
echo "System Design Canvas - Database Setup"
echo "===================================="

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ Error: .env.local file not found"
    echo "Please create .env.local with your Supabase credentials"
    exit 1
fi

# Source the environment variables
source .env.local

echo "✓ Environment loaded"
echo "Project URL: $NEXT_PUBLIC_SUPABASE_URL"

# Read the migration file
MIGRATION_FILE="supabase/migrations/001_initial_schema.sql"

if [ ! -f "$MIGRATION_FILE" ]; then
    echo "❌ Error: Migration file not found at $MIGRATION_FILE"
    exit 1
fi

echo "✓ Migration file found"
echo ""
echo "Deploying database schema to Supabase..."
echo ""

# Extract project reference from URL
PROJECT_REF=$(echo $NEXT_PUBLIC_SUPABASE_URL | sed 's|https://||' | sed 's|\.supabase\.co||')

echo "Project Reference: $PROJECT_REF"
echo ""
echo "To deploy the schema, please run the SQL migration manually in your Supabase dashboard:"
echo "1. Go to https://supabase.com/dashboard/project/$PROJECT_REF/editor"
echo "2. Click on 'SQL Editor'"
echo "3. Create a new query"
echo "4. Copy the contents of: $MIGRATION_FILE"
echo "5. Paste and execute the query"
echo ""
echo "Or install Supabase CLI and run:"
echo "  npx supabase link --project-ref $PROJECT_REF"
echo "  npx supabase db push"
echo ""
echo "===================================="
echo "After running the migration, restart the dev server:"
echo "  npm run dev"
echo "===================================="
