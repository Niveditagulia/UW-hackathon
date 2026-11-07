import { requireUser } from "../auth";
import { identity } from "../../lib/access";
import { getDb } from "../../db";
import { profiles, calibrations } from "../../db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import GameHome from "../GameHome";
export const dynamic = "force-dynamic";
export default async function Play() {
  const u = await requireUser("/play");
  const db = getDb();
  const p = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, u.userId))
    .get();
  if (!p) redirect("/login");
  const c = await db
    .select()
    .from(calibrations)
    .where(eq(calibrations.userId, u.userId))
    .get();
  if (!c) redirect("/assessment");
  return (
    <GameHome
      person={p.name}
      staff={!!(await identity())?.isStaff}
      levels={JSON.parse(c.levels)}
    />
  );
}
