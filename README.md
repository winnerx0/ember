# Ember

A visual PostgreSQL schema designer built for developers who want to design databases visually and export production-ready SQL.

![Ember Banner](https://img.shields.io/badge/PostgreSQL-ERD_Designer-blue?style=for-the-badge&logo=postgresql)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)

## Features

- **Visual ERD Designer** - Drag, drop, and connect tables on an infinite canvas powered by React Flow
- **YAML Import** - Import your entire database schema from a structured YAML file with automatic table, column, and relationship creation
- **Smart Relationships** - Draw foreign key relationships with automatic column management (one-to-one, one-to-many, many-to-one, many-to-many)
- **SQL Export** - Generate production-ready PostgreSQL DDL with CREATE TABLE, FOREIGN KEY constraints, junction tables, and CASCADE rules
- **Realtime Collaboration** - See changes from other users instantly with Supabase Realtime subscriptions
- **Optimistic Updates** - Instant UI feedback with automatic rollback on errors
- **Rich Column Types** - Full PostgreSQL type support including UUID, SERIAL, INTEGER, DECIMAL, JSONB, TIMESTAMPTZ, and more
- **Auto Layout** - One-click intelligent table arrangement with zoom, pan, and minimap
- **Collapsible Sidebar** - Toggle sidebar visibility for maximum canvas space
- **User Profiles** - Integrated user menu with settings and authentication
- **Mobile Responsive** - Works seamlessly on desktop, tablet, and mobile devices

## Quick Start

### Prerequisites

- Node.js 18+ or Bun
- Supabase account (free tier available at https://supabase.com)

### Installation

Quick start:

1. Clone the repository:
```bash
git clone https://github.com/winnerx0/ember.git
cd ember
```

2. Install dependencies:
```bash
npm install
# or
bun install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
DATABASE_URL=postgresql://username:password@localhost:5432/ember
REDIS_URL=redis://username:password@localhost:6379
```

4. Set up your Supabase database:
   - Create a new project in Supabase
   - Run the SQL schema from `supabase/schema.sql` in the SQL editor
   - Enable Realtime for the tables: `erd_projects`, `erd_tables`, `erd_columns`, `erd_relationships`

5. Start the development server:
```bash
npm run dev
# or
bun run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19
- **Canvas**: React Flow (for the ERD canvas)
- **Database**: PostgreSQL via Supabase (with realtime subscriptions)
- **State Management**: TanStack Query (React Query)
- **Styling**: Tailwind CSS, shadcn/ui
- **Authentication**: Supabase Auth (Google OAuth)
- **Runtime**: Node.js or Bun

## Usage

### Creating a Project

1. Click "Create First Project" or the "+" button
2. Enter a project name and optional description
3. Click "Create Project"

### Adding Tables

1. Click "Add Table" in the sidebar
2. Enter a table name (spaces will be converted to underscores)
3. The table appears on the canvas

### Editing Tables

1. Click on a table to open the column editor
2. Rename the table — spaces are automatically converted to underscores as you type
3. Add columns with the "+ Add Column" button
4. Configure column properties:
   - Name and data type
   - Primary Key (PK)
   - Unique constraint
   - Nullable
   - Default value
5. Choose a color for the table
6. Click "Save Changes" or click outside the panel to auto-save

### Creating Relationships

1. Drag from the owner/parent table (the "one" side) to the child table (the "many" side)
2. A foreign key column is automatically created in the appropriate table
3. Click on the relationship line when selected to change the cardinality:
   - **One-to-One** — FK in target table
   - **One-to-Many** — FK in target table (default)
   - **Many-to-One** — FK in source table
   - **Many-to-Many** — no FK columns; a junction table is generated on SQL export
4. When changing types, FK columns are automatically moved to the correct table
5. Deleting a relationship removes its associated foreign key column

### Deleting Tables

1. Click the delete icon on a table in the sidebar
2. Confirm the deletion
3. All foreign key columns referencing the deleted table are automatically removed from other tables

### Importing from YAML

1. Click "Import YAML" in the sidebar
2. Paste your schema YAML or type it directly — syntax is highlighted in real time
3. Click "Import" to create all tables, columns, and relationships at once
4. Errors are shown inline before import (unknown types, missing tables, etc.)

YAML schema format:

```yaml
version: "1.0"

tables:
  users:
    columns:
      id:
        type: uuid
        primary: true
        default: gen_random_uuid()
      email:
        type: text
        unique: true

  posts:
    columns:
      id:
        type: uuid
        primary: true
        default: gen_random_uuid()
      user_id:
        type: uuid
      title:
        type: text

relationships:
  - from: users
    to: posts
    type: one-to-many

  # Many-to-many via an explicit junction table
  - from: posts
    to: tags
    type: many-to-many
    via: post_tags
```

Supported column properties: `type`, `primary`, `unique`, `nullable`, `default`.
Supported types: `uuid`, `serial`, `bigserial`, `integer`, `int`, `bigint`, `smallint`, `numeric`, `decimal`, `real`, `double precision`, `boolean`, `text`, `varchar`, `char`, `date`, `timestamp`, `timestamptz`, `json`, `jsonb`, `bytea`.

### Exporting SQL

1. Click "Export SQL" in the sidebar
2. Review the generated PostgreSQL DDL including:
   - CREATE TABLE statements
   - PRIMARY KEY constraints
   - FOREIGN KEY constraints with CASCADE rules
   - Junction tables for many-to-many relationships
3. Copy to clipboard or download as `.sql` file
4. Run the SQL in your PostgreSQL database

### Auto Layout

Click "Auto Layout" to automatically arrange tables in a grid pattern with optimal spacing.

### Sidebar Controls

- Click the collapse button (<<) to hide the sidebar for more canvas space
- Click the hamburger menu button to reopen the sidebar
- Theme toggle and user menu are always accessible

## Project Structure

```
ember/
├── src/
│   ├── app/
│   │   ├── app/
│   │   │   ├── page.tsx       
│   │   │   ├── [projectId]/
│   │   │   │   └── page.tsx     
│   │   │   └── settings/
│   │   │       └── page.tsx     
│   │   ├── auth/
│   │   │   └── page.tsx         
│   │   ├── layout.tsx           
│   │   ├── page.tsx             
│   │   └── providers.tsx     
│   ├── components/
│   │   ├── erd/
│   │   │   ├── TableNode.tsx
│   │   │   ├── ColumnEditor.tsx
│   │   │   ├── RelationshipEdge.tsx
│   │   │   ├── ImportModal.tsx
│   │   │   └── ExportModal.tsx
│   │   ├── ui/                   
│   │   ├── ThemeToggle.tsx
│   │   └── UserMenu.tsx
│   ├── lib/
│   │   ├── supabase.ts          
│   │   └── utils.ts             
│   ├── server/
│   │   ├── auth.ts
│   │   ├── projects.ts
│   │   ├── tables.ts
│   │   ├── columns.ts
│   │   ├── relationships.ts
│   │   ├── import.ts
│   │   └── export.ts
│   └── middleware.ts          
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

## Development

### Building for Production

```bash
npm run build
```

### Running in Production

```bash
npm start
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add a feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [React Flow](https://reactflow.dev/) - For the amazing canvas library
- [Next.js](https://nextjs.org/) - For the React framework
- [TanStack Query](https://tanstack.com/query) - For data synchronization
- [shadcn/ui](https://ui.shadcn.com/) - For beautiful UI components
- [Supabase](https://supabase.com/) - For the PostgreSQL database and realtime features

## 📧 Contact

For questions or feedback, please open an issue on GitHub.