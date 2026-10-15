"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { createSession, deleteSession } from "@/lib/session";

export type AuthState = { error?: string } | undefined;

export async function signup(_: AuthState, formData: FormData): Promise<AuthState> {
  const username = String(formData.get("username") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!/^[A-Za-z0-9_]{3,30}$/.test(username)) {
    return { error: "Username must be 3–30 letters, numbers, or underscores." };
  }
  if (!email.includes("@")) return { error: "Enter a valid email." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };

  let userId: string;
  try {
    const { rows } = await db.query<{ id: string }>(
      `INSERT INTO app.users (username, email, password_hash)
       VALUES ($1, $2, $3) RETURNING id`,
      [username, email, await bcrypt.hash(password, 12)],
    );
    userId = rows[0].id;
  } catch (err) {
    if ((err as { code?: string }).code === "23505") {
      return { error: "That username or email is already taken." };
    }
    throw err;
  }

  await createSession(userId);
  redirect("/");
}

export async function login(_: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  const { rows } = await db.query<{ id: string; password_hash: string }>(
    "SELECT id, password_hash FROM app.users WHERE email = $1",
    [email],
  );
  const user = rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return { error: "Wrong email or password." };
  }

  await createSession(user.id);
  redirect("/");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
