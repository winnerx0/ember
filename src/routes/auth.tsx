import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "~/lib/supabase";
import { ThemeToggle } from "~/components/ThemeToggle";
import { Spinner } from "~/components/ui/spinner";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

export default function AuthPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check for existing session and handle OAuth callback
    const checkSession = async () => {
      // Check if there's a hash in the URL (OAuth callback)
      if (window.location.hash.includes("access_token")) {
        // Let Supabase process the hash first
        const { data: { session }, error } = await supabase.auth.getSession();

        if (session && !error) {
          setUser(session.user);
          // Clear the hash without triggering a page reload
          window.history.replaceState(null, "", "/auth");
        }
      } else {
        // Check for existing session
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setUser(session.user);
        }
      }

      setLoading(false);
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/app",
      },
    });

    if (error) {
      console.error("Error signing in:", error.message);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--background)" }}>
        <Spinner size="lg" />
      </div>
    );
  }

  // If user is already signed in, show the app directly
  if (user) {
    return (
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
        <main className="flex-1 flex flex-col items-center justify-center px-4">
          <div
            className="w-full max-w-sm rounded-2xl border p-8 text-center"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}
          >
            {/* User info */}
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4"
              style={{
                background: "var(--primary)",
                color: "var(--primary-foreground)",
              }}
            >
              {user.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt="Profile"
                  className="w-20 h-20 rounded-full"
                />
              ) : (
                user.email?.[0]?.toUpperCase() || "?"
              )}
            </div>

            <h1 className="text-xl font-bold mb-2">
              Welcome, {user.user_metadata?.full_name || "User"}!
            </h1>
            <p className="text-sm mb-6" style={{ color: "var(--muted-foreground)" }}>
              {user.email}
            </p>

            <Link
              to="/app"
              className="block w-full py-3 rounded-xl font-medium transition-all hover:opacity-90 mb-3"
              style={{
                background: "var(--primary)",
                color: "var(--primary-foreground)",
              }}
            >
              Go to App →
            </Link>

            <button
              onClick={handleSignOut}
              className="w-full py-3 rounded-xl font-medium transition-all hover:opacity-80"
              style={{ borderColor: "var(--border)", border: "1px solid", color: "var(--foreground)" }}
            >
              Sign Out
            </button>
          </div>
        </main>

        {/* Footer */}
        <footer className="py-4 text-center text-xs" style={{ color: "var(--muted-foreground)" }}>
          <Link to="/" className="hover:opacity-80">
            ← Back to home
          </Link>
        </footer>
      </div>
    );
  }

  // Show sign in page
  return (
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
        <div
          className="w-full max-w-sm rounded-2xl border p-8 text-center"
          style={{ background: "var(--card)", borderColor: "var(--border)" }}
        >
          {/* Logo */}
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6"
            style={{ background: "var(--accent)", borderColor: "var(--border)" }}
          >
            <span style={{ color: "var(--primary)" }}>E</span>
          </div>

          <h1 className="text-2xl font-bold mb-2">Welcome to Ember</h1>
          <p className="text-sm mb-8" style={{ color: "var(--muted-foreground)" }}>
            Sign in to save and manage your ERD projects
          </p>

          {/* Google Sign In */}
          <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl font-medium transition-all hover:opacity-90 border mb-4"
            style={{
              background: "var(--primary)",
              borderColor: "var(--primary)",
              color: "var(--primary-foreground)",
            }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign in with Google
          </button>

          <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
            Authentication required to access the app
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs" style={{ color: "var(--muted-foreground)" }}>
        <Link to="/" className="hover:opacity-80">
          ← Back to home
        </Link>
      </footer>
    </div>
  );
}