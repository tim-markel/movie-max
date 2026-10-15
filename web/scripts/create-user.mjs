// Create (or reset the password of) an account from the command line.
// Roles are set here on purpose: the super admin is never grantable in the app.
//
//   npm run user:create -- --username tim --email you@example.com --password '...' [--admin] [--super-admin]
import { parseArgs } from "node:util";
import bcrypt from "bcryptjs";
import pg from "pg";

const { values } = parseArgs({
  options: {
    username: { type: "string" },
    email: { type: "string" },
    password: { type: "string" },
    admin: { type: "boolean", default: false },
    "super-admin": { type: "boolean", default: false },
  },
});

if (!values.username || !values.email || !values.password) {
  console.error("Usage: npm run user:create -- --username <u> --email <e> --password <p> [--admin] [--super-admin]");
  process.exit(1);
}

const superAdmin = values["super-admin"];
const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

try {
  const { rows } = await client.query(
    `INSERT INTO app.users (username, email, password_hash, is_admin, is_super_admin)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (email) DO UPDATE
       SET username = EXCLUDED.username,
           password_hash = EXCLUDED.password_hash,
           is_admin = EXCLUDED.is_admin,
           is_super_admin = EXCLUDED.is_super_admin
     RETURNING username, email, is_admin, is_super_admin`,
    [
      values.username,
      values.email.trim().toLowerCase(),
      await bcrypt.hash(values.password, 12),
      values.admin || superAdmin, // super admin implies admin
      superAdmin,
    ],
  );
  console.log("Saved user:", rows[0]);
} finally {
  await client.end();
}
