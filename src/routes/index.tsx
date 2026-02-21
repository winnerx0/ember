import { User } from "@supabase/supabase-js";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ThemeToggle } from "~/components/ThemeToggle";
import { Spinner } from "~/components/ui/spinner";
import { supabase } from "~/lib/supabase";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

const DEMO_TABLES = [
  {
    name: "users",
    color: "#f97316",
    x: 60,
    y: 80,
    columns: [
      { name: "id", type: "uuid", pk: true },
      { name: "email", type: "varchar", pk: false },
      { name: "name", type: "text", pk: false },
      { name: "created_at", type: "timestamptz", pk: false },
    ],
  },
  {
    name: "posts",
    color: "#3b82f6",
    x: 320,
    y: 60,
    columns: [
      { name: "id", type: "uuid", pk: true },
      { name: "user_id", type: "uuid", pk: false },
      { name: "title", type: "varchar", pk: false },
      { name: "content", type: "text", pk: false },
    ],
  },
  {
    name: "comments",
    color: "#8b5cf6",
    x: 580,
    y: 120,
    columns: [
      { name: "id", type: "uuid", pk: true },
      { name: "post_id", type: "uuid", pk: false },
      { name: "user_id", type: "uuid", pk: false },
      { name: "body", type: "text", pk: false },
    ],
  },
];

const FEATURES = [
  {
    icon: "⬡",
    title: "Visual ERD Designer",
    description:
      "Drag, drop, and connect tables on an infinite canvas. Design your entire schema visually with an intuitive interface.",
    color: "#f97316",
  },
  {
    icon: "🔗",
    title: "Smart Relationships",
    description:
      "Draw relationships between tables with automatic FK column creation. Supports 1:1, 1:N, N:1, and N:N with visual cardinality markers.",
    color: "#3b82f6",
  },
  {
    icon: "👥",
    title: "Realtime Collaboration",
    description:
      "Work together in real-time. See changes from your team instantly as tables, columns, and relationships are added or modified.",
    color: "#10b981",
  },
  {
    icon: "⬇",
    title: "SQL Export",
    description:
      "Export production-ready PostgreSQL DDL with CREATE TABLE, FOREIGN KEY constraints, and indexes in one click.",
    color: "#8b5cf6",
  },
  {
    icon: "🎨",
    title: "Rich Column Types",
    description:
      "Full PostgreSQL type support: UUID, JSONB, TIMESTAMPTZ, arrays, and more. Set PK, unique, nullable, and default values.",
    color: "#f59e0b",
  },
  {
    icon: "⚡",
    title: "Instant Sync",
    description:
      "Every change is saved instantly to PostgreSQL. Realtime subscriptions keep all collaborators in perfect sync.",
    color: "#ec4899",
  },
];

const STEPS = [
  {
    step: "01",
    title: "Create a Project",
    desc: "Name your database project and jump into the canvas.",
  },
  {
    step: "02",
    title: "Add Tables & Columns",
    desc: "Click to add tables, define columns with PostgreSQL types, set PKs and constraints.",
  },
  {
    step: "03",
    title: "Draw Relationships",
    desc: "Drag from a column handle to another table to create FK relationships.",
  },
  {
    step: "04",
    title: "Export SQL",
    desc: "Click Export SQL to get production-ready PostgreSQL DDL. Copy or download as .sql.",
  },
];

function MiniERD() {
  const [tablePositions, setTablePositions] = useState(
    DEMO_TABLES.map((t) => ({ x: t.x, y: t.y })),
  );
  const [dragging, setDragging] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent, index: number) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setDragging(index);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragging !== null) {
      const container = e.currentTarget.getBoundingClientRect();
      const newX = e.clientX - container.left - dragOffset.x;
      const newY = e.clientY - container.top - dragOffset.y;

      setTablePositions((prev) =>
        prev.map((pos, i) =>
          i === dragging
            ? {
                x: Math.max(0, Math.min(newX, container.width - 160)),
                y: Math.max(0, Math.min(newY, container.height - 150)),
              }
            : pos,
        ),
      );
    }
  };

  const handleMouseUp = () => {
    setDragging(null);
  };

  // Calculate connection paths dynamically
  const getConnectionPath = (fromIdx: number, toIdx: number) => {
    const from = tablePositions[fromIdx];
    const to = tablePositions[toIdx];
    const fromX = from.x + 160;
    const fromY = from.y + 60;
    const toX = to.x;
    const toY = to.y + 60;
    const midX = (fromX + toX) / 2;
    return `M ${fromX} ${fromY} C ${midX} ${fromY}, ${midX} ${toY}, ${toX} ${toY}`;
  };

  return (
    <div
      className="relative w-full h-full select-none"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* SVG connections */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 0 }}
      >
        <defs>
          <marker
            id="arrow-theme"
            markerWidth="8"
            markerHeight="8"
            refX="6"
            refY="3"
            orient="auto"
          >
            <path d="M0,0 L0,6 L8,3 z" fill="var(--primary)" opacity="0.7" />
          </marker>
        </defs>
        {/* users → posts */}
        <path
          d={getConnectionPath(0, 1)}
          stroke="var(--primary)"
          strokeWidth="1.5"
          fill="none"
          opacity="0.6"
          markerEnd="url(#arrow-theme)"
        />
        {/* posts → comments */}
        <path
          d={getConnectionPath(1, 2)}
          stroke="var(--primary)"
          strokeWidth="1.5"
          fill="none"
          opacity="0.6"
          markerEnd="url(#arrow-theme)"
        />
        {/* users → comments */}
        <path
          d={getConnectionPath(0, 2)}
          stroke="var(--primary)"
          strokeWidth="1.5"
          fill="none"
          opacity="0.4"
          strokeDasharray="4 3"
          markerEnd="url(#arrow-theme)"
        />
      </svg>

      {/* Table nodes */}
      {DEMO_TABLES.map((table, index) => (
        <div
          key={table.name}
          className="absolute rounded-xl overflow-hidden shadow-2xl cursor-move transition-shadow hover:shadow-3xl"
          style={{
            left: tablePositions[index].x,
            top: tablePositions[index].y,
            width: 160,
            background: "var(--card)",
            border: "1px solid var(--border)",
            zIndex: dragging === index ? 10 : 1,
          }}
          onMouseDown={(e) => handleMouseDown(e, index)}
        >
          {/* Header */}
          <div
            className="px-3 py-2 flex items-center gap-2 border-b"
            style={{
              background: "var(--accent)",
              borderColor: "var(--border)",
            }}
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{ background: "var(--primary)" }}
            />
            <span
              className="text-xs font-bold tracking-wide"
              style={{ color: "var(--primary)" }}
            >
              {table.name}
            </span>
          </div>
          {/* Columns */}
          {table.columns.map((col) => (
            <div
              key={col.name}
              className="flex items-center gap-2 px-3 py-1.5 text-xs border-b last:border-0"
              style={{ borderColor: "var(--border)" }}
            >
              {col.pk ? (
                <span className="text-yellow-500 text-[9px] font-bold">PK</span>
              ) : (
                <span className="w-4" />
              )}
              <span className="flex-1" style={{ color: "var(--foreground)" }}>
                {col.name}
              </span>
              <span
                className="text-[9px] font-mono"
                style={{ color: "var(--muted-foreground)" }}
              >
                {col.type}
              </span>
            </div>
          ))}
        </div>
      ))}

      <div
        className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full text-xs font-semibold border pointer-events-none"
        style={{
          background: "var(--accent)",
          borderColor: "var(--border)",
          color: "var(--primary)",
        }}
      >
        ✓ 3 tables · 2 relationships
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    setIsVisible(true);
  }, []);

  const { data: user, isLoading } = useQuery({
    queryKey: ["fetch-user"],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      return data.user;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--background)" }}>
        <Spinner size="lg" />
      </div>
    );
  }
    return (
      <div
        className="min-h-screen overflow-x-hidden"
        style={{ background: "var(--background)", color: "var(--foreground)" }}
      >
        {/* Nav */}
        <nav
          className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b backdrop-blur-xl"
          style={{
            borderColor: "var(--border)",
            background: "var(--background)/80",
          }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center"
              style={{
                background: "var(--primary)",
                color: "var(--primary-foreground)",
              }}
            >
              <span className="font-black text-xs sm:text-sm">E</span>
            </div>
            <span className="font-bold text-base sm:text-lg tracking-tight">
              Ember
            </span>
            <span
              className="ml-1 sm:ml-2 px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-semibold border"
              style={{
                background: "var(--accent)",
                color: "var(--accent-foreground)",
                borderColor: "var(--border)",
              }}
            >
              BETA
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            {user ? (
              <Link to="/app">
                <img
                  className="rounded-full size-6"
                  src={user.user_metadata.avatar_url as string}
                />
              </Link>
            ) : (
              <Link
                to="/auth"
                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 hover:scale-105"
                style={{
                  background: "var(--primary)",
                  color: "var(--primary-foreground)",
                }}
              >
                <>
                  <span className="hidden sm:inline">Sign In →</span>
                  <span className="sm:hidden">Sign In →</span>
                </>
              </Link>
            )}
          </div>
        </nav>

        {/* Hero */}
        <section className="relative pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-16 md:pb-20 px-4 sm:px-6 max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
            {/* Left: copy */}
            <div
              className={`transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            >
              <div
                className="inline-flex items-center gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-medium mb-4 sm:mb-6 border"
                style={{
                  background: "var(--accent)",
                  color: "var(--accent-foreground)",
                  borderColor: "var(--border)",
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{ background: "var(--primary)" }}
                />
                PostgreSQL ERD Designer
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-4 sm:mb-6">
                Design your{" "}
                <span style={{ color: "var(--primary)" }}>database</span>
                <br />
                visually.
              </h1>

              <p
                className="text-base sm:text-lg leading-relaxed mb-6 sm:mb-8 max-w-lg"
                style={{ color: "var(--muted-foreground)" }}
              >
                Ember is a collaborative PostgreSQL schema designer. Create tables,
                define relationships, and work with your team in real-time — all in a
                beautiful drag-and-drop canvas.
              </p>

              <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
                <Link
                  to="/auth"
                  className="group flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold text-sm sm:text-base transition-all duration-200 hover:scale-105 hover:shadow-2xl"
                  style={{
                    background: "var(--primary)",
                    color: "var(--primary-foreground)",
                  }}
                >
                  Start Designing
                  <span className="group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </Link>
                <a
                  href="#how-it-works"
                  className="flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold text-sm sm:text-base border transition-all duration-200"
                  style={{
                    color: "var(--foreground)",
                    borderColor: "var(--border)",
                  }}
                >
                  See how it works
                </a>
              </div>

              {/* Stats */}
              <div
                className="flex gap-6 sm:gap-8 mt-8 sm:mt-12 pt-6 sm:pt-8 border-t"
                style={{ borderColor: "var(--border)" }}
              >
                {[
                  { val: "20+", label: "PG Types" },
                  { val: "Realtime", label: "Collaboration" },
                  { val: "1-click", label: "SQL Export" },
                ].map((s) => (
                  <div key={s.label}>
                    <div
                      className="text-xl sm:text-2xl font-black"
                      style={{ color: "var(--primary)" }}
                    >
                      {s.val}
                    </div>
                    <div
                      className="text-[10px] sm:text-xs mt-0.5"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: mini ERD preview */}
            <div
              className={`transition-all duration-700 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            >
              <div
                className="relative rounded-2xl overflow-hidden border h-[280px] sm:h-[320px] md:h-[380px]"
                style={{
                  background: "var(--card)",
                  borderColor: "var(--border)",
                }}
              >
                {/* Toolbar mock */}
                <div
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 border-b"
                  style={{ borderColor: "var(--border)" }}
                >
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500/60" />
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-500/60" />
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500/60" />
                  <span
                    className="ml-2 sm:ml-3 text-[10px] sm:text-xs font-mono"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    ember · blog_schema
                  </span>
                </div>
                <div
                  className="relative"
                  style={{ height: "calc(100% - 44px)" }}
                >
                  <MiniERD />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section
          id="features"
          className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 max-w-7xl mx-auto"
        >
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-black mb-3 sm:mb-4">
              Everything you need to{" "}
              <span style={{ color: "var(--primary)" }}>collaborate</span>
            </h2>
            <p
              className="text-base sm:text-lg max-w-2xl mx-auto"
              style={{ color: "var(--muted-foreground)" }}
            >
              Design together in real-time. See changes instantly. Export production-ready SQL.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="group p-5 sm:p-6 rounded-2xl border transition-all duration-300 hover:-translate-y-1"
                style={{
                  background: "var(--card)",
                  borderColor: "var(--border)",
                }}
              >
                <div
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-xl sm:text-2xl mb-3 sm:mb-4 transition-transform group-hover:scale-110 border"
                  style={{
                    background: "var(--accent)",
                    borderColor: "var(--border)",
                  }}
                >
                  {f.icon}
                </div>
                <h3
                  className="font-bold text-base sm:text-lg mb-2"
                  style={{ color: "var(--card-foreground)" }}
                >
                  {f.title}
                </h3>
                <p
                  className="text-xs sm:text-sm leading-relaxed"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section
          id="how-it-works"
          className="py-16 sm:py-20 md:py-24 px-4 sm:px-6"
          style={{ background: "var(--accent)" }}
        >
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl font-black mb-3 sm:mb-4">
                From idea to SQL in{" "}
                <span style={{ color: "var(--primary)" }}>minutes</span>
              </h2>
              <p
                className="text-base sm:text-lg"
                style={{ color: "var(--muted-foreground)" }}
              >
                Four simple steps to a production-ready schema.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
              {STEPS.map((s, i) => (
                <div
                  key={s.step}
                  className="flex gap-4 sm:gap-5 p-5 sm:p-6 rounded-2xl border transition-all duration-300"
                  style={{
                    background: "var(--card)",
                    borderColor: "var(--border)",
                  }}
                >
                  <div
                    className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center font-black text-xs sm:text-sm border"
                    style={{
                      background: "var(--accent)",
                      borderColor: "var(--border)",
                      color: "var(--accent-foreground)",
                    }}
                  >
                    {s.step}
                  </div>
                  <div>
                    <h3
                      className="font-bold text-sm sm:text-base mb-1"
                      style={{ color: "var(--card-foreground)" }}
                    >
                      {s.title}
                    </h3>
                    <p
                      className="text-xs sm:text-sm leading-relaxed"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      {s.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SQL Preview section */}
        <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-black mb-4 sm:mb-6">
                Export clean,{" "}
                <span style={{ color: "var(--primary)" }}>production SQL</span>
              </h2>
              <p
                className="text-sm sm:text-base leading-relaxed mb-4 sm:mb-6"
                style={{ color: "var(--muted-foreground)" }}
              >
                Ember generates complete PostgreSQL DDL — CREATE TABLE
                statements, foreign key constraints, indexes, and more. Copy to
                clipboard or download as a{" "}
                <code style={{ color: "var(--primary)" }}>.sql</code> file.
              </p>
              <ul className="space-y-2 sm:space-y-3">
                {[
                  "CREATE TABLE with all column types & constraints",
                  "ALTER TABLE ADD CONSTRAINT FOREIGN KEY",
                  "CREATE INDEX for FK columns",
                  "Syntax-highlighted preview",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm"
                    style={{ color: "var(--foreground)" }}
                  >
                    <span
                      className="font-bold"
                      style={{ color: "var(--primary)" }}
                    >
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div
              className="rounded-2xl overflow-hidden border"
              style={{
                background: "var(--card)",
                borderColor: "var(--border)",
              }}
            >
              <div
                className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 border-b"
                style={{ borderColor: "var(--border)" }}
              >
                <span
                  className="text-[10px] sm:text-xs font-mono"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  schema.sql
                </span>
                <span
                  className="text-[10px] sm:text-xs font-semibold"
                  style={{ color: "var(--primary)" }}
                >
                  Export ready
                </span>
              </div>
              <pre
                className="p-3 sm:p-5 text-[10px] sm:text-xs font-mono leading-relaxed overflow-x-auto"
                style={{ color: "var(--foreground)" }}
              >
                <code>
                  <span style={{ color: "var(--muted-foreground)" }}>
                    {"-- Ember ERD Export: blog_schema\n"}
                  </span>
                  <span style={{ color: "var(--muted-foreground)" }}>
                    {"-- Generated: 2026-02-18\n\n"}
                  </span>
                  <span style={{ color: "var(--primary)" }}>
                    {"CREATE TABLE "}
                  </span>
                  <span style={{ color: "var(--foreground)" }}>
                    {'"users" (\n'}
                  </span>
                  <span style={{ color: "var(--foreground)" }}>{"  "}</span>
                  <span style={{ color: "var(--foreground)" }}>{"  "}</span>
                  <span style={{ color: "var(--foreground)" }}>{'"id"'}</span>
                  <span style={{ color: "var(--chart-1)" }}>{" UUID"}</span>
                  <span style={{ color: "var(--primary)" }}>
                    {" PRIMARY KEY"}
                  </span>
                  <span style={{ color: "var(--foreground)" }}>{",\n"}</span>
                  <span style={{ color: "var(--foreground)" }}>{"  "}</span>
                  <span style={{ color: "var(--foreground)" }}>
                    {'"email"'}
                  </span>
                  <span style={{ color: "var(--chart-1)" }}>
                    {" VARCHAR(255)"}
                  </span>
                  <span style={{ color: "var(--primary)" }}>
                    {" NOT NULL UNIQUE"}
                  </span>
                  <span style={{ color: "var(--foreground)" }}>{",\n"}</span>
                  <span style={{ color: "var(--foreground)" }}>{"  "}</span>
                  <span style={{ color: "var(--foreground)" }}>
                    {'"created_at"'}
                  </span>
                  <span style={{ color: "var(--chart-1)" }}>
                    {" TIMESTAMPTZ"}
                  </span>
                  <span style={{ color: "var(--foreground)" }}>
                    {"\n);\n\n"}
                  </span>
                  <span style={{ color: "var(--primary)" }}>
                    {"CREATE TABLE "}
                  </span>
                  <span style={{ color: "var(--foreground)" }}>
                    {'"posts" (\n'}
                  </span>
                  <span style={{ color: "var(--foreground)" }}>{"  "}</span>
                  <span style={{ color: "var(--foreground)" }}>{'"id"'}</span>
                  <span style={{ color: "var(--chart-1)" }}>{" UUID"}</span>
                  <span style={{ color: "var(--primary)" }}>
                    {" PRIMARY KEY"}
                  </span>
                  <span style={{ color: "var(--foreground)" }}>{",\n"}</span>
                  <span style={{ color: "var(--foreground)" }}>{"  "}</span>
                  <span style={{ color: "var(--foreground)" }}>
                    {'"user_id"'}
                  </span>
                  <span style={{ color: "var(--chart-1)" }}>{" UUID"}</span>
                  <span style={{ color: "var(--primary)" }}>{" NOT NULL"}</span>
                  <span style={{ color: "var(--foreground)" }}>
                    {"\n);\n\n"}
                  </span>
                  <span style={{ color: "var(--muted-foreground)" }}>
                    {"-- Foreign Key Constraints\n"}
                  </span>
                  <span style={{ color: "var(--primary)" }}>
                    {"ALTER TABLE "}
                  </span>
                  <span style={{ color: "var(--foreground)" }}>
                    {'"posts" '}
                  </span>
                  <span style={{ color: "var(--primary)" }}>
                    {"ADD CONSTRAINT "}
                  </span>
                  <span style={{ color: "var(--foreground)" }}>
                    {'"fk_posts_users"\n'}
                  </span>
                  <span style={{ color: "var(--primary)" }}>
                    {"  FOREIGN KEY "}
                  </span>
                  <span style={{ color: "var(--foreground)" }}>
                    {'("user_id") '}
                  </span>
                  <span style={{ color: "var(--primary)" }}>
                    {"REFERENCES "}
                  </span>
                  <span style={{ color: "var(--foreground)" }}>
                    {'"users" ("id");'}
                  </span>
                </code>
              </pre>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6">
          <div
            className="max-w-3xl mx-auto text-center rounded-2xl sm:rounded-3xl p-8 sm:p-12 md:p-16 border"
            style={{
              background: "var(--card)",
              borderColor: "var(--border)",
            }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 sm:mb-6">
              Ready to design your{" "}
              <span style={{ color: "var(--primary)" }}>schema?</span>
            </h2>
            <p
              className="text-sm sm:text-base md:text-lg mb-8 sm:mb-10"
              style={{ color: "var(--muted-foreground)" }}
            >
              Sign in with Google to start designing. Collaborate with your team in real-time.
            </p>
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg transition-all duration-200 hover:scale-105"
              style={{
                background: "var(--primary)",
                color: "var(--primary-foreground)",
              }}
            >
              Open Ember
              <span className="text-lg sm:text-xl">→</span>
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer
          className="py-6 sm:py-8 px-4 sm:px-6 border-t text-center text-xs sm:text-sm"
          style={{
            borderColor: "var(--border)",
            color: "var(--muted-foreground)",
          }}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <div
              className="w-4 h-4 sm:w-5 sm:h-5 rounded flex items-center justify-center"
              style={{
                background: "var(--primary)",
                color: "var(--primary-foreground)",
              }}
            >
              <span className="font-black text-[9px] sm:text-[10px]">E</span>
            </div>
            <span
              className="font-semibold"
              style={{ color: "var(--foreground)" }}
            >
              Ember
            </span>
          </div>
          <p className="max-w-md mx-auto">
            Visual PostgreSQL ERD Designer · Built with TanStack Start + React
            Flow
          </p>
        </footer>
      </div>
    );
}
