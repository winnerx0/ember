import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "~/lib/supabase";
import { ThemeToggle } from "~/components/ThemeToggle";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    getUser();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--background)" }}>
        <div className="text-sm" style={{ color: "var(--muted-foreground)" }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--background)", color: "var(--foreground)" }}>
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 border-b backdrop-blur-xl" style={{ background: "var(--background)/80", borderColor: "var(--border)" }}>
        <div className="flex items-center gap-3">
          <Link
            to="/app"
            className="flex items-center gap-2 text-sm hover:opacity-80 transition-opacity"
            style={{ color: "var(--muted-foreground)" }}
          >
            <span>←</span>
            <span>Back to App</span>
          </Link>
        </div>
        <ThemeToggle />
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8">Settings</h1>

        {/* Profile Section */}
        <section className="mb-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: "var(--muted-foreground)" }}>
            Profile
          </h2>
          <div
            className="rounded-xl border p-6"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}
          >
            <div className="flex items-center gap-4">
              {user?.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt="Profile"
                  className="w-16 h-16 rounded-full"
                />
              ) : (
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold"
                  style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
                >
                  {user?.email?.[0]?.toUpperCase() || "?"}
                </div>
              )}
              <div>
                <p className="font-semibold">{user?.user_metadata?.full_name || "User"}</p>
                <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>{user?.email}</p>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t" style={{ borderColor: "var(--border)" }}>
              <Link
                to="/profile"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80"
                style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
              >
                Edit Profile
              </Link>
            </div>
          </div>
        </section>

        {/* Account Section */}
        <section className="mb-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: "var(--muted-foreground)" }}>
            Account
          </h2>
          <div
            className="rounded-xl border overflow-hidden"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}
          >
            <div className="px-6 py-4 border-b" style={{ borderColor: "var(--border)" }}>
              <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                Signed in with {user?.app_metadata?.provider || "email"}
              </p>
            </div>
            <div className="p-6">
              <button
                onClick={handleSignOut}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80"
                style={{ background: "var(--destructive)", color: "var(--destructive-foreground)" }}
              >
                Sign Out
              </button>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: "var(--muted-foreground)" }}>
            About
          </h2>
          <div
            className="rounded-xl border p-6"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center font-bold"
                style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
              >
                E
              </div>
              <div>
                <p className="font-semibold">Ember</p>
                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Visual PostgreSQL ERD Designer</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
              Design your database visually. Create tables, define relationships, and export production-ready SQL.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}