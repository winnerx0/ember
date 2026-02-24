import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
  ErrorComponent,
  Link,
} from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster } from "~/components/ui/sonner";
import { ThemeToggle } from "~/components/ThemeToggle";
import { ThemeProvider } from "next-themes";
import appCss from "~/styles/app.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      {
        title: "Ember — Visual PostgreSQL ERD Designer",
      },
      {
        name: "description",
        content:
          "Design your PostgreSQL database schema visually with Ember. Create ERDs, define relationships, and export production-ready SQL instantly.",
      },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  component: RootComponent,
  errorComponent: RootErrorComponent,
  notFoundComponent: NotFoundComponent,
});

function RootErrorComponent({ error }: { error: Error }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
        <link rel="stylesheet" href={appCss} />
      </head>
      <body>
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
              {/* Error Icon */}
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
                  onClick={() => window.location.reload()}
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

              {/* Error details */}
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

          {/* Footer */}
          <footer className="py-6 text-center text-sm" style={{ color: "var(--muted-foreground)" }}>
            <p>If this persists, please contact support.</p>
          </footer>
        </div>
        <Scripts />
      </body>
    </html>
  );
}

function NotFoundComponent() {
  return (
    <html lang="en">
      <head>
        <HeadContent />
        <link rel="stylesheet" href={appCss} />
      </head>
      <body>
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
              {/* 404 Icon */}
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
                  to="/"
                  className="px-6 py-3 rounded-xl font-medium transition-all hover:opacity-90"
                  style={{
                    background: "var(--primary)",
                    color: "var(--primary-foreground)",
                  }}
                >
                  Go Home
                </Link>
                <Link
                  to="/app"
                  className="px-6 py-3 rounded-xl font-medium transition-all hover:opacity-80 border"
                  style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
                >
                  View Projects
                </Link>
              </div>
            </div>
          </main>

          {/* Footer */}
          <footer className="py-6 text-center text-sm" style={{ color: "var(--muted-foreground)" }}>
            <p>Lost? Try going back to the <Link to="/" className="underline hover:opacity-80">homepage</Link></p>
          </footer>
        </div>
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <html lang="en">
      <head>
        <HeadContent />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const loader = document.getElementById('app-loader');
                if (loader) {
                  window.addEventListener('load', function() {
                    loader.classList.add('loaded');
                    setTimeout(() => loader.remove(), 300);
                  });
                }
              })();
            `,
          }}
        />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              #app-loader {
                position: fixed;
                inset: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                background: oklch(0.145 0 0);
                z-index: 9999;
                transition: opacity 0.3s ease;
              }
              html:not(.dark) #app-loader {
                background: oklch(1 0 0);
              }
              #app-loader.loaded {
                opacity: 0;
                pointer-events: none;
              }
              .loader-spinner {
                width: 40px;
                height: 40px;
                border: 3px solid oklch(0.269 0 0);
                border-top-color: oklch(0.922 0 0);
                border-radius: 50%;
                animation: spin 0.8s linear infinite;
              }
              html:not(.dark) .loader-spinner {
                border-color: oklch(0.922 0 0);
                border-top-color: oklch(0.205 0 0);
              }
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `,
          }}
        />
      </head>
      <body>
        <div id="app-loader">
          <div className="loader-spinner" />
        </div>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          <QueryClientProvider client={queryClient}>
            <Outlet />
            <Toaster />
            <Scripts />
          </QueryClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}