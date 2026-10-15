"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { AuthState } from "@/app/actions/auth";

type Props = {
  mode: "login" | "signup";
  action: (state: AuthState, formData: FormData) => Promise<AuthState>;
};

export function AuthForm({ mode, action }: Props) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const isSignup = mode === "signup";

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-6 text-2xl font-bold">{isSignup ? "Create an account" : "Log in"}</h1>
      <form action={formAction} className="space-y-4">
        {isSignup && (
          <label className="block space-y-1">
            <span className="text-sm text-muted">Username</span>
            <input name="username" required className="input" autoComplete="username" />
          </label>
        )}
        <label className="block space-y-1">
          <span className="text-sm text-muted">Email</span>
          <input name="email" type="email" required className="input" autoComplete="email" />
        </label>
        <label className="block space-y-1">
          <span className="text-sm text-muted">Password</span>
          <input
            name="password"
            type="password"
            required
            className="input"
            autoComplete={isSignup ? "new-password" : "current-password"}
          />
        </label>
        {state?.error && <p className="text-sm text-red-400">{state.error}</p>}
        <button disabled={pending} className="btn w-full py-2">
          {pending ? "…" : isSignup ? "Sign up" : "Log in"}
        </button>
      </form>
      <p className="mt-6 text-sm text-muted">
        {isSignup ? "Already have an account? " : "New here? "}
        <Link href={isSignup ? "/login" : "/signup"} className="text-accent hover:underline">
          {isSignup ? "Log in" : "Sign up"}
        </Link>
      </p>
    </div>
  );
}
