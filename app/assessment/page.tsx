import { requireUser } from "../auth";
import { getSupabase } from "../../lib/supabase";
import { redirect } from "next/navigation";
import Assessment from "./Assessment";
export const dynamic = "force-dynamic";
export default async function Page() {
  const u = await requireUser("/assessment");
  const { data: p, error } = await getSupabase()
    .from("profiles")
    .select("name")
    .eq("id", u.userId)
    .maybeSingle();
  if (error) throw error;
  if (!p) redirect("/login");
  return <Assessment person={p.name} />;
}
