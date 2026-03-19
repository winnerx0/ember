"use client";

import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "~/components/ui/dialog";
import { supabase } from "~/lib/supabase";
import { clearSessionCookies } from "~/server/auth";
import { toast } from "sonner";
import Image from "next/image";
import type { User } from "@supabase/supabase-js";

interface SettingsModalProps {
  user: User;
  open: boolean;
  onClose: () => void;
}

export function SettingsModal({ user, open, onClose }: SettingsModalProps) {
  const [fullName, setFullName] = useState(user.user_metadata?.full_name || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFullName(user.user_metadata?.full_name || "");
  }, [user]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    await clearSessionCookies();
    window.location.href = "/";
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName.trim() },
      });
      if (error) throw error;
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <DialogContent className="max-w-2xl p-8" onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Settings</DialogTitle>
          <DialogDescription>
            Manage your account settings and preferences
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Section */}
          <div>
            <h3 className="text-sm font-bold mb-4 text-card-foreground uppercase tracking-wide">
              Profile
            </h3>
            <div className="space-y-4">
              {/* Profile Picture */}
              <div className="flex items-center gap-4">
                {user.user_metadata?.avatar_url ? (
                  <Image
                    className="rounded-full size-14 object-cover"
                    src={user.user_metadata.avatar_url}
                    width={56}
                    height={56}
                    alt="Profile"
                  />
                ) : (
                  <div className="size-14 rounded-full bg-accent flex items-center justify-center text-xl font-bold text-accent-foreground">
                    {fullName?.[0]?.toUpperCase() ||
                      user.email?.[0]?.toUpperCase() ||
                      "?"}
                  </div>
                )}
              </div>

              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="settings-full-name">Full Name</Label>
                <Input
                  id="settings-full-name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>

              {/* Email (read-only) */}
              <div className="space-y-2">
                <Label htmlFor="settings-email">Email</Label>
                <Input
                  id="settings-email"
                  type="email"
                  value={user.email || ""}
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
                  disabled={saving || fullName === user.user_metadata?.full_name}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </div>

          {/* Account Section */}
          <div className="pt-4 border-t border-border">
            <h3 className="text-sm font-bold mb-4 text-card-foreground uppercase tracking-wide">
              Account
            </h3>
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
      </DialogContent>
    </Dialog>
  );
}
