import { createClient } from "@supabase/supabase-js";
import { createServerClient, parseCookieHeader, serializeCookieHeader } from "@supabase/ssr";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishablenKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabasePublishablenKey) {
  throw new Error(
    "Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY environment variables",
  );
}

// Client-side Supabase client (browser only)
export const supabase = createClient(supabaseUrl, supabasePublishablenKey, {
  auth: {
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
});

// Server-side Supabase client factory
export function createSupabaseServerClient(request: Request) {
  const headers = new Headers();
  const cookies = parseCookieHeader(request.headers.get('Cookie') ?? '');

  return createServerClient(supabaseUrl, supabasePublishablenKey, {
    cookies: {
      getAll() {
        return cookies;
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          headers.append('Set-Cookie', serializeCookieHeader(name, value, options));
        });
      },
    },
  });
}

// Helper to clear OAuth hash from URL (call this after auth)
export const clearAuthHash = () => {
  if (typeof window !== "undefined" && window.location.hash) {
    // Clear the hash without triggering a page reload
    window.history.replaceState(null, "", window.location.pathname);
  }
};