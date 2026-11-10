import { identity, sameOrigin, privateHeaders } from "../../../lib/access";
import { getSupabase } from "../../../lib/supabase";
import { calibratedLevels } from "../../../lib/game-rules";
export async function GET() {
  const u = await identity();
  if (!u) return Response.json({ error: "Sign in required" }, { status: 401 });
  const { data: c, error } = await getSupabase().from("calibrations").select("levels,completed_at").eq("user_id", u.userId).maybeSingle();
  if (error) throw error;
  return Response.json(
    c ? { levels: JSON.parse(c.levels), completedAt: c.completed_at } : null,
    { headers: privateHeaders },
  );
}
export async function POST(req: Request) {
  if (!sameOrigin(req))
    return Response.json({ error: "Invalid request" }, { status: 403 });
  const u = await identity();
  if (!u) return Response.json({ error: "Sign in required" }, { status: 401 });
  const { data: profile, error: profileError } = await getSupabase().from("profiles").select("id").eq("id", u.userId).maybeSingle();
  if (profileError) throw profileError;
  if (!profile)
    return Response.json(
      { error: "Create your profile first." },
      { status: 400 },
    );
  const b: any = await req.json().catch(() => null);
  if (!Array.isArray(b?.stages) || b.stages.length > 12)
    return Response.json({ error: "Invalid assessment" }, { status: 400 });
  try {
    const levels = calibratedLevels(b.stages);
    const data = {
      user_id: u.userId,
      levels: JSON.stringify(levels),
      stages: JSON.stringify(b.stages),
      completed_at: new Date().toISOString(),
    };
    const { error } = await getSupabase().from("calibrations").upsert(data, { onConflict: "user_id" });
    if (error) throw error;
    return Response.json({ levels }, { headers: privateHeaders });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Invalid assessment" },
      { status: 400 },
    );
  }
}
