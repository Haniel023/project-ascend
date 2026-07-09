import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

// Single swap point for the later SQLite -> Supabase (Postgres) migration: only this
// file and the schema column-type declarations need to change, everything else in the
// app talks to `db` via the Drizzle relational query API / query builder.
const client = createClient({
  url: process.env.DATABASE_URL ?? "file:./drizzle-data/ascend.db",
});

export const db = drizzle(client, { schema });
