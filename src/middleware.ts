import { createMiddleware } from "@tanstack/react-start";
import { supabase } from "~/lib/supabase";

export const { onRequest, getSession, redirect } = createMiddleware({
  onRequest: async ({ request, url, next, cookies }) => {
    // Public paths that don't require auth
    const publicPaths = ["/", "/auth", "/favicon.ico", "/assets"];
    const isPublicPath = publicPaths.some((path) => url.pathname === path || url.pathname.startsWith("/api"));

    if (isPublicPath) {
      return next();
    }

    // Check for session
    const { data: { session } } = await supabase.auth.getSession();

    if (!session && !isPublicPath) {
      // Store the intended URL to redirect back after login
      cookies.set("redirectTo", url.pathname, { path: "/" });
      return redirect("/auth");
    }

    return next();
  },
});