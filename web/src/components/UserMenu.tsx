"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { logout } from "@/app/actions/auth";

type Props = {
  username: string;
  role: string;
  canManage: boolean;
};

export function UserMenu({ username, role, canManage }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Account menu"
        aria-expanded={open}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-sm font-bold uppercase text-black hover:opacity-90"
      >
        {username.charAt(0)}
      </button>

      {open && (
        <>
          {/* click-away backdrop */}
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-2 w-48 overflow-hidden rounded-lg border border-white/10 bg-surface py-1 shadow-lg">
            <div className="border-b border-white/10 px-4 py-2">
              <div className="text-sm font-medium">@{username}</div>
              <div className="text-xs text-muted">{role}</div>
            </div>
            {canManage && (
              <Link
                href="/settings"
                onClick={() => setOpen(false)}
                className="block px-4 py-2 text-sm hover:bg-white/5"
              >
                Settings
              </Link>
            )}
            <form action={logout}>
              <button className="block w-full px-4 py-2 text-left text-sm hover:bg-white/5">
                Log out
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
