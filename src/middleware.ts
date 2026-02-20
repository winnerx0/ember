import { createMiddleware } from "@tanstack/react-start";
import { redirect } from "@tanstack/react-router";
import { createSupabaseServerClient } from "~/lib/supabase";

const publicPaths = ["/", "/auth"];

function isPublicPath(pathname: string): boolean {
  return (
    publicPaths.includes(pathname) ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/assets") ||
    pathname.includes("favicon")
  );
}

export const authMiddleware = createMiddleware().server(async ({ next, request }) => {
  const { pathname } = new URL(request.url);

  if (isPublicPath(pathname)) {
    return next();
  }

  // Create server-side Supabase client with cookie handling
  const supabase = createSupabaseServerClient(request);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw redirect({
      to: "/auth",
      search: { redirectTo: pathname },
    });
  }

  return next();
});