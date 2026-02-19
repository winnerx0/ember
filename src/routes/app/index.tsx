import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { getProjects, createProject, deleteProject } from "~/server/projects";
import { ThemeToggle } from "~/components/ThemeToggle";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";

export const Route = createFileRoute("/app/")({
  loader: () => getProjects(),
  component: AppDashboard,
});

function ProjectCard({
  project,
  onDelete,
}: {
  project: {
    id: string;
    name: string;
    description: string | null;
    tableCount: number;
    updatedAt: Date;
  };
  onDelete: (id: string) => void;
}) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Delete "${project.name}"? This cannot be undone.`)) return;
    setDeleting(true);
    await deleteProject({ data: { id: project.id } });
    onDelete(project.id);
  };

  const timeAgo = (date: Date) => {
    const d = new Date(date);
    const diff = Date.now() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <Link
      to="/app/$projectId"
      params={{ projectId: project.id }}
      className="group block p-6 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
      style={{
        background: "var(--card)",
        borderColor: "var(--border)"
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg"
          style={{
            background: "var(--accent)",
            borderColor: "var(--border)",
            color: "var(--accent-foreground)",
            border: "1px solid"
          }}
        >
          {project.name[0].toUpperCase()}
        </div>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg transition-all text-xs"
          style={{
            color: "var(--muted-foreground)",
            background: "transparent"
          }}
        >
          {deleting ? "..." : "✕"}
        </button>
      </div>

      <h3 className="font-bold text-base mb-1 transition-colors" style={{ color: "var(--card-foreground)" }}>
        {project.name}
      </h3>
      {project.description && (
        <p className="text-sm mb-3 line-clamp-2" style={{ color: "var(--muted-foreground)" }}>
          {project.description}
        </p>
      )}

      <div className="flex items-center justify-between mt-4 pt-4 border-t" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-3">
          <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
            <span className="font-semibold" style={{ color: "var(--foreground)" }}>
              {project.tableCount}
            </span>{" "}
            {project.tableCount === 1 ? "table" : "tables"}
          </span>
        </div>
        <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
          {timeAgo(project.updatedAt)}
        </span>
      </div>
    </Link>
  );
}

function NewProjectModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (p: any) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted with name:", name, "description:", description);
    if (!name.trim()) {
      console.log("Name is empty, returning");
      return;
    }
    setLoading(true);
    console.log("Calling createProject...");
    try {
      const project = await createProject({
        data: {
          name: name.trim(),
          description: description.trim() || undefined,
        },
      });
      console.log("Project created successfully:", project);
      onCreate(project);
      onClose();
    } catch (error) {
      console.error("Failed to create project:", error);
      alert("Failed to create project. Please check the console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-md rounded-2xl p-6 border"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
      >
        <h2 className="text-xl font-bold mb-6" style={{ color: "var(--card-foreground)" }}>New Project</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Project Name *</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. blog_schema, ecommerce_db"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description..."
              rows={3}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!name.trim() || loading}
              className="flex-1"
            >
              {loading ? "Creating..." : "Create Project"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AppDashboard() {
  const initialProjects = Route.useLoaderData();
  const [projects, setProjects] = useState(initialProjects);
  const [showModal, setShowModal] = useState(false);

  console.log("AppDashboard render - showModal:", showModal, "projects count:", projects.length);

  const handleCreate = (project: any) => {
    setProjects((prev) => [{ ...project, tableCount: 0 }, ...prev]);
  };

  const handleDelete = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      {/* Header */}
      <header className="border-b px-6 py-4 flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
              <span className="font-black text-xs">E</span>
            </div>
            <span className="font-bold text-sm" style={{ color: "var(--foreground)" }}>Ember</span>
          </Link>
          <span style={{ color: "var(--muted-foreground)" }}>/</span>
          <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Projects</span>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button
            onClick={() => {
              console.log("New Project button clicked");
              setShowModal(true);
            }}
            size="sm"
          >
            + New Project
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {projects.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mb-6 border"
              style={{
                background: "var(--accent)",
                borderColor: "var(--border)",
                color: "var(--accent-foreground)"
              }}
            >
              ⬡
            </div>
            <h2 className="text-2xl font-bold mb-3" style={{ color: "var(--foreground)" }}>No projects yet</h2>
            <p className="mb-8 max-w-sm" style={{ color: "var(--muted-foreground)" }}>
              Create your first project to start designing your PostgreSQL
              schema visually.
            </p>
            <Button
              onClick={(e) => {
                console.log("Create First Project button clicked", e);
                setShowModal(true);
              }}
              size="lg"
            >
              Create First Project
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-black" style={{ color: "var(--foreground)" }}>Your Projects</h1>
                <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
                  {projects.length}{" "}
                  {projects.length === 1 ? "project" : "projects"}
                </p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {projects.map((p) => (
                <ProjectCard key={p.id} project={p} onDelete={handleDelete} />
              ))}
              {/* Add new card */}
              <button
                onClick={() => {
                  console.log("New Project card clicked");
                  setShowModal(true);
                }}
                className="flex flex-col items-center justify-center p-6 rounded-2xl border border-dashed transition-all duration-300 hover:-translate-y-1 min-h-[160px]"
                style={{
                  borderColor: "var(--border)",
                  color: "var(--muted-foreground)"
                }}
              >
                <span className="text-3xl mb-2">+</span>
                <span className="text-sm font-medium">New Project</span>
              </button>
            </div>
          </>
        )}
      </main>

      {showModal && (
        <NewProjectModal
          onClose={() => setShowModal(false)}
          onCreate={handleCreate}
        />
      )}
    </div>
  );
}
