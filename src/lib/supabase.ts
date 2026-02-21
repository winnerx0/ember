import { createBrowserClient } from "@supabase/ssr";
import { createServerClient } from "@supabase/ssr";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishablenKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabasePublishablenKey) {
  throw new Error(
    "Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY environment variables",
  );
}

// Client-side Supabase client (browser only) - uses cookies for SSR compatibility
export const supabase = typeof window !== 'undefined'
  ? createBrowserClient(supabaseUrl, supabasePublishablenKey)
  : null as any;

// Server-side Supabase client factory
export function createSupabaseServerClient(request: Request) {
  return createServerClient(supabaseUrl, supabasePublishablenKey, {
    cookies: {
      getAll() {
        const cookieHeader = request.headers.get('Cookie') ?? '';
        console.log('Raw cookie header:', cookieHeader);

        const cookies = cookieHeader
          .split(';')
          .map(cookie => cookie.trim())
          .filter(cookie => cookie.length > 0)
          .map(cookie => {
            const [name, ...valueParts] = cookie.split('=');
            return {
              name: name.trim(),
              value: decodeURIComponent(valueParts.join('='))
            };
          });

        console.log('Parsed cookies:', cookies.map(c => c.name));
        return cookies;
      },
      setAll(cookiesToSet) {
        // Note: In TanStack Start, we can't set response headers here
        // Cookies will be set by the browser client automatically
        console.log('Attempting to set cookies:', cookiesToSet.map(c => c.name));
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
