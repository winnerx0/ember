import { createRootRoute, HeadContent, Outlet, Scripts, createFileRoute, Link, lazyRouteComponent, createRouter as createRouter$1 } from "@tanstack/react-router";
import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { QueryClient, QueryClientProvider, useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import * as React from "react";
import { useState, useEffect } from "react";
import { Toaster as Toaster$1, toast } from "sonner";
import { s as supabase } from "./supabase-9upaG8fM.js";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { T as TSS_SERVER_FUNCTION, g as getServerFnById, c as createServerFn } from "../server.js";
import { z } from "zod";
import { cva } from "class-variance-authority";
const Toaster = ({ ...props }) => {
  return /* @__PURE__ */ jsx(
    Toaster$1,
    {
      position: "top-center",
      className: "toaster group",
      toastOptions: {
        classNames: {
          toast: "group toast group-[.toaster]:bg-[var(--background)] group-[.toaster]:text-[var(--foreground)] group-[.toaster]:border-[var(--border)] group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-[var(--muted-foreground)]",
          actionButton: "group-[.toast]:bg-[var(--primary)] group-[.toast]:text-[var(--primary-foreground)]",
          cancelButton: "group-[.toast]:bg-[var(--muted)] group-[.toast]:text-[var(--muted-foreground)]",
          error: "group-[.toast]:bg-[var(--destructive)] group-[.toast]:text-[var(--destructive-foreground)] group-[.toast]:border-[var(--destructive)]"
        }
      },
      ...props
    }
  );
};
const appCss = "/assets/app-CHZbr75e.css";
const Route$6 = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      {
        title: "Ember — Visual PostgreSQL ERD Designer"
      },
      {
        name: "description",
        content: "Design your PostgreSQL database schema visually with Ember. Create ERDs, define relationships, and export production-ready SQL instantly."
      }
    ],
    links: [{ rel: "stylesheet", href: appCss }]
  }),
  component: RootComponent
});
function RootComponent() {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1e3 * 60 * 5,
        // 5 minutes
        refetchOnWindowFocus: false
      }
    }
  }));
  return /* @__PURE__ */ jsxs("html", { lang: "en", children: [
    /* @__PURE__ */ jsxs("head", { children: [
      /* @__PURE__ */ jsx(HeadContent, {}),
      /* @__PURE__ */ jsx(
        "script",
        {
          dangerouslySetInnerHTML: {
            __html: `
              (function() {
                const theme = localStorage.getItem('theme') || 'dark';
                document.documentElement.classList.toggle('dark', theme === 'dark');
              })();
            `
          }
        }
      ),
      /* @__PURE__ */ jsx(
        "style",
        {
          dangerouslySetInnerHTML: {
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
            `
          }
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("body", { children: [
      /* @__PURE__ */ jsx("div", { id: "app-loader", children: /* @__PURE__ */ jsx("div", { className: "loader-spinner" }) }),
      /* @__PURE__ */ jsxs(QueryClientProvider, { client: queryClient, children: [
        /* @__PURE__ */ jsx(Outlet, {}),
        /* @__PURE__ */ jsx(Toaster, {}),
        /* @__PURE__ */ jsx(Scripts, {})
      ] }),
      /* @__PURE__ */ jsx(
        "script",
        {
          dangerouslySetInnerHTML: {
            __html: `
              window.addEventListener('load', function() {
                const loader = document.getElementById('app-loader');
                if (loader) {
                  loader.classList.add('loaded');
                  setTimeout(() => loader.remove(), 300);
                }
              });
            `
          }
        }
      )
    ] })
  ] });
}
function ThemeToggle() {
  const [theme, setTheme] = useState("dark");
  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "light" || stored === "dark") {
      setTheme(stored);
      document.documentElement.classList.toggle("dark", stored === "dark");
    } else {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      const defaultTheme = prefersDark ? "dark" : "light";
      setTheme(defaultTheme);
      document.documentElement.classList.toggle("dark", prefersDark);
    }
  }, []);
  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    localStorage.setItem("theme", newTheme);
  };
  return /* @__PURE__ */ jsx(
    "button",
    {
      onClick: toggleTheme,
      className: "p-2 rounded-lg transition-all hover:bg-accent",
      "aria-label": "Toggle theme",
      title: `Switch to ${theme === "dark" ? "light" : "dark"} mode`,
      children: theme === "dark" ? /* @__PURE__ */ jsxs(
        "svg",
        {
          xmlns: "http://www.w3.org/2000/svg",
          width: "20",
          height: "20",
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "currentColor",
          strokeWidth: "2",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          children: [
            /* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "4" }),
            /* @__PURE__ */ jsx("path", { d: "M12 2v2" }),
            /* @__PURE__ */ jsx("path", { d: "M12 20v2" }),
            /* @__PURE__ */ jsx("path", { d: "m4.93 4.93 1.41 1.41" }),
            /* @__PURE__ */ jsx("path", { d: "m17.66 17.66 1.41 1.41" }),
            /* @__PURE__ */ jsx("path", { d: "M2 12h2" }),
            /* @__PURE__ */ jsx("path", { d: "M20 12h2" }),
            /* @__PURE__ */ jsx("path", { d: "m6.34 17.66-1.41 1.41" }),
            /* @__PURE__ */ jsx("path", { d: "m19.07 4.93-1.41 1.41" })
          ]
        }
      ) : /* @__PURE__ */ jsx(
        "svg",
        {
          xmlns: "http://www.w3.org/2000/svg",
          width: "20",
          height: "20",
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "currentColor",
          strokeWidth: "2",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          children: /* @__PURE__ */ jsx("path", { d: "M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" })
        }
      )
    }
  );
}
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
function Spinner({ size = "md", className }) {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-6 h-6 border-2",
    lg: "w-8 h-8 border-3"
  };
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: cn(
        "inline-block rounded-full border-solid border-t-transparent animate-spin",
        sizeClasses[size],
        className
      ),
      style: {
        borderColor: "var(--primary)",
        borderTopColor: "transparent"
      },
      role: "status",
      "aria-label": "Loading",
      children: /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Loading..." })
    }
  );
}
const createSsrRpc = (functionId, importer) => {
  const url = "/_serverFn/" + functionId;
  const serverFnMeta = { id: functionId };
  const fn = async (...args) => {
    const serverFn = await getServerFnById(functionId);
    return serverFn(...args);
  };
  return Object.assign(fn, {
    url,
    serverFnMeta,
    [TSS_SERVER_FUNCTION]: true
  });
};
const setSessionCookies = createServerFn({
  method: "POST"
}).inputValidator(z.object({
  access_token: z.string(),
  refresh_token: z.string()
})).handler(createSsrRpc("12ff7462a09098a0654158fb38402f7272629f2663cd705cb09c09eca32923fb"));
const clearSessionCookies = createServerFn({
  method: "POST"
}).handler(createSsrRpc("d049fd6abe1f445361c56434f32f3b127b0b401d1a2348743679ad569e5739e0"));
const Route$5 = createFileRoute("/settings")({
  component: SettingsPage
});
function SettingsPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const getUser = async () => {
      const { data: { user: user2 } } = await supabase.auth.getUser();
      setUser(user2);
      setLoading(false);
    };
    getUser();
  }, []);
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    await clearSessionCookies();
    window.location.href = "/";
  };
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center", style: { background: "var(--background)" }, children: /* @__PURE__ */ jsx(Spinner, { size: "lg" }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen", style: { background: "var(--background)", color: "var(--foreground)" }, children: [
    /* @__PURE__ */ jsxs("header", { className: "sticky top-0 z-50 flex items-center justify-between px-4 py-3 border-b backdrop-blur-xl", style: { background: "var(--background)/80", borderColor: "var(--border)" }, children: [
      /* @__PURE__ */ jsx("div", { className: "flex items-center gap-3", children: /* @__PURE__ */ jsxs(
        Link,
        {
          to: "/app",
          className: "flex items-center gap-2 text-sm hover:opacity-80 transition-opacity",
          style: { color: "var(--muted-foreground)" },
          children: [
            /* @__PURE__ */ jsx("span", { children: "←" }),
            /* @__PURE__ */ jsx("span", { children: "Back to App" })
          ]
        }
      ) }),
      /* @__PURE__ */ jsx(ThemeToggle, {})
    ] }),
    /* @__PURE__ */ jsxs("main", { className: "max-w-2xl mx-auto px-4 py-8", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold mb-8", children: "Settings" }),
      /* @__PURE__ */ jsxs("section", { className: "mb-8", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-sm font-semibold uppercase tracking-wider mb-4", style: { color: "var(--muted-foreground)" }, children: "Profile" }),
        /* @__PURE__ */ jsxs(
          "div",
          {
            className: "rounded-xl border p-6",
            style: { background: "var(--card)", borderColor: "var(--border)" },
            children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
                user?.user_metadata?.avatar_url ? /* @__PURE__ */ jsx(
                  "img",
                  {
                    src: user.user_metadata.avatar_url,
                    alt: "Profile",
                    className: "w-16 h-16 rounded-full"
                  }
                ) : /* @__PURE__ */ jsx(
                  "div",
                  {
                    className: "w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold",
                    style: { background: "var(--primary)", color: "var(--primary-foreground)" },
                    children: user?.email?.[0]?.toUpperCase() || "?"
                  }
                ),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("p", { className: "font-semibold", children: user?.user_metadata?.full_name || "User" }),
                  /* @__PURE__ */ jsx("p", { className: "text-sm", style: { color: "var(--muted-foreground)" }, children: user?.email })
                ] })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "mt-6 pt-6 border-t", style: { borderColor: "var(--border)" }, children: /* @__PURE__ */ jsx(
                Link,
                {
                  to: "/profile",
                  className: "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80",
                  style: { background: "var(--primary)", color: "var(--primary-foreground)" },
                  children: "Edit Profile"
                }
              ) })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("section", { className: "mb-8", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-sm font-semibold uppercase tracking-wider mb-4", style: { color: "var(--muted-foreground)" }, children: "Account" }),
        /* @__PURE__ */ jsxs(
          "div",
          {
            className: "rounded-xl border overflow-hidden",
            style: { background: "var(--card)", borderColor: "var(--border)" },
            children: [
              /* @__PURE__ */ jsx("div", { className: "px-6 py-4 border-b", style: { borderColor: "var(--border)" }, children: /* @__PURE__ */ jsxs("p", { className: "text-sm", style: { color: "var(--muted-foreground)" }, children: [
                "Signed in with ",
                user?.app_metadata?.provider || "email"
              ] }) }),
              /* @__PURE__ */ jsx("div", { className: "p-6", children: /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: handleSignOut,
                  className: "px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80",
                  style: { background: "var(--destructive)", color: "var(--destructive-foreground)" },
                  children: "Sign Out"
                }
              ) })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("section", { children: [
        /* @__PURE__ */ jsx("h2", { className: "text-sm font-semibold uppercase tracking-wider mb-4", style: { color: "var(--muted-foreground)" }, children: "About" }),
        /* @__PURE__ */ jsxs(
          "div",
          {
            className: "rounded-xl border p-6",
            style: { background: "var(--card)", borderColor: "var(--border)" },
            children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-4", children: [
                /* @__PURE__ */ jsx(
                  "div",
                  {
                    className: "w-10 h-10 rounded-lg flex items-center justify-center font-bold",
                    style: { background: "var(--primary)", color: "var(--primary-foreground)" },
                    children: "E"
                  }
                ),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("p", { className: "font-semibold", children: "Ember" }),
                  /* @__PURE__ */ jsx("p", { className: "text-xs", style: { color: "var(--muted-foreground)" }, children: "Visual PostgreSQL ERD Designer" })
                ] })
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-sm leading-relaxed", style: { color: "var(--muted-foreground)" }, children: "Design your database visually. Create tables, define relationships, and export production-ready SQL." })
            ]
          }
        )
      ] })
    ] })
  ] });
}
const Route$4 = createFileRoute("/profile")({
  component: ProfilePage
});
function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    const getUser = async () => {
      const { data: { user: user2 } } = await supabase.auth.getUser();
      setUser(user2);
      setFullName(user2?.user_metadata?.full_name || "");
      setLoading(false);
    };
    getUser();
  }, []);
  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName }
      });
      if (error) {
        console.error("Error updating profile:", error.message);
      }
    } finally {
      setSaving(false);
    }
  };
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center", style: { background: "var(--background)" }, children: /* @__PURE__ */ jsx(Spinner, { size: "lg" }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen", style: { background: "var(--background)", color: "var(--foreground)" }, children: [
    /* @__PURE__ */ jsxs("header", { className: "sticky top-0 z-50 flex items-center justify-between px-4 py-3 border-b backdrop-blur-xl", style: { background: "var(--background)/80", borderColor: "var(--border)" }, children: [
      /* @__PURE__ */ jsx("div", { className: "flex items-center gap-3", children: /* @__PURE__ */ jsxs(
        Link,
        {
          to: "/settings",
          className: "flex items-center gap-2 text-sm hover:opacity-80 transition-opacity",
          style: { color: "var(--muted-foreground)" },
          children: [
            /* @__PURE__ */ jsx("span", { children: "←" }),
            /* @__PURE__ */ jsx("span", { children: "Back to Settings" })
          ]
        }
      ) }),
      /* @__PURE__ */ jsx(ThemeToggle, {})
    ] }),
    /* @__PURE__ */ jsxs("main", { className: "max-w-xl mx-auto px-4 py-8", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold mb-8", children: "Edit Profile" }),
      /* @__PURE__ */ jsxs(
        "div",
        {
          className: "rounded-xl border p-6 space-y-6",
          style: { background: "var(--card)", borderColor: "var(--border)" },
          children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
              user?.user_metadata?.avatar_url ? /* @__PURE__ */ jsx(
                "img",
                {
                  src: user.user_metadata.avatar_url,
                  alt: "Profile",
                  className: "w-20 h-20 rounded-full"
                }
              ) : /* @__PURE__ */ jsx(
                "div",
                {
                  className: "w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold",
                  style: { background: "var(--primary)", color: "var(--primary-foreground)" },
                  children: user?.email?.[0]?.toUpperCase() || "?"
                }
              ),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "font-semibold text-lg", children: user?.user_metadata?.full_name || "User" }),
                /* @__PURE__ */ jsx("p", { className: "text-sm", style: { color: "var(--muted-foreground)" }, children: user?.email })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium mb-2", children: "Full Name" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "text",
                    value: fullName,
                    onChange: (e) => setFullName(e.target.value),
                    className: "w-full px-4 py-2 rounded-lg border text-sm",
                    style: {
                      background: "var(--input)",
                      borderColor: "var(--border)",
                      color: "var(--foreground)"
                    }
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium mb-2", children: "Email" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "email",
                    value: user?.email || "",
                    disabled: true,
                    className: "w-full px-4 py-2 rounded-lg border text-sm opacity-60",
                    style: {
                      background: "var(--input)",
                      borderColor: "var(--border)",
                      color: "var(--foreground)"
                    }
                  }
                ),
                /* @__PURE__ */ jsx("p", { className: "text-xs mt-1", style: { color: "var(--muted-foreground)" }, children: "Email cannot be changed" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex gap-3 pt-4", children: [
              /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: handleSave,
                  disabled: saving,
                  className: "px-6 py-2 rounded-lg font-medium transition-all hover:opacity-80 disabled:opacity-50 flex items-center gap-2",
                  style: { background: "var(--primary)", color: "var(--primary-foreground)" },
                  children: [
                    saving && /* @__PURE__ */ jsx(Spinner, { size: "sm" }),
                    saving ? "Saving..." : "Save Changes"
                  ]
                }
              ),
              /* @__PURE__ */ jsx(
                Link,
                {
                  to: "/settings",
                  className: "px-6 py-2 rounded-lg font-medium transition-all hover:opacity-80",
                  style: { borderColor: "var(--border)", border: "1px solid", color: "var(--foreground)" },
                  children: "Cancel"
                }
              )
            ] })
          ]
        }
      )
    ] })
  ] });
}
const Route$3 = createFileRoute("/auth")({
  component: AuthPage
});
function AuthPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  useEffect(() => {
    const checkSession = async () => {
      if (window.location.hash.includes("access_token")) {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (session && !error) {
          setUser(session.user);
          await setSessionCookies({
            data: {
              access_token: session.access_token,
              refresh_token: session.refresh_token
            }
          });
          window.history.replaceState(null, "", "/app");
          window.location.href = "/app";
          return;
        }
      } else {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setUser(session.user);
        }
      }
      setLoading(false);
    };
    checkSession();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user || null);
      if (session) {
        await setSessionCookies({
          data: {
            access_token: session.access_token,
            refresh_token: session.refresh_token
          }
        });
      }
    });
    return () => subscription.unsubscribe();
  }, []);
  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/app"
      }
    });
    if (error) {
      console.error("Error signing in:", error.message);
    }
  };
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    await clearSessionCookies();
    setUser(null);
  };
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center", style: { background: "var(--background)" }, children: /* @__PURE__ */ jsx(Spinner, { size: "lg" }) });
  }
  if (user) {
    return /* @__PURE__ */ jsxs("div", { className: "min-h-screen flex flex-col", style: { background: "var(--background)", color: "var(--foreground)" }, children: [
      /* @__PURE__ */ jsxs("header", { className: "flex items-center justify-between px-6 py-4 border-b", style: { borderColor: "var(--border)" }, children: [
        /* @__PURE__ */ jsxs(Link, { to: "/", className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(
            "div",
            {
              className: "w-8 h-8 rounded-lg flex items-center justify-center",
              style: { background: "var(--primary)", color: "var(--primary-foreground)" },
              children: /* @__PURE__ */ jsx("span", { className: "font-black text-sm", children: "E" })
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "font-bold text-lg", children: "Ember" })
        ] }),
        /* @__PURE__ */ jsx(ThemeToggle, {})
      ] }),
      /* @__PURE__ */ jsx("main", { className: "flex-1 flex flex-col items-center justify-center px-4", children: /* @__PURE__ */ jsxs(
        "div",
        {
          className: "w-full max-w-sm rounded-2xl border p-8 text-center",
          style: { background: "var(--card)", borderColor: "var(--border)" },
          children: [
            /* @__PURE__ */ jsx(
              "div",
              {
                className: "w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4",
                style: {
                  background: "var(--primary)",
                  color: "var(--primary-foreground)"
                },
                children: user.user_metadata?.avatar_url ? /* @__PURE__ */ jsx(
                  "img",
                  {
                    src: user.user_metadata.avatar_url,
                    alt: "Profile",
                    className: "w-20 h-20 rounded-full"
                  }
                ) : user.email?.[0]?.toUpperCase() || "?"
              }
            ),
            /* @__PURE__ */ jsxs("h1", { className: "text-xl font-bold mb-2", children: [
              "Welcome, ",
              user.user_metadata?.full_name || "User",
              "!"
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-sm mb-6", style: { color: "var(--muted-foreground)" }, children: user.email }),
            /* @__PURE__ */ jsx(
              Link,
              {
                to: "/app",
                className: "block w-full py-3 rounded-xl font-medium transition-all hover:opacity-90 mb-3",
                style: {
                  background: "var(--primary)",
                  color: "var(--primary-foreground)"
                },
                children: "Go to App →"
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: handleSignOut,
                className: "w-full py-3 rounded-xl font-medium transition-all hover:opacity-80",
                style: { borderColor: "var(--border)", border: "1px solid", color: "var(--foreground)" },
                children: "Sign Out"
              }
            )
          ]
        }
      ) }),
      /* @__PURE__ */ jsx("footer", { className: "py-4 text-center text-xs", style: { color: "var(--muted-foreground)" }, children: /* @__PURE__ */ jsx(Link, { to: "/", className: "hover:opacity-80", children: "← Back to home" }) })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen flex flex-col", style: { background: "var(--background)", color: "var(--foreground)" }, children: [
    /* @__PURE__ */ jsxs("header", { className: "flex items-center justify-between px-6 py-4 border-b", style: { borderColor: "var(--border)" }, children: [
      /* @__PURE__ */ jsxs(Link, { to: "/", className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            className: "w-8 h-8 rounded-lg flex items-center justify-center",
            style: { background: "var(--primary)", color: "var(--primary-foreground)" },
            children: /* @__PURE__ */ jsx("span", { className: "font-black text-sm", children: "E" })
          }
        ),
        /* @__PURE__ */ jsx("span", { className: "font-bold text-lg", children: "Ember" })
      ] }),
      /* @__PURE__ */ jsx(ThemeToggle, {})
    ] }),
    /* @__PURE__ */ jsx("main", { className: "flex-1 flex items-center justify-center px-4", children: /* @__PURE__ */ jsxs(
      "div",
      {
        className: "w-full max-w-sm rounded-2xl border p-8 text-center",
        style: { background: "var(--card)", borderColor: "var(--border)" },
        children: [
          /* @__PURE__ */ jsx(
            "div",
            {
              className: "w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6",
              style: { background: "var(--accent)", borderColor: "var(--border)" },
              children: /* @__PURE__ */ jsx("span", { style: { color: "var(--primary)" }, children: "E" })
            }
          ),
          /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold mb-2", children: "Welcome to Ember" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm mb-8", style: { color: "var(--muted-foreground)" }, children: "Sign in to save and manage your ERD projects" }),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: handleGoogleSignIn,
              className: "w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl font-medium transition-all hover:opacity-90 border mb-4",
              style: {
                background: "var(--primary)",
                borderColor: "var(--primary)",
                color: "var(--primary-foreground)"
              },
              children: [
                /* @__PURE__ */ jsxs("svg", { className: "w-5 h-5", viewBox: "0 0 24 24", children: [
                  /* @__PURE__ */ jsx(
                    "path",
                    {
                      fill: "currentColor",
                      d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "path",
                    {
                      fill: "currentColor",
                      d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "path",
                    {
                      fill: "currentColor",
                      d: "M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "path",
                    {
                      fill: "currentColor",
                      d: "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    }
                  )
                ] }),
                "Sign in with Google"
              ]
            }
          ),
          /* @__PURE__ */ jsx("p", { className: "text-xs", style: { color: "var(--muted-foreground)" }, children: "Authentication required to access the app" })
        ]
      }
    ) }),
    /* @__PURE__ */ jsx("footer", { className: "py-4 text-center text-xs", style: { color: "var(--muted-foreground)" }, children: /* @__PURE__ */ jsx(Link, { to: "/", className: "hover:opacity-80", children: "← Back to home" }) })
  ] });
}
const Route$2 = createFileRoute("/")({
  component: LandingPage
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
      { name: "created_at", type: "timestamptz", pk: false }
    ]
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
      { name: "content", type: "text", pk: false }
    ]
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
      { name: "body", type: "text", pk: false }
    ]
  }
];
const FEATURES = [
  {
    icon: "⬡",
    title: "Visual ERD Designer",
    description: "Drag, drop, and connect tables on an infinite canvas. Design your entire schema visually with an intuitive interface.",
    color: "#f97316"
  },
  {
    icon: "🔗",
    title: "Smart Relationships",
    description: "Draw relationships between tables with automatic FK column creation. Supports 1:1, 1:N, N:1, and N:N with visual cardinality markers.",
    color: "#3b82f6"
  },
  {
    icon: "👥",
    title: "Realtime Collaboration",
    description: "Work together in real-time. See changes from your team instantly as tables, columns, and relationships are added or modified.",
    color: "#10b981"
  },
  {
    icon: "⬇",
    title: "SQL Export",
    description: "Export production-ready PostgreSQL DDL with CREATE TABLE, FOREIGN KEY constraints, and indexes in one click.",
    color: "#8b5cf6"
  },
  {
    icon: "🎨",
    title: "Rich Column Types",
    description: "Full PostgreSQL type support: UUID, JSONB, TIMESTAMPTZ, arrays, and more. Set PK, unique, nullable, and default values.",
    color: "#f59e0b"
  },
  {
    icon: "⚡",
    title: "Instant Sync",
    description: "Every change is saved instantly to PostgreSQL. Realtime subscriptions keep all collaborators in perfect sync.",
    color: "#ec4899"
  }
];
const STEPS = [
  {
    step: "01",
    title: "Create a Project",
    desc: "Name your database project and jump into the canvas."
  },
  {
    step: "02",
    title: "Add Tables & Columns",
    desc: "Click to add tables, define columns with PostgreSQL types, set PKs and constraints."
  },
  {
    step: "03",
    title: "Draw Relationships",
    desc: "Drag from a column handle to another table to create FK relationships."
  },
  {
    step: "04",
    title: "Export SQL",
    desc: "Click Export SQL to get production-ready PostgreSQL DDL. Copy or download as .sql."
  }
];
function MiniERD() {
  const [tablePositions, setTablePositions] = useState(
    DEMO_TABLES.map((t) => ({ x: t.x, y: t.y }))
  );
  const [dragging, setDragging] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const handleMouseDown = (e, index) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setDragging(index);
  };
  const handleMouseMove = (e) => {
    if (dragging !== null) {
      const container = e.currentTarget.getBoundingClientRect();
      const newX = e.clientX - container.left - dragOffset.x;
      const newY = e.clientY - container.top - dragOffset.y;
      setTablePositions(
        (prev) => prev.map(
          (pos, i) => i === dragging ? {
            x: Math.max(0, Math.min(newX, container.width - 160)),
            y: Math.max(0, Math.min(newY, container.height - 150))
          } : pos
        )
      );
    }
  };
  const handleMouseUp = () => {
    setDragging(null);
  };
  const getConnectionPath = (fromIdx, toIdx) => {
    const from = tablePositions[fromIdx];
    const to = tablePositions[toIdx];
    const fromX = from.x + 160;
    const fromY = from.y + 60;
    const toX = to.x;
    const toY = to.y + 60;
    const midX = (fromX + toX) / 2;
    return `M ${fromX} ${fromY} C ${midX} ${fromY}, ${midX} ${toY}, ${toX} ${toY}`;
  };
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: "relative w-full h-full select-none",
      onMouseMove: handleMouseMove,
      onMouseUp: handleMouseUp,
      onMouseLeave: handleMouseUp,
      children: [
        /* @__PURE__ */ jsxs(
          "svg",
          {
            className: "absolute inset-0 w-full h-full pointer-events-none",
            style: { zIndex: 0 },
            children: [
              /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsx(
                "marker",
                {
                  id: "arrow-theme",
                  markerWidth: "8",
                  markerHeight: "8",
                  refX: "6",
                  refY: "3",
                  orient: "auto",
                  children: /* @__PURE__ */ jsx("path", { d: "M0,0 L0,6 L8,3 z", fill: "var(--primary)", opacity: "0.7" })
                }
              ) }),
              /* @__PURE__ */ jsx(
                "path",
                {
                  d: getConnectionPath(0, 1),
                  stroke: "var(--primary)",
                  strokeWidth: "1.5",
                  fill: "none",
                  opacity: "0.6",
                  markerEnd: "url(#arrow-theme)"
                }
              ),
              /* @__PURE__ */ jsx(
                "path",
                {
                  d: getConnectionPath(1, 2),
                  stroke: "var(--primary)",
                  strokeWidth: "1.5",
                  fill: "none",
                  opacity: "0.6",
                  markerEnd: "url(#arrow-theme)"
                }
              ),
              /* @__PURE__ */ jsx(
                "path",
                {
                  d: getConnectionPath(0, 2),
                  stroke: "var(--primary)",
                  strokeWidth: "1.5",
                  fill: "none",
                  opacity: "0.4",
                  strokeDasharray: "4 3",
                  markerEnd: "url(#arrow-theme)"
                }
              )
            ]
          }
        ),
        DEMO_TABLES.map((table, index) => /* @__PURE__ */ jsxs(
          "div",
          {
            className: "absolute rounded-xl overflow-hidden shadow-2xl cursor-move transition-shadow hover:shadow-3xl",
            style: {
              left: tablePositions[index].x,
              top: tablePositions[index].y,
              width: 160,
              background: "var(--card)",
              border: "1px solid var(--border)",
              zIndex: dragging === index ? 10 : 1
            },
            onMouseDown: (e) => handleMouseDown(e, index),
            children: [
              /* @__PURE__ */ jsxs(
                "div",
                {
                  className: "px-3 py-2 flex items-center gap-2 border-b",
                  style: {
                    background: "var(--accent)",
                    borderColor: "var(--border)"
                  },
                  children: [
                    /* @__PURE__ */ jsx(
                      "div",
                      {
                        className: "w-2 h-2 rounded-full",
                        style: { background: "var(--primary)" }
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      "span",
                      {
                        className: "text-xs font-bold tracking-wide",
                        style: { color: "var(--primary)" },
                        children: table.name
                      }
                    )
                  ]
                }
              ),
              table.columns.map((col) => /* @__PURE__ */ jsxs(
                "div",
                {
                  className: "flex items-center gap-2 px-3 py-1.5 text-xs border-b last:border-0",
                  style: { borderColor: "var(--border)" },
                  children: [
                    col.pk ? /* @__PURE__ */ jsx("span", { className: "text-yellow-500 text-[9px] font-bold", children: "PK" }) : /* @__PURE__ */ jsx("span", { className: "w-4" }),
                    /* @__PURE__ */ jsx("span", { className: "flex-1", style: { color: "var(--foreground)" }, children: col.name }),
                    /* @__PURE__ */ jsx(
                      "span",
                      {
                        className: "text-[9px] font-mono",
                        style: { color: "var(--muted-foreground)" },
                        children: col.type
                      }
                    )
                  ]
                },
                col.name
              ))
            ]
          },
          table.name
        )),
        /* @__PURE__ */ jsx(
          "div",
          {
            className: "absolute bottom-4 right-4 px-3 py-1.5 rounded-full text-xs font-semibold border pointer-events-none",
            style: {
              background: "var(--accent)",
              borderColor: "var(--border)",
              color: "var(--primary)"
            },
            children: "✓ 3 tables · 2 relationships"
          }
        )
      ]
    }
  );
}
function LandingPage() {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    setIsVisible(true);
  }, []);
  const { data: user, isLoading } = useQuery({
    queryKey: ["fetch-user"],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      return data.user;
    }
  });
  if (isLoading) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center", style: { background: "var(--background)" }, children: /* @__PURE__ */ jsx(Spinner, { size: "lg" }) });
  }
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: "min-h-screen overflow-x-hidden",
      style: { background: "var(--background)", color: "var(--foreground)" },
      children: [
        /* @__PURE__ */ jsxs(
          "nav",
          {
            className: "fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b backdrop-blur-xl",
            style: {
              borderColor: "var(--border)",
              background: "var(--background)/80"
            },
            children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx(
                  "div",
                  {
                    className: "w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center",
                    style: {
                      background: "var(--primary)",
                      color: "var(--primary-foreground)"
                    },
                    children: /* @__PURE__ */ jsx("span", { className: "font-black text-xs sm:text-sm", children: "E" })
                  }
                ),
                /* @__PURE__ */ jsx("span", { className: "font-bold text-base sm:text-lg tracking-tight", children: "Ember" }),
                /* @__PURE__ */ jsx(
                  "span",
                  {
                    className: "ml-1 sm:ml-2 px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-semibold border",
                    style: {
                      background: "var(--accent)",
                      color: "var(--accent-foreground)",
                      borderColor: "var(--border)"
                    },
                    children: "BETA"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs(
                "div",
                {
                  className: "hidden md:flex items-center gap-6 lg:gap-8 text-sm",
                  style: { color: "var(--muted-foreground)" },
                  children: [
                    /* @__PURE__ */ jsx("a", { href: "#features", className: "hover:opacity-80 transition-colors", children: "Features" }),
                    /* @__PURE__ */ jsx(
                      "a",
                      {
                        href: "#how-it-works",
                        className: "hover:opacity-80 transition-colors",
                        children: "How it works"
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      "a",
                      {
                        href: "https://github.com",
                        className: "hover:opacity-80 transition-colors",
                        children: "GitHub"
                      }
                    )
                  ]
                }
              ),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 sm:gap-3", children: [
                /* @__PURE__ */ jsx(ThemeToggle, {}),
                user ? /* @__PURE__ */ jsx(Link, { to: "/app", children: /* @__PURE__ */ jsx(
                  "img",
                  {
                    className: "rounded-full size-6",
                    src: user.user_metadata.avatar_url
                  }
                ) }) : /* @__PURE__ */ jsx(
                  Link,
                  {
                    to: "/auth",
                    className: "px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 hover:scale-105",
                    style: {
                      background: "var(--primary)",
                      color: "var(--primary-foreground)"
                    },
                    children: /* @__PURE__ */ jsxs(Fragment, { children: [
                      /* @__PURE__ */ jsx("span", { className: "hidden sm:inline", children: "Sign In →" }),
                      /* @__PURE__ */ jsx("span", { className: "sm:hidden", children: "Sign In →" })
                    ] })
                  }
                )
              ] })
            ]
          }
        ),
        /* @__PURE__ */ jsx("section", { className: "relative pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-16 md:pb-20 px-4 sm:px-6 max-w-7xl mx-auto", children: /* @__PURE__ */ jsxs("div", { className: "grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center", children: [
          /* @__PURE__ */ jsxs(
            "div",
            {
              className: `transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`,
              children: [
                /* @__PURE__ */ jsxs(
                  "div",
                  {
                    className: "inline-flex items-center gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-medium mb-4 sm:mb-6 border",
                    style: {
                      background: "var(--accent)",
                      color: "var(--accent-foreground)",
                      borderColor: "var(--border)"
                    },
                    children: [
                      /* @__PURE__ */ jsx(
                        "span",
                        {
                          className: "w-1.5 h-1.5 rounded-full animate-pulse",
                          style: { background: "var(--primary)" }
                        }
                      ),
                      "PostgreSQL ERD Designer"
                    ]
                  }
                ),
                /* @__PURE__ */ jsxs("h1", { className: "text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-4 sm:mb-6", children: [
                  "Design your",
                  " ",
                  /* @__PURE__ */ jsx("span", { style: { color: "var(--primary)" }, children: "database" }),
                  /* @__PURE__ */ jsx("br", {}),
                  "visually."
                ] }),
                /* @__PURE__ */ jsx(
                  "p",
                  {
                    className: "text-base sm:text-lg leading-relaxed mb-6 sm:mb-8 max-w-lg",
                    style: { color: "var(--muted-foreground)" },
                    children: "Ember is a collaborative PostgreSQL schema designer. Create tables, define relationships, and work with your team in real-time — all in a beautiful drag-and-drop canvas."
                  }
                ),
                /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4", children: [
                  /* @__PURE__ */ jsxs(
                    Link,
                    {
                      to: "/auth",
                      className: "group flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold text-sm sm:text-base transition-all duration-200 hover:scale-105 hover:shadow-2xl",
                      style: {
                        background: "var(--primary)",
                        color: "var(--primary-foreground)"
                      },
                      children: [
                        "Start Designing",
                        /* @__PURE__ */ jsx("span", { className: "group-hover:translate-x-1 transition-transform", children: "→" })
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "a",
                    {
                      href: "#how-it-works",
                      className: "flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold text-sm sm:text-base border transition-all duration-200",
                      style: {
                        color: "var(--foreground)",
                        borderColor: "var(--border)"
                      },
                      children: "See how it works"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsx(
                  "div",
                  {
                    className: "flex gap-6 sm:gap-8 mt-8 sm:mt-12 pt-6 sm:pt-8 border-t",
                    style: { borderColor: "var(--border)" },
                    children: [
                      { val: "20+", label: "PG Types" },
                      { val: "Realtime", label: "Collaboration" },
                      { val: "1-click", label: "SQL Export" }
                    ].map((s) => /* @__PURE__ */ jsxs("div", { children: [
                      /* @__PURE__ */ jsx(
                        "div",
                        {
                          className: "text-xl sm:text-2xl font-black",
                          style: { color: "var(--primary)" },
                          children: s.val
                        }
                      ),
                      /* @__PURE__ */ jsx(
                        "div",
                        {
                          className: "text-[10px] sm:text-xs mt-0.5",
                          style: { color: "var(--muted-foreground)" },
                          children: s.label
                        }
                      )
                    ] }, s.label))
                  }
                )
              ]
            }
          ),
          /* @__PURE__ */ jsx(
            "div",
            {
              className: `transition-all duration-700 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`,
              children: /* @__PURE__ */ jsxs(
                "div",
                {
                  className: "relative rounded-2xl overflow-hidden border h-[280px] sm:h-[320px] md:h-[380px]",
                  style: {
                    background: "var(--card)",
                    borderColor: "var(--border)"
                  },
                  children: [
                    /* @__PURE__ */ jsxs(
                      "div",
                      {
                        className: "flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 border-b",
                        style: { borderColor: "var(--border)" },
                        children: [
                          /* @__PURE__ */ jsx("div", { className: "w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500/60" }),
                          /* @__PURE__ */ jsx("div", { className: "w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-500/60" }),
                          /* @__PURE__ */ jsx("div", { className: "w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500/60" }),
                          /* @__PURE__ */ jsx(
                            "span",
                            {
                              className: "ml-2 sm:ml-3 text-[10px] sm:text-xs font-mono",
                              style: { color: "var(--muted-foreground)" },
                              children: "ember · blog_schema"
                            }
                          )
                        ]
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      "div",
                      {
                        className: "relative",
                        style: { height: "calc(100% - 44px)" },
                        children: /* @__PURE__ */ jsx(MiniERD, {})
                      }
                    )
                  ]
                }
              )
            }
          )
        ] }) }),
        /* @__PURE__ */ jsxs(
          "section",
          {
            id: "features",
            className: "py-16 sm:py-20 md:py-24 px-4 sm:px-6 max-w-7xl mx-auto",
            children: [
              /* @__PURE__ */ jsxs("div", { className: "text-center mb-12 sm:mb-16", children: [
                /* @__PURE__ */ jsxs("h2", { className: "text-3xl sm:text-4xl font-black mb-3 sm:mb-4", children: [
                  "Everything you need to",
                  " ",
                  /* @__PURE__ */ jsx("span", { style: { color: "var(--primary)" }, children: "collaborate" })
                ] }),
                /* @__PURE__ */ jsx(
                  "p",
                  {
                    className: "text-base sm:text-lg max-w-2xl mx-auto",
                    style: { color: "var(--muted-foreground)" },
                    children: "Design together in real-time. See changes instantly. Export production-ready SQL."
                  }
                )
              ] }),
              /* @__PURE__ */ jsx("div", { className: "grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6", children: FEATURES.map((f) => /* @__PURE__ */ jsxs(
                "div",
                {
                  className: "group p-5 sm:p-6 rounded-2xl border transition-all duration-300 hover:-translate-y-1",
                  style: {
                    background: "var(--card)",
                    borderColor: "var(--border)"
                  },
                  children: [
                    /* @__PURE__ */ jsx(
                      "div",
                      {
                        className: "w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-xl sm:text-2xl mb-3 sm:mb-4 transition-transform group-hover:scale-110 border",
                        style: {
                          background: "var(--accent)",
                          borderColor: "var(--border)"
                        },
                        children: f.icon
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      "h3",
                      {
                        className: "font-bold text-base sm:text-lg mb-2",
                        style: { color: "var(--card-foreground)" },
                        children: f.title
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      "p",
                      {
                        className: "text-xs sm:text-sm leading-relaxed",
                        style: { color: "var(--muted-foreground)" },
                        children: f.description
                      }
                    )
                  ]
                },
                f.title
              )) })
            ]
          }
        ),
        /* @__PURE__ */ jsx(
          "section",
          {
            id: "how-it-works",
            className: "py-16 sm:py-20 md:py-24 px-4 sm:px-6",
            style: { background: "var(--accent)" },
            children: /* @__PURE__ */ jsxs("div", { className: "max-w-5xl mx-auto", children: [
              /* @__PURE__ */ jsxs("div", { className: "text-center mb-12 sm:mb-16", children: [
                /* @__PURE__ */ jsxs("h2", { className: "text-3xl sm:text-4xl font-black mb-3 sm:mb-4", children: [
                  "From idea to SQL in",
                  " ",
                  /* @__PURE__ */ jsx("span", { style: { color: "var(--primary)" }, children: "minutes" })
                ] }),
                /* @__PURE__ */ jsx(
                  "p",
                  {
                    className: "text-base sm:text-lg",
                    style: { color: "var(--muted-foreground)" },
                    children: "Four simple steps to a production-ready schema."
                  }
                )
              ] }),
              /* @__PURE__ */ jsx("div", { className: "grid sm:grid-cols-2 gap-4 sm:gap-6", children: STEPS.map((s, i) => /* @__PURE__ */ jsxs(
                "div",
                {
                  className: "flex gap-4 sm:gap-5 p-5 sm:p-6 rounded-2xl border transition-all duration-300",
                  style: {
                    background: "var(--card)",
                    borderColor: "var(--border)"
                  },
                  children: [
                    /* @__PURE__ */ jsx(
                      "div",
                      {
                        className: "flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center font-black text-xs sm:text-sm border",
                        style: {
                          background: "var(--accent)",
                          borderColor: "var(--border)",
                          color: "var(--accent-foreground)"
                        },
                        children: s.step
                      }
                    ),
                    /* @__PURE__ */ jsxs("div", { children: [
                      /* @__PURE__ */ jsx(
                        "h3",
                        {
                          className: "font-bold text-sm sm:text-base mb-1",
                          style: { color: "var(--card-foreground)" },
                          children: s.title
                        }
                      ),
                      /* @__PURE__ */ jsx(
                        "p",
                        {
                          className: "text-xs sm:text-sm leading-relaxed",
                          style: { color: "var(--muted-foreground)" },
                          children: s.desc
                        }
                      )
                    ] })
                  ]
                },
                s.step
              )) })
            ] })
          }
        ),
        /* @__PURE__ */ jsx("section", { className: "py-16 sm:py-20 md:py-24 px-4 sm:px-6 max-w-7xl mx-auto", children: /* @__PURE__ */ jsxs("div", { className: "grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("h2", { className: "text-3xl sm:text-4xl font-black mb-4 sm:mb-6", children: [
              "Export clean,",
              " ",
              /* @__PURE__ */ jsx("span", { style: { color: "var(--primary)" }, children: "production SQL" })
            ] }),
            /* @__PURE__ */ jsxs(
              "p",
              {
                className: "text-sm sm:text-base leading-relaxed mb-4 sm:mb-6",
                style: { color: "var(--muted-foreground)" },
                children: [
                  "Ember generates complete PostgreSQL DDL — CREATE TABLE statements, foreign key constraints, indexes, and more. Copy to clipboard or download as a",
                  " ",
                  /* @__PURE__ */ jsx("code", { style: { color: "var(--primary)" }, children: ".sql" }),
                  " file."
                ]
              }
            ),
            /* @__PURE__ */ jsx("ul", { className: "space-y-2 sm:space-y-3", children: [
              "CREATE TABLE with all column types & constraints",
              "ALTER TABLE ADD CONSTRAINT FOREIGN KEY",
              "CREATE INDEX for FK columns",
              "Syntax-highlighted preview"
            ].map((item) => /* @__PURE__ */ jsxs(
              "li",
              {
                className: "flex items-center gap-2 sm:gap-3 text-xs sm:text-sm",
                style: { color: "var(--foreground)" },
                children: [
                  /* @__PURE__ */ jsx(
                    "span",
                    {
                      className: "font-bold",
                      style: { color: "var(--primary)" },
                      children: "✓"
                    }
                  ),
                  item
                ]
              },
              item
            )) })
          ] }),
          /* @__PURE__ */ jsxs(
            "div",
            {
              className: "rounded-2xl overflow-hidden border",
              style: {
                background: "var(--card)",
                borderColor: "var(--border)"
              },
              children: [
                /* @__PURE__ */ jsxs(
                  "div",
                  {
                    className: "flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 border-b",
                    style: { borderColor: "var(--border)" },
                    children: [
                      /* @__PURE__ */ jsx(
                        "span",
                        {
                          className: "text-[10px] sm:text-xs font-mono",
                          style: { color: "var(--muted-foreground)" },
                          children: "schema.sql"
                        }
                      ),
                      /* @__PURE__ */ jsx(
                        "span",
                        {
                          className: "text-[10px] sm:text-xs font-semibold",
                          style: { color: "var(--primary)" },
                          children: "Export ready"
                        }
                      )
                    ]
                  }
                ),
                /* @__PURE__ */ jsx(
                  "pre",
                  {
                    className: "p-3 sm:p-5 text-[10px] sm:text-xs font-mono leading-relaxed overflow-x-auto",
                    style: { color: "var(--foreground)" },
                    children: /* @__PURE__ */ jsxs("code", { children: [
                      /* @__PURE__ */ jsx("span", { style: { color: "var(--muted-foreground)" }, children: "-- Ember ERD Export: blog_schema\n" }),
                      /* @__PURE__ */ jsx("span", { style: { color: "var(--muted-foreground)" }, children: "-- Generated: 2026-02-18\n\n" }),
                      /* @__PURE__ */ jsx("span", { style: { color: "var(--primary)" }, children: "CREATE TABLE " }),
                      /* @__PURE__ */ jsx("span", { style: { color: "var(--foreground)" }, children: '"users" (\n' }),
                      /* @__PURE__ */ jsx("span", { style: { color: "var(--foreground)" }, children: "  " }),
                      /* @__PURE__ */ jsx("span", { style: { color: "var(--foreground)" }, children: "  " }),
                      /* @__PURE__ */ jsx("span", { style: { color: "var(--foreground)" }, children: '"id"' }),
                      /* @__PURE__ */ jsx("span", { style: { color: "var(--chart-1)" }, children: " UUID" }),
                      /* @__PURE__ */ jsx("span", { style: { color: "var(--primary)" }, children: " PRIMARY KEY" }),
                      /* @__PURE__ */ jsx("span", { style: { color: "var(--foreground)" }, children: ",\n" }),
                      /* @__PURE__ */ jsx("span", { style: { color: "var(--foreground)" }, children: "  " }),
                      /* @__PURE__ */ jsx("span", { style: { color: "var(--foreground)" }, children: '"email"' }),
                      /* @__PURE__ */ jsx("span", { style: { color: "var(--chart-1)" }, children: " VARCHAR(255)" }),
                      /* @__PURE__ */ jsx("span", { style: { color: "var(--primary)" }, children: " NOT NULL UNIQUE" }),
                      /* @__PURE__ */ jsx("span", { style: { color: "var(--foreground)" }, children: ",\n" }),
                      /* @__PURE__ */ jsx("span", { style: { color: "var(--foreground)" }, children: "  " }),
                      /* @__PURE__ */ jsx("span", { style: { color: "var(--foreground)" }, children: '"created_at"' }),
                      /* @__PURE__ */ jsx("span", { style: { color: "var(--chart-1)" }, children: " TIMESTAMPTZ" }),
                      /* @__PURE__ */ jsx("span", { style: { color: "var(--foreground)" }, children: "\n);\n\n" }),
                      /* @__PURE__ */ jsx("span", { style: { color: "var(--primary)" }, children: "CREATE TABLE " }),
                      /* @__PURE__ */ jsx("span", { style: { color: "var(--foreground)" }, children: '"posts" (\n' }),
                      /* @__PURE__ */ jsx("span", { style: { color: "var(--foreground)" }, children: "  " }),
                      /* @__PURE__ */ jsx("span", { style: { color: "var(--foreground)" }, children: '"id"' }),
                      /* @__PURE__ */ jsx("span", { style: { color: "var(--chart-1)" }, children: " UUID" }),
                      /* @__PURE__ */ jsx("span", { style: { color: "var(--primary)" }, children: " PRIMARY KEY" }),
                      /* @__PURE__ */ jsx("span", { style: { color: "var(--foreground)" }, children: ",\n" }),
                      /* @__PURE__ */ jsx("span", { style: { color: "var(--foreground)" }, children: "  " }),
                      /* @__PURE__ */ jsx("span", { style: { color: "var(--foreground)" }, children: '"user_id"' }),
                      /* @__PURE__ */ jsx("span", { style: { color: "var(--chart-1)" }, children: " UUID" }),
                      /* @__PURE__ */ jsx("span", { style: { color: "var(--primary)" }, children: " NOT NULL" }),
                      /* @__PURE__ */ jsx("span", { style: { color: "var(--foreground)" }, children: "\n);\n\n" }),
                      /* @__PURE__ */ jsx("span", { style: { color: "var(--muted-foreground)" }, children: "-- Foreign Key Constraints\n" }),
                      /* @__PURE__ */ jsx("span", { style: { color: "var(--primary)" }, children: "ALTER TABLE " }),
                      /* @__PURE__ */ jsx("span", { style: { color: "var(--foreground)" }, children: '"posts" ' }),
                      /* @__PURE__ */ jsx("span", { style: { color: "var(--primary)" }, children: "ADD CONSTRAINT " }),
                      /* @__PURE__ */ jsx("span", { style: { color: "var(--foreground)" }, children: '"fk_posts_users"\n' }),
                      /* @__PURE__ */ jsx("span", { style: { color: "var(--primary)" }, children: "  FOREIGN KEY " }),
                      /* @__PURE__ */ jsx("span", { style: { color: "var(--foreground)" }, children: '("user_id") ' }),
                      /* @__PURE__ */ jsx("span", { style: { color: "var(--primary)" }, children: "REFERENCES " }),
                      /* @__PURE__ */ jsx("span", { style: { color: "var(--foreground)" }, children: '"users" ("id");' })
                    ] })
                  }
                )
              ]
            }
          )
        ] }) }),
        /* @__PURE__ */ jsx("section", { className: "py-16 sm:py-20 md:py-24 px-4 sm:px-6", children: /* @__PURE__ */ jsxs(
          "div",
          {
            className: "max-w-3xl mx-auto text-center rounded-2xl sm:rounded-3xl p-8 sm:p-12 md:p-16 border",
            style: {
              background: "var(--card)",
              borderColor: "var(--border)"
            },
            children: [
              /* @__PURE__ */ jsxs("h2", { className: "text-3xl sm:text-4xl md:text-5xl font-black mb-4 sm:mb-6", children: [
                "Ready to design your",
                " ",
                /* @__PURE__ */ jsx("span", { style: { color: "var(--primary)" }, children: "schema?" })
              ] }),
              /* @__PURE__ */ jsx(
                "p",
                {
                  className: "text-sm sm:text-base md:text-lg mb-8 sm:mb-10",
                  style: { color: "var(--muted-foreground)" },
                  children: "Sign in with Google to start designing. Collaborate with your team in real-time."
                }
              ),
              /* @__PURE__ */ jsxs(
                Link,
                {
                  to: "/auth",
                  className: "inline-flex items-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg transition-all duration-200 hover:scale-105",
                  style: {
                    background: "var(--primary)",
                    color: "var(--primary-foreground)"
                  },
                  children: [
                    "Open Ember",
                    /* @__PURE__ */ jsx("span", { className: "text-lg sm:text-xl", children: "→" })
                  ]
                }
              )
            ]
          }
        ) }),
        /* @__PURE__ */ jsxs(
          "footer",
          {
            className: "py-6 sm:py-8 px-4 sm:px-6 border-t text-center text-xs sm:text-sm",
            style: {
              borderColor: "var(--border)",
              color: "var(--muted-foreground)"
            },
            children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-2 mb-2", children: [
                /* @__PURE__ */ jsx(
                  "div",
                  {
                    className: "w-4 h-4 sm:w-5 sm:h-5 rounded flex items-center justify-center",
                    style: {
                      background: "var(--primary)",
                      color: "var(--primary-foreground)"
                    },
                    children: /* @__PURE__ */ jsx("span", { className: "font-black text-[9px] sm:text-[10px]", children: "E" })
                  }
                ),
                /* @__PURE__ */ jsx(
                  "span",
                  {
                    className: "font-semibold",
                    style: { color: "var(--foreground)" },
                    children: "Ember"
                  }
                )
              ] }),
              /* @__PURE__ */ jsx("p", { className: "max-w-md mx-auto", children: "Visual PostgreSQL ERD Designer · Built with TanStack Start + React Flow" })
            ]
          }
        )
      ]
    }
  );
}
const getProjects = createServerFn({
  method: "GET"
}).handler(createSsrRpc("cc7cd7848f868afd6039be219de40080fb83f7d9940fd5b40cf6821674ff7eb6"));
const getProject = createServerFn({
  method: "GET"
}).inputValidator(z.object({
  id: z.string()
})).handler(createSsrRpc("0ef74326a5824c919c0259568e0bd5aa072fcba8ef27f40999ce5806d6baf0d1"));
const createProject = createServerFn({
  method: "POST"
}).inputValidator(z.object({
  name: z.string(),
  description: z.string().optional(),
  user_id: z.string()
})).handler(createSsrRpc("5c086309e3adf1cf08705ff24355fff50f75d23ae63e4c2852d7ae44b3405e8a"));
const deleteProject = createServerFn({
  method: "POST"
}).inputValidator(z.object({
  id: z.string()
})).handler(createSsrRpc("ac9aa40c7a11203f7df71da777fdcfc5fb81276636a3c9f904c150c900958276"));
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:opacity-90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:opacity-90",
        outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:opacity-90",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
const Button = React.forwardRef(
  ({ className, variant, size, ...props }, ref) => {
    return /* @__PURE__ */ jsx(
      "button",
      {
        className: cn(buttonVariants({ variant, size, className })),
        ref,
        ...props
      }
    );
  }
);
Button.displayName = "Button";
const Input = React.forwardRef(
  ({ className, type, ...props }, ref) => {
    return /* @__PURE__ */ jsx(
      "input",
      {
        type,
        className: cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          className
        ),
        ref,
        ...props
      }
    );
  }
);
Input.displayName = "Input";
const Textarea = React.forwardRef(
  ({ className, ...props }, ref) => {
    return /* @__PURE__ */ jsx(
      "textarea",
      {
        className: cn(
          "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          className
        ),
        ref,
        ...props
      }
    );
  }
);
Textarea.displayName = "Textarea";
const Label = React.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsx(
    "label",
    {
      ref,
      className: cn(
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className
      ),
      ...props
    }
  )
);
Label.displayName = "Label";
function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default"
}) {
  if (!isOpen) return null;
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: "fixed inset-0 z-50 flex items-center justify-center p-4",
      style: { background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" },
      onClick: (e) => e.target === e.currentTarget && onClose(),
      children: /* @__PURE__ */ jsxs(
        "div",
        {
          className: "w-full max-w-md rounded-2xl border overflow-hidden",
          style: { background: "var(--card)", borderColor: "var(--border)" },
          children: [
            /* @__PURE__ */ jsx("div", { className: "px-6 py-4 border-b", style: { borderColor: "var(--border)" }, children: /* @__PURE__ */ jsx("h2", { className: "font-bold text-lg", style: { color: "var(--card-foreground)" }, children: title }) }),
            /* @__PURE__ */ jsx("div", { className: "px-6 py-4", children: /* @__PURE__ */ jsx("p", { className: "text-sm leading-relaxed", style: { color: "var(--muted-foreground)" }, children: description }) }),
            /* @__PURE__ */ jsxs("div", { className: "px-6 py-4 border-t flex gap-3 justify-end", style: { borderColor: "var(--border)" }, children: [
              /* @__PURE__ */ jsx(Button, { onClick: onClose, variant: "outline", children: cancelText }),
              /* @__PURE__ */ jsx(
                Button,
                {
                  onClick: () => {
                    onConfirm();
                    onClose();
                  },
                  variant: variant === "destructive" ? "destructive" : "default",
                  children: confirmText
                }
              )
            ] })
          ]
        }
      )
    }
  );
}
const Route$1 = createFileRoute("/app/")({
  component: AppDashboard
});
function ProjectCard({
  project,
  onDelete
}) {
  const timeAgo = (date) => {
    const d = new Date(date);
    const diff = Date.now() - d.getTime();
    const mins = Math.floor(diff / 6e4);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };
  return /* @__PURE__ */ jsxs(
    Link,
    {
      to: "/app/$projectId",
      params: { projectId: project.id },
      className: "group block p-6 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl",
      style: {
        background: "var(--card)",
        borderColor: "var(--border)"
      },
      children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between mb-4", children: [
          /* @__PURE__ */ jsx(
            "div",
            {
              className: "w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg",
              style: {
                background: "var(--accent)",
                borderColor: "var(--border)",
                color: "var(--accent-foreground)",
                border: "1px solid"
              },
              children: project.name[0].toUpperCase()
            }
          ),
          /* @__PURE__ */ jsx(
            Button,
            {
              onClick: (e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete(project.id, project.name);
              },
              className: "opacity-0 group-hover:opacity-100 p-1.5 rounded-lg transition-all",
              style: {
                color: "var(--destructive)",
                background: "transparent"
              },
              title: "Delete project",
              children: /* @__PURE__ */ jsxs(
                "svg",
                {
                  xmlns: "http://www.w3.org/2000/svg",
                  width: "16",
                  height: "16",
                  viewBox: "0 0 24 24",
                  fill: "none",
                  stroke: "currentColor",
                  strokeWidth: "2",
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                  children: [
                    /* @__PURE__ */ jsx("path", { d: "M3 6h18" }),
                    /* @__PURE__ */ jsx("path", { d: "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" }),
                    /* @__PURE__ */ jsx("path", { d: "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" })
                  ]
                }
              )
            }
          )
        ] }),
        /* @__PURE__ */ jsx("h3", { className: "font-bold text-base mb-1 transition-colors", style: { color: "var(--card-foreground)" }, children: project.name }),
        project.description && /* @__PURE__ */ jsx("p", { className: "text-sm mb-3 line-clamp-2", style: { color: "var(--muted-foreground)" }, children: project.description }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mt-4 pt-4 border-t", style: { borderColor: "var(--border)" }, children: [
          /* @__PURE__ */ jsx("div", { className: "flex items-center gap-3", children: /* @__PURE__ */ jsxs("span", { className: "text-xs", style: { color: "var(--muted-foreground)" }, children: [
            /* @__PURE__ */ jsx("span", { className: "font-semibold", style: { color: "var(--foreground)" }, children: project.tableCount }),
            " ",
            project.tableCount === 1 ? "table" : "tables"
          ] }) }),
          /* @__PURE__ */ jsx("span", { className: "text-xs", style: { color: "var(--muted-foreground)" }, children: timeAgo(project.updatedAt) })
        ] })
      ]
    }
  );
}
function NewProjectModal({
  onClose,
  user
}) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const createMutation = useMutation({
    mutationFn: createProject,
    onSuccess: (project) => {
      queryClient.setQueryData(["projects"], (old) => {
        if (!old) return [{ ...project, tableCount: 0 }];
        return [{ ...project, tableCount: 0 }, ...old];
      });
      onClose();
      toast.success("Project created successfully");
    },
    onError: (error) => {
      console.error("Failed to create project:", error);
      toast.error("Failed to create project. Please try again.");
    }
  });
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      console.log("user", user?.id);
      await createMutation.mutateAsync({
        data: {
          name: name.trim(),
          description: description.trim() || void 0,
          user_id: user?.id
        }
      });
    } catch (error) {
    }
  };
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: "fixed inset-0 z-50 flex items-center justify-center p-4",
      style: { background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" },
      onClick: (e) => e.target === e.currentTarget && onClose(),
      children: /* @__PURE__ */ jsxs(
        "div",
        {
          className: "w-full max-w-md rounded-2xl p-6 border",
          style: { background: "var(--card)", borderColor: "var(--border)" },
          children: [
            /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold mb-6", style: { color: "var(--card-foreground)" }, children: "New Project" }),
            /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsx(Label, { htmlFor: "name", children: "Project Name *" }),
                /* @__PURE__ */ jsx(
                  Input,
                  {
                    id: "name",
                    type: "text",
                    value: name,
                    onChange: (e) => setName(e.target.value),
                    placeholder: "e.g. blog_schema, ecommerce_db",
                    autoFocus: true
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsx(Label, { htmlFor: "description", children: "Description" }),
                /* @__PURE__ */ jsx(
                  Textarea,
                  {
                    id: "description",
                    value: description,
                    onChange: (e) => setDescription(e.target.value),
                    placeholder: "Optional description...",
                    rows: 3
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex gap-3 pt-2", children: [
                /* @__PURE__ */ jsx(
                  Button,
                  {
                    type: "button",
                    onClick: onClose,
                    variant: "outline",
                    className: "flex-1",
                    children: "Cancel"
                  }
                ),
                /* @__PURE__ */ jsx(
                  Button,
                  {
                    type: "submit",
                    disabled: !name.trim() || createMutation.isPending,
                    className: "flex-1",
                    children: createMutation.isPending ? /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-2", children: [
                      /* @__PURE__ */ jsx(Spinner, { size: "sm" }),
                      "Creating..."
                    ] }) : "Create Project"
                  }
                )
              ] })
            ] })
          ]
        }
      )
    }
  );
}
function AppDashboard() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, projectId: null, projectName: "" });
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: () => getProjects()
  });
  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const { data: { user: user2 } } = await supabase.auth.getUser();
      return user2;
    }
  });
  console.log("user", user);
  const deleteMutation = useMutation({
    mutationFn: deleteProject,
    onSuccess: (_, variables) => {
      queryClient.setQueryData(["projects"], (old) => {
        if (!old) return [];
        return old.filter((p) => p.id !== variables.data.id);
      });
      setDeleteConfirm({ isOpen: false, projectId: null, projectName: "" });
      toast.success("Project deleted successfully");
    },
    onError: (error) => {
      console.error("Failed to delete project:", error);
      toast.error("Failed to delete project. Please try again.");
    }
  });
  const handleRequestDelete = (id, name) => {
    setDeleteConfirm({ isOpen: true, projectId: id, projectName: name });
  };
  const handleDelete = async () => {
    const { projectId } = deleteConfirm;
    if (!projectId) return;
    await deleteMutation.mutateAsync({ data: { id: projectId } });
  };
  if (isLoading) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center", style: { background: "var(--background)" }, children: /* @__PURE__ */ jsx(Spinner, { size: "lg" }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen", style: { background: "var(--background)" }, children: [
    /* @__PURE__ */ jsxs("header", { className: "border-b px-6 py-4 flex items-center justify-between", style: { borderColor: "var(--border)" }, children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxs(
          Link,
          {
            to: "/",
            className: "flex items-center gap-2 hover:opacity-80 transition-opacity",
            children: [
              /* @__PURE__ */ jsx("div", { className: "w-7 h-7 rounded-lg flex items-center justify-center", style: { background: "var(--primary)", color: "var(--primary-foreground)" }, children: /* @__PURE__ */ jsx("span", { className: "font-black text-xs", children: "E" }) }),
              /* @__PURE__ */ jsx("span", { className: "font-bold text-sm", style: { color: "var(--foreground)" }, children: "Ember" })
            ]
          }
        ),
        /* @__PURE__ */ jsx("span", { style: { color: "var(--muted-foreground)" }, children: "/" }),
        /* @__PURE__ */ jsx("span", { className: "text-sm font-medium", style: { color: "var(--foreground)" }, children: "Projects" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx(ThemeToggle, {}),
        /* @__PURE__ */ jsx(
          Button,
          {
            onClick: () => setShowModal(true),
            size: "sm",
            children: "+ New Project"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsx("main", { className: "max-w-6xl mx-auto px-6 py-10", children: projects.length === 0 ? (
      /* Empty state */
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center py-32 text-center", children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            className: "w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mb-6 border",
            style: {
              background: "var(--accent)",
              borderColor: "var(--border)",
              color: "var(--accent-foreground)"
            },
            children: "⬡"
          }
        ),
        /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold mb-3", style: { color: "var(--foreground)" }, children: "No projects yet" }),
        /* @__PURE__ */ jsx("p", { className: "mb-8 max-w-sm", style: { color: "var(--muted-foreground)" }, children: "Create your first project to start designing your PostgreSQL schema visually." }),
        /* @__PURE__ */ jsx(
          Button,
          {
            onClick: () => setShowModal(true),
            size: "lg",
            children: "Create First Project"
          }
        )
      ] })
    ) : /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between mb-8", children: /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-black", style: { color: "var(--foreground)" }, children: "Your Projects" }),
        /* @__PURE__ */ jsxs("p", { className: "text-sm mt-1", style: { color: "var(--muted-foreground)" }, children: [
          projects.length,
          " ",
          projects.length === 1 ? "project" : "projects"
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "grid sm:grid-cols-2 lg:grid-cols-3 gap-5", children: [
        projects.map((p) => /* @__PURE__ */ jsx(
          ProjectCard,
          {
            project: p,
            onDelete: handleRequestDelete
          },
          p.id
        )),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setShowModal(true),
            className: "flex flex-col items-center justify-center p-6 rounded-2xl border border-dashed transition-all duration-300 hover:-translate-y-1 min-h-[160px]",
            style: {
              borderColor: "var(--border)",
              color: "var(--muted-foreground)"
            },
            children: [
              /* @__PURE__ */ jsx("span", { className: "text-3xl mb-2", children: "+" }),
              /* @__PURE__ */ jsx("span", { className: "text-sm font-medium", children: "New Project" })
            ]
          }
        )
      ] })
    ] }) }),
    showModal && /* @__PURE__ */ jsx(NewProjectModal, { onClose: () => setShowModal(false), user }),
    /* @__PURE__ */ jsx(
      ConfirmModal,
      {
        isOpen: deleteConfirm.isOpen,
        onClose: () => setDeleteConfirm({ isOpen: false, projectId: null, projectName: "" }),
        onConfirm: handleDelete,
        title: "Delete Project",
        description: `Are you sure you want to delete "${deleteConfirm.projectName}"? This will permanently delete all tables, columns, and relationships. This action cannot be undone.`,
        confirmText: "Delete",
        cancelText: "Cancel",
        variant: "destructive"
      }
    )
  ] });
}
const $$splitComponentImporter = () => import("./_projectId-4qkl0_As.js");
const Route = createFileRoute("/app/$projectId")({
  loader: ({
    params
  }) => getProject({
    data: {
      id: params.projectId
    }
  }),
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const SettingsRoute = Route$5.update({
  id: "/settings",
  path: "/settings",
  getParentRoute: () => Route$6
});
const ProfileRoute = Route$4.update({
  id: "/profile",
  path: "/profile",
  getParentRoute: () => Route$6
});
const AuthRoute = Route$3.update({
  id: "/auth",
  path: "/auth",
  getParentRoute: () => Route$6
});
const IndexRoute = Route$2.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$6
});
const AppIndexRoute = Route$1.update({
  id: "/app/",
  path: "/app/",
  getParentRoute: () => Route$6
});
const AppProjectIdRoute = Route.update({
  id: "/app/$projectId",
  path: "/app/$projectId",
  getParentRoute: () => Route$6
});
const rootRouteChildren = {
  IndexRoute,
  AuthRoute,
  ProfileRoute,
  SettingsRoute,
  AppProjectIdRoute,
  AppIndexRoute
};
const routeTree = Route$6._addFileChildren(rootRouteChildren)._addFileTypes();
function createRouter() {
  const router2 = createRouter$1({
    routeTree,
    scrollRestoration: true
  });
  return router2;
}
const getRouter = createRouter;
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  createRouter,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  Button as B,
  ConfirmModal as C,
  Input as I,
  Label as L,
  Route as R,
  ThemeToggle as T,
  cn as a,
  clearSessionCookies as b,
  createSsrRpc as c,
  router as r
};
