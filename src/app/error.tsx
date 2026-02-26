"use client";

import Link from "next/link";
import { ThemeToggle } from "~/components/ThemeToggle";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

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
            style={{ background: "var(--destructive)", color: "var(--destructive-foreground)" }}
          >
            <span>⚠️</span>
          </div>

          <h1 className="text-3xl font-bold mb-3">Something Went Wrong</h1>
          <p className="text-lg mb-8" style={{ color: "var(--muted-foreground)" }}>
            An unexpected error occurred. Please try refreshing the page.
          </p>

          <div className="flex gap-3 justify-center mb-8">
            <button
              onClick={reset}
              className="px-6 py-3 rounded-xl font-medium transition-all hover:opacity-90"
              style={{
                background: "var(--primary)",
                color: "var(--primary-foreground)",
              }}
            >
              Try Again
            </button>
            <Link
              href="/"
              className="px-6 py-3 rounded-xl font-medium transition-all hover:opacity-80 border"
              style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
            >
              Go Home
            </Link>
          </div>

          <details className="text-left">
            <summary className="cursor-pointer text-sm font-medium mb-2" style={{ color: "var(--muted-foreground)" }}>
              Error Details
            </summary>
            <div
              className="p-4 rounded-lg text-xs font-mono overflow-auto max-h-48"
              style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}
            >
              <p className="font-bold mb-2">{error.name}</p>
              <p className="mb-2">{error.message}</p>
              {error.stack && (
                <pre className="text-xs whitespace-pre-wrap">{error.stack}</pre>
              )}
            </div>
          </details>
        </div>
      </main>

      <footer className="py-6 text-center text-sm" style={{ color: "var(--muted-foreground)" }}>
        <p>If this persists, please contact support.</p>
      </footer>
    </div>
  );
}
