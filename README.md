# System Design Canvas

A production-ready interactive system design tool for creating backend and distributed system architectures using node-based visual modeling.

![System Design Canvas](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![React Flow](https://img.shields.io/badge/React_Flow-11-purple)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?logo=supabase)

## Features

### 🎯 Industry-Standard Components

- **35+ Real-World Technologies**: PostgreSQL, Redis, Kafka, RabbitMQ, AWS services, and more
- **9 Generic Categories**: Client, API Gateway, Load Balancer, Service, Cache, Queue, Storage, Worker, External
- **Configurable Implementations**: Select specific technologies for each component

### 🎨 Professional Design

- **Color-Coded Categories**: Visual hierarchy with category-based theming
- **Glassmorphism Effects**: Modern, premium aesthetics
- **Dark Mode Support**: Comfortable viewing in any environment
- **Card-Based Nodes**: Rich information display with icons and metadata

### 💾 Persistence & Collaboration

- **Auto-Save**: Automatic diagram saving to Supabase
- **Cloud Storage**: Access your diagrams from anywhere
- **Version History**: Track changes over time (planned)

### ⚡ Developer Experience

- **Type-Safe**: Full TypeScript with strict mode
- **Validated**: Runtime validation with Zod schemas
- **Modern Stack**: Next.js 14 App Router, React Flow, TanStack Query

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **UI Library**: React 18
- **Styling**: Tailwind CSS v3
- **Components**: shadcn/ui + Radix UI
- **Canvas**: React Flow v11
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Validation**: Zod
- **Backend**: Supabase (PostgreSQL)
- **Icons**: Lucide React
- **Drag & Drop**: dnd-kit

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd ember
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment**

Create `.env.local` file:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

4. **Set up database**

Run the SQL migration in your Supabase dashboard (SQL Editor):

```sql
-- Copy contents from supabase/migrations/001_initial_schema.sql
```

Or using Supabase CLI:

```bash
npx supabase db push
```

5. **Run development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Database Schema

The application uses three main tables:

- **diagrams**: Stores diagram metadata and data (nodes/edges as JSONB)
- **custom_elements**: User-defined custom components
- **diagram_versions**: Version history for diagrams

All tables include Row Level Security (RLS) policies currently configured for anonymous access (can be restricted to authenticated users).

## Project Structure

```
ember/
├── app/                      # Next.js app router pages
│   ├── api/                  # API routes
│   │   └── diagrams/         # Diagram CRUD endpoints
│   ├── canvas/               # Canvas pages
│   │   ├── [id]/             # Edit existing diagram
│   │   └── new/              # Create new diagram
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Home page
│   └── globals.css           # Global styles
├── src/
│   ├── components/
│   │   ├── canvas/           # React Flow canvas
│   │   ├── layout/           # Layout components
│   │   ├── nodes/            # Node components
│   │   └── ui/               # shadcn/ui components
│   ├── lib/
│   │   ├── constants/        # Implementation definitions
│   │   ├── hooks/            # React Query hooks
│   │   ├── schemas/          # Zod validation schemas
│   │   ├── supabase/         # Supabase clients
│   │   ├── types/            # TypeScript types
│   │   └── utils/            # Utility functions
│   └── stores/               # Zustand stores
└── supabase/
    └── migrations/           # Database migrations
```

## Available Components

### Client

- Web App, Mobile App, Desktop App

### API Gateway

- NGINX, Traefik, Kong, AWS API Gateway

### Load Balancer

- NGINX, HAProxy, AWS ALB, AWS NLB

### Service

- REST Service, gRPC Service, GraphQL Service

### Cache

- Redis, Memcached

### Message Queue

- RabbitMQ, Kafka, AWS SQS, Google Pub/Sub

### Database

- PostgreSQL, MySQL, Oracle SQL, MongoDB, DynamoDB

### Worker

- Background Worker, Celery, Sidekiq

### External Service

- Third-Party API, Payment Gateway, Auth Provider

## Usage

1. **Create a new diagram**: Click "Create New Diagram" on the home page
2. **Add components**: Drag components from the left palette onto the canvas
3. **Connect nodes**: Click and drag from one node's output handle to another's input handle
4. **Configure nodes**: Click a node to select it and edit implementation details (upcoming)
5. **Save**: Diagrams are auto-saved to Supabase

## Deployment

### Vercel (Recommended)

```bash
vercel deploy
```

Configure environment variables in Vercel dashboard.

### Other Platforms

Build for production:

```bash
npm run build
npm start
```

## Roadmap

- [ ] Properties panel for node configuration
- [ ] Implementation selector UI
- [ ] Custom element creation form
- [ ] Undo/Redo functionality
- [ ] Keyboard shortcuts
- [ ] Diagram export (JSON, PNG, SVG)
- [ ] Diagram sharing & collaboration
- [ ] Dark mode toggle
- [ ] Template diagrams
- [ ] AI-assisted architecture suggestions

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

MIT License - see LICENSE file for details

## Acknowledgments

- Inspired by professional architecture diagram tools
- Built for system design interviews and learning
- Designed with real-world production architectures in mind
