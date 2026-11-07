import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export function getDb() {
  if (!env.DB) {
    throw new Error(
      "Local database unavailable. Run npm run db:migrate, then npm run dev.",
    );
  }

  return drizzle(env.DB, { schema });
}
