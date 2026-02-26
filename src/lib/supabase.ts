import { createBrowserClient } from "@supabase/ssr";
import { createServerClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY environment variables",
  );
}

export const supabase = createBrowserClient(supabaseUrl, supabasePublishableKey);

export function createSupabaseServerClient(request: Request) {
  return createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        const cookieHeader = request.headers.get('Cookie') ?? '';

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
