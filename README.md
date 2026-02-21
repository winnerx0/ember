# Ember

A visual PostgreSQL schema designer built for developers who want to design databases visually and export production-ready SQL.

![Ember Banner](https://img.shields.io/badge/PostgreSQL-ERD_Designer-blue?style=for-the-badge&logo=postgresql)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)

## Features

- **Visual ERD Designer** - Drag, drop, and connect tables on an infinite canvas powered by React Flow
- **Smart Relationships** - Draw foreign key relationships with crow's feet notation (one-to-one, one-to-many, many-to-many)
- **SQL Export** - Generate production-ready PostgreSQL DDL with CREATE TABLE, FOREIGN KEY constraints, and indexes
- **Realtime Collaboration** - See changes from other users instantly with Supabase Realtime subscriptions
- **Instant Persistence** - Every change is saved to PostgreSQL instantly via Supabase
- **Rich Column Types** - Full PostgreSQL type support including UUID, JSONB, TIMESTAMPTZ, arrays, and more
- **Auto Layout** - One-click intelligent table arrangement with zoom, pan, and minimap
- **Dark/Light Theme** - Beautiful theme system with smooth transitions
- **Mobile Responsive** - Works seamlessly on desktop, tablet, and mobile devices

## Quick Start

Want to get started quickly? Check out the [Quick Start Guide](QUICKSTART.md) for a 5-minute setup!

For detailed instructions, see [SETUP.md](SETUP.md).

### Prerequisites

- Node.js 18+ or Bun
- Supabase account (free tier available at https://supabase.com)

### Installation

See the detailed [SETUP.md](SETUP.md) guide for complete setup instructions.

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
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

4. Set up your Supabase database:
   - Create a new project in Supabase
   - Run the SQL schema from `supabase/schema.sql` in the SQL editor
   - Enable Realtime for the tables: `projects`, `erd_tables`, `erd_columns`, `erd_relationships`

5. Start the development server:
```bash
npm run dev
# or
bun run dev
```

6. Open [http://localhost:5174](http://localhost:5174) in your browser

## Tech Stack

- **Frontend**: React 18, TanStack Router, TanStack Start
- **Canvas**: React Flow (for the ERD canvas)
- **Database**: PostgreSQL via Supabase (with realtime subscriptions)
- **Styling**: Tailwind CSS, shadcn/ui
- **Build**: Vite
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
2. Add columns with the "+ Add" button
3. Configure column properties:
   - Name and data type
   - Primary Key (PK)
   - Unique constraint
   - Nullable
   - Default value
4. Choose a color for the table
5. Click "Save Changes"

### Creating Relationships

1. Hover over a table to reveal connection handles
2. Drag from a column handle to another table's column
3. Click on the relationship line to change the type:
   - One-to-One
   - One-to-Many (default)
   - Many-to-Many
4. Relationships show crow's feet notation automatically

### Exporting SQL

1. Click "Export SQL" in the sidebar
2. Review the generated PostgreSQL DDL
3. Copy to clipboard or download as `.sql` file
4. Run the SQL in your PostgreSQL database

### Auto Layout

Click "Auto Layout" to automatically arrange tables in a grid pattern with optimal spacing.

## Project Structure

```
ember/
├── src/
│   ├── components/
│   │   ├── erd/              # ERD-specific components
│   │   │   ├── TableNode.tsx
│   │   │   ├── ColumnEditor.tsx
│   │   │   ├── RelationshipEdge.tsx
│   │   │   └── ExportModal.tsx
│   │   ├── ui/               # shadcn/ui components
│   │   └── ThemeToggle.tsx

│   ├── lib/
│   │   ├── supabase.ts       # Supabase client
│   │   └── utils.ts          # Utility functions
│   ├── routes/               # TanStack Router routes
│   │   ├── index.tsx         # Landing page
│   │   ├── app/
│   │   │   ├── index.tsx     # Projects dashboard
│   │   │   └── $projectId.tsx # ERD canvas
│   │   └── __root.tsx
│   ├── server/               # Server functions
│   │   ├── projects.ts
│   │   ├── tables.ts
│   │   ├── columns.ts
│   │   ├── relationships.ts
│   │   └── export.ts
│   ├── styles/
│   │   └── app.css           # Global styles & theme
│   ├── client.tsx            # Client entry
│   └── ssr.tsx               # SSR entry
├── vite.config.ts            # Vite configuration
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
- [TanStack](https://tanstack.com/) - For routing and SSR
- [shadcn/ui](https://ui.shadcn.com/) - For beautiful UI components
- [Supabase](https://supabase.com/) - For the PostgreSQL database and realtime features

## Recent Updates

### Bug Fixes
- Fixed SSR hydration mismatch with theme and app loader
- Fixed SQL export foreign key generation to correctly handle relationship directions
- Fixed download functionality in export modal
- Improved error handling in SQL export with proper null checks

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

---