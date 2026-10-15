import { redirect } from "next/navigation";
import { setAdmin } from "@/app/actions/users";
import { db } from "@/lib/db";
import { USER_COLS, getCurrentUser, isManager, roleLabel, type User } from "@/lib/session";

function RoleBadge({ user }: { user: User }) {
  const cls = user.is_super_admin
    ? "bg-accent text-black"
    : user.is_admin
      ? "bg-accent/20 text-accent"
      : "bg-white/10 text-muted";
  return <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}>{roleLabel(user)}</span>;
}

function Switch({ on, disabled }: { on: boolean; disabled?: boolean }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      disabled={disabled}
      className={`relative h-6 w-11 rounded-full transition disabled:opacity-50 ${on ? "bg-accent" : "bg-white/20"}`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? "left-[22px]" : "left-0.5"}`}
      />
    </button>
  );
}

export default async function SettingsPage() {
  const viewer = await getCurrentUser();
  if (!viewer) redirect("/login");

  if (!isManager(viewer)) {
    return (
      <section>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="mt-4 text-muted">Only admins can manage accounts.</p>
      </section>
    );
  }

  const { rows: users } = await db.query<User>(
    `SELECT ${USER_COLS} FROM app.users ORDER BY is_super_admin DESC, is_admin DESC, username`,
  );

  return (
    <section>
      <h1 className="text-2xl font-bold">Settings</h1>
      <h2 className="mt-6 text-sm font-semibold uppercase tracking-wide text-muted">Users</h2>
      <ul className="mt-3 space-y-3">
        {users.map((u) => (
          <li key={u.id} className="rounded-lg bg-surface p-4">
            <div className="flex items-center gap-3">
              <span className="font-medium">@{u.username}</span>
              <RoleBadge user={u} />
              {u.id === viewer.id && <span className="text-xs text-muted">(you)</span>}
            </div>
            <div className="mt-3 border-t border-white/10 pt-3">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                Feature flags
              </div>
              <form action={setAdmin} className="flex max-w-xs items-center justify-between">
                <input type="hidden" name="userId" value={u.id} />
                <input type="hidden" name="value" value={String(!u.is_admin)} />
                <span className="text-sm">
                  Admin
                  {u.is_super_admin && <span className="ml-2 text-xs text-muted">(super admin, locked)</span>}
                </span>
                <Switch on={u.is_admin || u.is_super_admin} disabled={u.is_super_admin} />
              </form>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
