"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getCurrentUser, isManager } from "@/lib/session";

// Feature flag: grant or revoke admin. Only admins may do this (prevents
// self-escalation), and the super admin can never be demoted.
export async function setAdmin(formData: FormData) {
  const actor = await getCurrentUser();
  if (!isManager(actor)) throw new Error("Admin only");

  const userId = String(formData.get("userId"));
  const value = formData.get("value") === "true";

  await db.query(
    "UPDATE app.users SET is_admin = $2 WHERE id = $1 AND NOT is_super_admin",
    [userId, value],
  );
  revalidatePath("/settings");
}
