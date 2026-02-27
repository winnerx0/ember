"use client";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import clsx from "clsx";
import { ThemeToggle } from "~/components/ThemeToggle";
import { Spinner } from "~/components/ui/spinner";
import { supabase } from "~/lib/supabase";

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
  },
  {
    icon: "🔗",
    title: "Smart Relationships",
    description:
      "Draw relationships between tables with automatic FK column creation. Supports 1:1, 1:N, N:1, and N:N with visual cardinality markers.",
  },
  {
    icon: "👥",
    title: "Realtime Collaboration",
    description:
      "Work together in real-time. See changes from your team instantly as tables, columns, and relationships are added or modified.",
  },
  {
    icon: "⬇",
    title: "SQL Export",
    description:
      "Export production-ready PostgreSQL DDL with CREATE TABLE, FOREIGN KEY constraints, and indexes in one click.",
  },
  {
    icon: "🎨",
    title: "Rich Column Types",
    description:
      "Full PostgreSQL type support: UUID, JSONB, TIMESTAMPTZ, arrays, and more. Set PK, unique, nullable, and default values.",
  },
  {
    icon: "⚡",
    title: "Instant Sync",
    description:
      "Every change is saved instantly to PostgreSQL. Realtime subscriptions keep all collaborators in perfect sync.",
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

  const handleMouseUp = () => setDragging(null);

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
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
        <defs>
          <marker
            id="arrow-theme"
            markerWidth="8"
            markerHeight="8"
            refX="6"
            refY="3"
            orient="auto"
          >
            <path d="M0,0 L0,6 L8,3 z" className="fill-primary opacity-70" />
          </marker>
        </defs>
        <path
          d={getConnectionPath(0, 1)}
          className="stroke-primary stroke-[1.5] fill-none opacity-60"
          markerEnd="url(#arrow-theme)"
        />
        <path
          d={getConnectionPath(1, 2)}
          className="stroke-primary stroke-[1.5] fill-none opacity-60"
          markerEnd="url(#arrow-theme)"
        />
        <path
          d={getConnectionPath(0, 2)}
          className="stroke-primary stroke-[1.5] fill-none opacity-40 stroke-dasharray-[4,3]"
          markerEnd="url(#arrow-theme)"
        />
      </svg>

      {DEMO_TABLES.map((table, index) => (
        <div
          key={table.name}
          className={clsx(
            "absolute rounded-xl overflow-hidden shadow-2xl cursor-move bg-card border border-border",
            dragging === index ? "z-10" : "z-1",
          )}
          style={{
            left: tablePositions[index].x,
            top: tablePositions[index].y,
            width: 160,
          }}
          onMouseDown={(e) => handleMouseDown(e, index)}
        >
          <div className="px-3 py-2 flex items-center gap-2 border-b bg-accent border-border">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-xs font-bold tracking-wide text-primary">
              {table.name}
            </span>
          </div>
          {table.columns.map((col) => (
            <div
              key={col.name}
              className="flex items-center gap-2 px-3 py-1.5 text-xs border-b last:border-0 border-border"
            >
              {/* Fixed: use min-w instead of a spacer span so layout is stable */}
              <span
                className={clsx(
                  "text-[9px] font-bold min-w-4",
                  col.pk ? "text-yellow-500" : "text-transparent",
                )}
              >
                PK
              </span>
              <span className="flex-1 text-foreground">{col.name}</span>
              <span className="text-[9px] font-mono text-muted-foreground">
                {col.type}
              </span>
            </div>
          ))}
        </div>
      ))}

      <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full text-xs font-semibold border pointer-events-none bg-accent border-border text-primary">
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden w-full bg-background text-foreground">
      {/* ── Nav ───────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 sm:px-8 lg:px-12 py-4 border-b backdrop-blur-xl border-border bg-background/85">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{
              background: "var(--primary)",
              color: "var(--primary-foreground)",
            }}
          >
            <span className="font-black text-xs">E</span>
          </div>
          <span className="font-bold text-base tracking-tight">Ember</span>
          <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold border bg-accent text-accent-foreground border-border">
            BETA
          </span>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          {user ? (
            <Link href="/app">
              <Image
                className="rounded-full size-8"
                src={user.user_metadata.avatar_url}
                width={1000}
                height={1000}
                priority
                alt="Profile"
              />
            </Link>
          ) : (
            <Link
              href="/auth"
              className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 hover:scale-105 bg-primary text-primary-foreground"
            >
              Sign In →
            </Link>
          )}
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────────────────── */}
      {/*
        Fixed: pt-28 (nav ~64px + 48px gap) instead of pt-48 on lg.
        Sections now use a consistent py-20 sm:py-28 lg:py-36 rhythm
        rather than three escalating breakpoints on every section.
      */}
      <section className="relative pt-28 sm:pt-32 pb-20 sm:pb-28 px-6 sm:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left: copy */}
            <div
              className={`transition-all duration-700 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-5 border bg-accent text-accent-foreground border-border">
                <span className="w-1.5 h-1.5 rounded-full animate-pulse bg-primary" />
                PostgreSQL ERD Designer
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-tight mb-6">
                Design your <span className="text-primary">database</span>
                <br />
                visually.
              </h1>

              <p className="text-lg sm:text-xl leading-relaxed mb-8 max-w-xl text-muted-foreground">
                Ember is a collaborative PostgreSQL schema designer. Create
                tables, define relationships, and work with your team in
                real-time — all in a beautiful drag-and-drop canvas.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/auth"
                  className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-base transition-all duration-200 hover:scale-105 hover:shadow-xl bg-primary text-primary-foreground"
                >
                  Start Designing
                  <span className="group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-base border transition-all duration-200 hover:bg-accent text-foreground border-border"
                >
                  See how it works
                </a>
              </div>

              {/* Stats — Fixed: mt-12 pt-8 with a single border-t, no stacked spacing */}
              <div className="flex gap-10 mt-12 pt-8 border-t border-border">
                {[
                  { val: "20+", label: "PG Types" },
                  { val: "Realtime", label: "Collaboration" },
                  { val: "1-click", label: "SQL Export" },
                ].map((s) => (
                  <div key={s.label}>
                    <div className="text-2xl font-black text-primary">
                      {s.val}
                    </div>
                    <div className="text-xs mt-1 text-muted-foreground">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: mini ERD preview */}
            <div
              className={`transition-all duration-700 delay-200 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
            >
              <div className="relative rounded-2xl overflow-hidden border bg-card border-border h-[340px]">
                {/* Toolbar mock */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <div className="w-3 h-3 rounded-full bg-green-500/60" />
                  <span className="ml-3 text-xs font-mono text-muted-foreground">
                    ember · blog_schema
                  </span>
                </div>
                {/* Fixed: use remaining height calculation via flex instead of calc() with magic number */}
                <div className="absolute inset-0 top-[44px]">
                  <MiniERD />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────── */}
      <section
        id="features"
        className="py-20 sm:py-28 lg:py-36 px-6 sm:px-8 lg:px-12"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14 sm:mb-20">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black mb-4">
              Everything you need to{" "}
              <span className="text-primary">collaborate</span>
            </h2>
            <p className="text-lg sm:text-xl max-w-2xl mx-auto text-muted-foreground">
              Design together in real-time. See changes instantly. Export
              production-ready SQL.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="group p-6 sm:p-8 rounded-2xl border transition-all duration-300 hover:-translate-y-1 bg-card border-border"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-5 transition-transform group-hover:scale-110 border bg-accent border-border">
                  {f.icon}
                </div>
                <h3 className="font-bold text-lg mb-2 text-card-foreground">
                  {f.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────────── */}
      <section
        id="how-it-works"
        className="py-20 sm:py-28 lg:py-36 px-6 sm:px-8 lg:px-12"
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14 sm:mb-20">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black mb-4">
              From idea to SQL in <span className="text-primary">minutes</span>
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground">
              Four simple steps to a production-ready schema.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 lg:gap-8">
            {STEPS.map((s) => (
              <div className="flex gap-5 p-6 sm:p-8 rounded-2xl border transition-all duration-300 bg-card border-border" key={s.step}>
                <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm border bg-accent border-border text-accent-foreground">
                  {s.step}
                </div>
                <div>
                  <h3 className="font-bold text-base mb-1.5 text-card-foreground">
                    {s.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {s.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SQL Preview ───────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 lg:py-36 px-6 sm:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6">
                Export clean,{" "}
                <span className="text-primary">production SQL</span>
              </h2>
              <p className="text-base sm:text-lg leading-relaxed mb-8 text-muted-foreground">
                Ember generates complete PostgreSQL DDL — CREATE TABLE
                statements, foreign key constraints, indexes, and more. Copy to
                clipboard or download as a{" "}
                <code className="text-primary">.sql</code> file.
              </p>
              <ul className="space-y-3">
                {[
                  "CREATE TABLE with all column types & constraints",
                  "ALTER TABLE ADD CONSTRAINT FOREIGN KEY",
                  "CREATE INDEX for FK columns",
                  "Syntax-highlighted preview",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 text-sm text-foreground"
                  >
                    <span className="font-black text-base text-primary">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Fixed: SQL block uses a template literal for the code body
                so indentation is consistent — no more mixed {"  "}{"  "} spans */}
            <div className="rounded-2xl overflow-hidden border bg-card border-border">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <span className="text-xs font-mono text-muted-foreground">
                  schema.sql
                </span>
                <span className="text-xs font-semibold text-primary">
                  Export ready
                </span>
              </div>
              <pre className="p-5 text-xs font-mono leading-relaxed overflow-x-auto text-foreground">
                <code>
                  <span className="text-muted-foreground">
                    {"-- Ember ERD Export: blog_schema\n"}
                  </span>
                  <span className="text-muted-foreground">
                    {"-- Generated: 2026-02-18\n\n"}
                  </span>
                  <span style={{ color: "var(--primary)" }}>
                    {"CREATE TABLE "}
                  </span>
                  <span>{'"users" (\n'}</span>
                  <span>{"  "}</span>
                  <span>{'"id"'}</span>
                  <span style={{ color: "var(--chart-1)" }}>{" UUID"}</span>
                  <span style={{ color: "var(--primary)" }}>
                    {" PRIMARY KEY"}
                  </span>
                  <span>{",\n"}</span>
                  <span>{"  "}</span>
                  <span>{'"email"'}</span>
                  <span className="text-chart-1">{" VARCHAR(255)"}</span>
                  <span className="text-primary">{" NOT NULL UNIQUE"}</span>
                  <span>{",\n"}</span>
                  <span>{"  "}</span>
                  <span>{'"created_at"'}</span>
                  <span className="text-chart-1">{" TIMESTAMPTZ"}</span>
                  <span>{"\n);\n\n"}</span>
                  <span style={{ color: "var(--primary)" }}>
                    {"CREATE TABLE "}
                  </span>
                  <span>{'"posts" (\n'}</span>
                  <span>{"  "}</span>
                  <span>{'"id"'}</span>
                  <span style={{ color: "var(--chart-1)" }}>{" UUID"}</span>
                  <span style={{ color: "var(--primary)" }}>
                    {" PRIMARY KEY"}
                  </span>
                  <span>{",\n"}</span>
                  <span>{"  "}</span>
                  <span>{'"user_id"'}</span>
                  <span className="text-chart-1">{" UUID"}</span>
                  <span className="text-primary">{" NOT NULL"}</span>
                  <span>{"\n);\n\n"}</span>
                  <span className="text-muted-foreground">
                    {"-- Foreign Key Constraints\n"}
                  </span>
                  <span className="text-primary">{"ALTER TABLE "}</span>
                  <span>{'"posts" '}</span>
                  <span className="text-primary">{"ADD CONSTRAINT "}</span>
                  <span>{'"fk_posts_users"\n'}</span>
                  <span className="text-primary">{"  FOREIGN KEY "}</span>
                  <span>{'("user_id") '}</span>
                  <span className="text-primary">{"REFERENCES "}</span>
                  <span>{'"users" ("id");'}</span>
                </code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 lg:py-36 px-6 sm:px-8 lg:px-12">
        <div className="max-w-4xl mx-auto text-center rounded-3xl p-12 sm:p-16 border bg-card border-border">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black mb-5">
            Ready to design your <span className="text-primary">schema?</span>
          </h2>
          <p className="text-base sm:text-lg mb-10 text-muted-foreground">
            Sign in with Google to start designing. Collaborate with your team
            in real-time.
          </p>
          <Link
            href="/auth"
            className="inline-flex items-center gap-3 px-9 py-4 rounded-xl
                       font-bold text-lg transition-all duration-200 hover:scale-105"
            style={{
              background: "var(--primary)",
              color: "var(--primary-foreground)",
            }}
          >
            Open Ember
            <span className="text-xl">→</span>
          </Link>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer
        className="py-8 px-6 sm:px-8 lg:px-12 border-t text-center"
        style={{
          borderColor: "var(--border)",
          color: "var(--muted-foreground)",
        }}
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <div
            className="w-5 h-5 rounded flex items-center justify-center"
            style={{
              background: "var(--primary)",
              color: "var(--primary-foreground)",
            }}
          >
            <span className="font-black text-[10px]">E</span>
          </div>
          <span
            className="font-semibold text-sm"
            style={{ color: "var(--foreground)" }}
          >
            Ember
          </span>
        </div>
        <p className="text-xs">© 2026 Ember. Built for PostgreSQL lovers.</p>
      </footer>
    </div>
  );
}
