import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "~/lib/supabase";
import { ThemeToggle } from "~/components/ThemeToggle";
import { Spinner } from "~/components/ui/spinner";
import { FcGoogle } from "react-icons/fc";

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
        // Exchange the hash for a session
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (session && !error) {
          setUser(session.user);

          // Clear the hash and redirect to app
          window.history.replaceState(null, "", "/app");
          window.location.href = "/app";
          return;
        }
      } else {
        // Check for existing session
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) {
          setUser(session.user);
        }
      }

      setLoading(false);
    };

    checkSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${import.meta.env.VITE_PUBLIC_APP_URL}/app`,
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
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--background)" }}
      >
        <Spinner size="lg" />
      </div>
    );
  }

  // If user is already signed in, show the app directly
  if (user) {
    return (
      <div
        className="min-h-screen flex flex-col"
        style={{ background: "var(--background)", color: "var(--foreground)" }}
      >
        {/* Header */}
        <header
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: "var(--border)" }}
        >
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center">
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
            <p
              className="text-sm mb-6"
              style={{ color: "var(--muted-foreground)" }}
            >
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
              style={{
                borderColor: "var(--border)",
                border: "1px solid",
                color: "var(--foreground)",
              }}
            >
              Sign Out
            </button>
          </div>
        </main>

        {/* Footer */}
        <footer
          className="py-4 text-center text-xs"
          style={{ color: "var(--muted-foreground)" }}
        >
          <Link to="/" className="hover:opacity-80">
            ← Back to home
          </Link>
        </footer>
      </div>
    );
  }

  // Show sign in page
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--background)", color: "var(--foreground)" }}
    >
      {/* Header */}
      <header
        className="flex items-center justify-between px-6 py-4 border-b"
        style={{ borderColor: "var(--border)" }}
      >
        <Link to="/" className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background: "var(--primary)",
              color: "var(--primary-foreground)",
            }}
          >
            <span className="font-black text-sm">E</span>
          </div>
          <span className="font-bold text-lg">Ember</span>
        </Link>
        <ThemeToggle />
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-2xl p-8 text-center">
          {/* Logo */}
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6"
            style={{
              background: "var(--accent)",
              borderColor: "var(--border)",
            }}
          >
            <span style={{ color: "var(--primary)" }}>E</span>
          </div>

          <h1 className="text-2xl font-bold mb-2">Welcome to Ember</h1>
          <p
            className="text-sm mb-8"
            style={{ color: "var(--muted-foreground)" }}
          >
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
            <FcGoogle size={20} />
            Sign in with Google
          </button>
        </div>
      </main>
    </div>
  );
}
