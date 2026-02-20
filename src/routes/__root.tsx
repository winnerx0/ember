import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster } from "~/components/ui/sonner";
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
});

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
                const theme = localStorage.getItem('theme') || 'dark';
                document.documentElement.classList.toggle('dark', theme === 'dark');
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
        <QueryClientProvider client={queryClient}>
          <Outlet />
          <Toaster />
          <Scripts />
        </QueryClientProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('load', function() {
                const loader = document.getElementById('app-loader');
                if (loader) {
                  loader.classList.add('loaded');
                  setTimeout(() => loader.remove(), 300);
                }
              });
            `,
          }}
        />
      </body>
    </html>
  );
}