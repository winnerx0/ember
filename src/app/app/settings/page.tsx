"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "~/components/ThemeToggle";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { supabase } from "~/lib/supabase";
import { clearSessionCookies } from "~/server/auth";
import { toast } from "sonner";
import { UserMenu } from "~/components/UserMenu";
import Image from "next/image";
import type { User } from "@supabase/supabase-js";

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setFullName(user?.user_metadata?.full_name || "");
      setLoading(false);
    };
    getUser();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    await clearSessionCookies();
    router.push("/");
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: fullName.trim(),
        },
      });

      if (error) throw error;

      // Update local user state
      const {
        data: { user: updatedUser },
      } = await supabase.auth.getUser();
      setUser(updatedUser);

      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-4 rounded-full animate-spin border-border border-t-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b px-6 py-4 flex items-center justify-between border-border">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-primary text-primary-foreground">
              <span className="font-black text-xs">E</span>
            </div>
            <span className="font-bold text-sm text-foreground">Ember</span>
          </Link>
          <span className="text-muted-foreground">/</span>
          <Link
            href="/app"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Projects
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-sm font-medium text-foreground">Settings</span>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <UserMenu user={user} showSettings={false} />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-foreground mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="space-y-6">
          {/* Profile Section */}
          <div className="rounded-lg border bg-card p-6 border-border">
            <h2 className="text-lg font-bold mb-6 text-card-foreground">
              Profile
            </h2>
            <div className="space-y-6">
              {/* Profile Picture (Read-only) */}
              <div>
                <Label className="text-sm font-medium mb-3 block">
                  Profile Picture
                </Label>
                <div className="flex items-center gap-4">
                  {user?.user_metadata?.avatar_url ? (
                    <Image
                      className="rounded-full size-16 object-cover"
                      src={user.user_metadata.avatar_url}
                      width={64}
                      height={64}
                      alt="Profile"
                    />
                  ) : (
                    <div className="size-16 rounded-full bg-accent flex items-center justify-center text-2xl font-bold text-accent-foreground">
                      {fullName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "?"}
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Profile picture is managed through your authentication provider
                  </p>
                </div>
              </div>

              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="full-name">Full Name</Label>
                <Input
                  id="full-name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>

              {/* Email (read-only) */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed
                </p>
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-4 border-t border-border">
                <Button
                  onClick={handleSaveProfile}
                  disabled={saving || (fullName === user?.user_metadata?.full_name)}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </div>

          {/* Account Section */}
          <div className="rounded-lg border bg-card p-6 border-border">
            <h2 className="text-lg font-bold mb-4 text-card-foreground">
              Account
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Sign Out</Label>
                  <p className="text-sm text-muted-foreground">
                    Sign out of your account
                  </p>
                </div>
                <Button onClick={handleSignOut} variant="outline" size="sm">
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
