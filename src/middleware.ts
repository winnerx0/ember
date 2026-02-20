import { createMiddleware } from "@tanstack/react-start";
import { supabase } from "~/lib/supabase";

export const { re, getSession, redirect } = createMiddleware({
  onRequest: async ({ request, url, next, cookies }) => {
    // Public paths that don't require auth
    const publicPaths = ["/", "/auth"];
    const isPublicPath = publicPaths.includes(url.pathname) ||
                        url.pathname.startsWith("/api") ||
                        url.pathname.startsWith("/assets") ||
                        url.pathname.includes("favicon");

    if (isPublicPath) {
      return next();
    }

    // Check for session - all /app routes require authentication
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      // Store the intended URL to redirect back after login
      cookies.set("redirectTo", url.pathname, { path: "/" });
      return redirect("/auth");
    }

    return next();
  },
});