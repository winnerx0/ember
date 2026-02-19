import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "~/lib/supabase";
import { ThemeToggle } from "~/components/ThemeToggle";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
});

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setFullName(user?.user_metadata?.full_name || "");
      setLoading(false);
    };
    getUser();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName },
      });
      if (error) {
        console.error("Error updating profile:", error.message);
      }
    } finally {
      setSaving(false);
    }
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
            to="/settings"
            className="flex items-center gap-2 text-sm hover:opacity-80 transition-opacity"
            style={{ color: "var(--muted-foreground)" }}
          >
            <span>←</span>
            <span>Back to Settings</span>
          </Link>
        </div>
        <ThemeToggle />
      </header>

      <main className="max-w-xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8">Edit Profile</h1>

        {/* Profile Form */}
        <div
          className="rounded-xl border p-6 space-y-6"
          style={{ background: "var(--card)", borderColor: "var(--border)" }}
        >
          {/* Avatar */}
          <div className="flex items-center gap-4">
            {user?.user_metadata?.avatar_url ? (
              <img
                src={user.user_metadata.avatar_url}
                alt="Profile"
                className="w-20 h-20 rounded-full"
              />
            ) : (
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold"
                style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
              >
                {user?.email?.[0]?.toUpperCase() || "?"}
              </div>
            )}
            <div>
              <p className="font-semibold text-lg">{user?.user_metadata?.full_name || "User"}</p>
              <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>{user?.email}</p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border text-sm"
                style={{
                  background: "var(--input)",
                  borderColor: "var(--border)",
                  color: "var(--foreground)"
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className="w-full px-4 py-2 rounded-lg border text-sm opacity-60"
                style={{
                  background: "var(--input)",
                  borderColor: "var(--border)",
                  color: "var(--foreground)"
                }}
              />
              <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
                Email cannot be changed
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 rounded-lg font-medium transition-all hover:opacity-80 disabled:opacity-50"
              style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <Link
              to="/settings"
              className="px-6 py-2 rounded-lg font-medium transition-all hover:opacity-80"
              style={{ borderColor: "var(--border)", border: "1px solid", color: "var(--foreground)" }}
            >
              Cancel
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}