import { requireUser } from "../auth";
import { getDb } from "../../db";
import { profiles } from "../../db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import Assessment from "./Assessment";
export const dynamic = "force-dynamic";
export default async function Page() {
  const u = await requireUser("/assessment");
  const p = await getDb()
    .select()
    .from(profiles)
    .where(eq(profiles.id, u.userId))
    .get();
  if (!p) redirect("/login");
  return <Assessment person={p.name} />;
}
