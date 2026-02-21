import { createFileRoute, Link } from "@tanstack/react-router";
import { ThemeToggle } from "~/components/ThemeToggle";

export const Route = createFileRoute("/500")({
  component: ServerErrorPage,
});

export default function ServerErrorPage() {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--background)", color: "var(--foreground)" }}>
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--border)" }}>
        <Link to="/" className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
          >
            <span className="font-black text-sm">E</span>
          </div>
          <span className="font-bold text-lg">Ember</span>
        </Link>
        <ThemeToggle />
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          {/* 500 Icon */}
          <div
            className="w-24 h-24 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-6"
            style={{ background: "var(--destructive)", color: "var(--destructive-foreground)" }}
          >
            <span>⚠️</span>
          </div>

          <h1 className="text-3xl font-bold mb-3">Server Error</h1>
          <p className="text-lg mb-2" style={{ color: "var(--muted-foreground)" }}>
            Something went wrong on our end.
          </p>
          <p className="text-sm mb-8" style={{ color: "var(--muted-foreground)" }}>
            We're working to fix the issue. Please try again in a moment.
          </p>

          <div className="flex gap-3 justify-center">
            <button
              onClick={handleReload}
              className="px-6 py-3 rounded-xl font-medium transition-all hover:opacity-90"
              style={{
                background: "var(--primary)",
                color: "var(--primary-foreground)",
              }}
            >
              Reload Page
            </button>
            <Link
              to="/"
              className="px-6 py-3 rounded-xl font-medium transition-all hover:opacity-80 border"
              style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
            >
              Go Home
            </Link>
          </div>

          {/* Technical details (optional) */}
          <details className="mt-8 text-left">
            <summary className="cursor-pointer text-sm font-medium mb-2" style={{ color: "var(--muted-foreground)" }}>
              Technical Details
            </summary>
            <div
              className="p-4 rounded-lg text-xs font-mono"
              style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}
            >
              <p>Error Code: 500</p>
              <p>Time: {new Date().toISOString()}</p>
              <p className="mt-2">If this persists, please contact support.</p>
            </div>
          </details>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-sm" style={{ color: "var(--muted-foreground)" }}>
        <p>If this persists, please contact support.</p>
      </footer>
    </div>
  );
}
