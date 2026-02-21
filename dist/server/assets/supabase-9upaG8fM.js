import { createClient } from "@supabase/supabase-js";
import { parseCookieHeader, createServerClient, serializeCookieHeader } from "@supabase/ssr";
const supabaseUrl = "https://gpaichxrdxniigtcxkqk.supabase.co";
const supabasePublishablenKey = "sb_publishable_9Ouyp38MmhOKnfQbYtG0Nw_74ASJU4P";
const supabase = createClient(supabaseUrl, supabasePublishablenKey, {
  auth: {
    persistSession: true,
    detectSessionInUrl: true,
    flowType: "pkce",
    storage: typeof window !== "undefined" ? window.localStorage : void 0
  }
});
function createSupabaseServerClient(request) {
  const headers = new Headers();
  const cookies = parseCookieHeader(request.headers.get("Cookie") ?? "");
  return createServerClient(supabaseUrl, supabasePublishablenKey, {
    cookies: {
      getAll() {
        return cookies;
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          headers.append("Set-Cookie", serializeCookieHeader(name, value, options));
        });
      }
    }
  });
}
export {
  createSupabaseServerClient as c,
  supabase as s
};
