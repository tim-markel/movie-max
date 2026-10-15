"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { logout } from "@/app/actions/auth";

type Props = {
  username: string;
  role: string;
  canManage: boolean;
};

export function UserMenu({ username, role, canManage }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on a click outside the menu, or on Escape.
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-[999px] bg-pill px-4 py-1.5 text-sm font-semibold text-black hover:opacity-90"
      >
        Settings
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden className={open ? "rotate-180" : ""}>
          <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-lg border border-white/10 bg-surface py-1 shadow-lg shadow-black/40"
        >
          <div className="border-b border-white/10 px-4 py-2.5">
            <div className="text-sm font-medium">@{username}</div>
            <div className="text-xs text-muted">{role}</div>
          </div>
          {canManage && (
            <Link
              href="/settings"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm hover:bg-white/5"
            >
              Users &amp; feature flags
            </Link>
          )}
          <form action={logout}>
            <button role="menuitem" className="block w-full px-4 py-2 text-left text-sm hover:bg-white/5">
              Log out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
