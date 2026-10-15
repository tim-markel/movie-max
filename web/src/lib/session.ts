import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { db } from "@/lib/db";

const COOKIE = "session";
const MAX_AGE_DAYS = 30;
const key = new TextEncoder().encode(process.env.SESSION_SECRET);

export type User = {
  id: string;
  username: string;
  email: string;
  is_admin: boolean;
  is_super_admin: boolean;
};

export const USER_COLS = "id, username, email, is_admin, is_super_admin";

// Admins and the super admin can manage accounts and feature flags.
export function isManager(user: User | null): boolean {
  return Boolean(user && (user.is_admin || user.is_super_admin));
}

export function roleLabel(user: User): string {
  return user.is_super_admin ? "Super Admin" : user.is_admin ? "Admin" : "Normal";
}

export async function createSession(userId: string) {
  const expires = new Date(Date.now() + MAX_AGE_DAYS * 24 * 60 * 60 * 1000);
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expires)
    .sign(key);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires,
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE);
}

export async function getCurrentUser(): Promise<User | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify<{ userId: string }>(token, key, {
      algorithms: ["HS256"],
    });
    const { rows } = await db.query<User>(
      `SELECT ${USER_COLS} FROM app.users WHERE id = $1`,
      [payload.userId],
    );
    return rows[0] ?? null;
  } catch {
    return null;
  }
}
