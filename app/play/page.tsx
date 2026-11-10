import { requireUser } from "../auth";
import { identity } from "../../lib/access";
import { getSupabase } from "../../lib/supabase";
import { redirect } from "next/navigation";
import GameHome from "../GameHome";
export const dynamic = "force-dynamic";
export default async function Play() {
  const u = await requireUser("/play");
  const db = getSupabase();
  const { data: p, error: profileError } = await db
    .from("profiles")
    .select("name")
    .eq("id", u.userId)
    .maybeSingle();
  if (profileError) throw profileError;
  if (!p) redirect("/login");
  const { data: c, error: calibrationError } = await db
    .from("calibrations")
    .select("levels")
    .eq("user_id", u.userId)
    .maybeSingle();
  if (calibrationError) throw calibrationError;
  if (!c) redirect("/assessment");
  return (
    <GameHome
      person={p.name}
      staff={!!(await identity())?.isStaff}
      levels={JSON.parse(c.levels)}
    />
  );
}
