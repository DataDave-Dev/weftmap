import "server-only";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

const url = process.env.TURSO_DATABASE_URL;
// `next build` imports route modules to collect data; allow it to run without a
// real database. At runtime the URL is still required.
const isBuild = process.env.NEXT_PHASE === "phase-production-build";
if (!url && !isBuild) {
  throw new Error("TURSO_DATABASE_URL is not set");
}

const client = createClient({
  url: url ?? "file::memory:",
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export const db = drizzle(client, { schema });
