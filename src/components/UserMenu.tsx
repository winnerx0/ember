"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "~/components/ui/button";
import { supabase } from "~/lib/supabase";
import { clearSessionCookies } from "~/server/auth";
import type { User } from "@supabase/supabase-js";

interface UserMenuProps {
  user: User | null | undefined;
  showSettings?: boolean;
}

export function UserMenu({ user, showSettings = true }: UserMenuProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    await clearSessionCookies();
    window.location.href = "/";
  };

  if (!user) return null;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        onClick={() => setShowUserMenu(!showUserMenu)}
        className="flex items-center bg-transparent p-0 h-8 w-8"
      >
        {user.user_metadata?.avatar_url ? (
          <Image
            className="rounded-full size-8 object-cover"
            src={user.user_metadata.avatar_url}
            width={32}
            height={32}
            priority
            alt="Profile"
          />
        ) : (
          <div className="size-8 rounded-full bg-accent flex items-center justify-center text-sm font-bold text-accent-foreground">
            {user.user_metadata?.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "?"}
          </div>
        )}
      </Button>

      {showUserMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowUserMenu(false)}
          />
          <div className="absolute right-0 top-full mt-1 z-50 rounded-lg border shadow-lg overflow-hidden min-w-[160px] bg-card border-border">
            <div className="px-3 py-2 border-b text-xs border-border">
              <p className="font-medium truncate max-w-[200px] text-card-foreground">
                {user.user_metadata?.full_name || "User"}
              </p>
              <p className="truncate max-w-[200px] text-muted-foreground">
                {user.email}
              </p>
            </div>
            {showSettings && (
              <Link
                href="/app/settings"
                className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:opacity-80 transition-opacity text-left text-foreground"
                onClick={() => setShowUserMenu(false)}
              >
                <span>⚙</span>
                <span>Settings</span>
              </Link>
            )}
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:opacity-80 transition-opacity text-left text-destructive"
            >
              <span>→</span>
              <span>Sign Out</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
