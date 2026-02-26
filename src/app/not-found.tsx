import Link from "next/link";
import { ThemeToggle } from "~/components/ThemeToggle";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--background)", color: "var(--foreground)" }}>
      <header className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--border)" }}>
        <Link href="/" className="flex items-center gap-2">
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

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div
            className="w-24 h-24 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-6"
            style={{ background: "var(--accent)", borderColor: "var(--border)", border: "1px solid" }}
          >
            <span style={{ color: "var(--muted-foreground)" }}>404</span>
          </div>

          <h1 className="text-3xl font-bold mb-3">Page Not Found</h1>
          <p className="text-lg mb-8" style={{ color: "var(--muted-foreground)" }}>
            The page you're looking for doesn't exist or has been moved.
          </p>

          <div className="flex gap-3 justify-center">
            <Link
              href="/"
              className="px-6 py-3 rounded-xl font-medium transition-all hover:opacity-90"
              style={{
                background: "var(--primary)",
                color: "var(--primary-foreground)",
              }}
            >
              Go Home
            </Link>
            <Link
              href="/app"
              className="px-6 py-3 rounded-xl font-medium transition-all hover:opacity-80 border"
              style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
            >
              View Projects
            </Link>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-sm" style={{ color: "var(--muted-foreground)" }}>
        <p>Lost? Try going back to the <Link href="/" className="underline hover:opacity-80">homepage</Link></p>
      </footer>
    </div>
  );
}
