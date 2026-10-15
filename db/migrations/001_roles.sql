-- 001_roles.sql :: user roles
--
-- Roles form a hierarchy: normal < admin < super_admin.
--   is_admin       : admins can manage accounts and feature flags.
--   is_super_admin : Tim only. Implies admin, can never be revoked, and is never
--                    grantable through the app (set in the DB, on purpose).
ALTER TABLE app.users
  ADD COLUMN IF NOT EXISTS is_admin       boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_super_admin boolean NOT NULL DEFAULT false;

-- Guardrail: at most one super admin can ever exist.
CREATE UNIQUE INDEX IF NOT EXISTS users_single_super_admin
  ON app.users ((is_super_admin))
  WHERE is_super_admin;
