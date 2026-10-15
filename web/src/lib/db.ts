import "server-only";
import { Pool } from "pg";

// Reuse one pool across hot reloads in dev.
const globalForDb = globalThis as unknown as { pool?: Pool };

export const db =
  globalForDb.pool ?? new Pool({ connectionString: process.env.DATABASE_URL });

if (process.env.NODE_ENV !== "production") globalForDb.pool = db;
