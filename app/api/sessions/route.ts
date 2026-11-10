import { identity, sameOrigin, privateHeaders } from "../../../lib/access";
import { getSupabase } from "../../../lib/supabase";
export async function GET() {
  const u = await identity();
  if (!u) return Response.json({ error: "Sign in required" }, { status: 401 });
  const { data, error } = await getSupabase()
    .from("sessions")
    .select("*")
    .eq("user_id", u.userId)
    .order("date");
  if (error) throw error;
  return Response.json(data || [], { headers: privateHeaders });
}
export async function POST(req: Request) {
  if (!sameOrigin(req))
    return Response.json({ error: "Invalid request" }, { status: 403 });
  const u = await identity();
  if (!u) return Response.json({ error: "Sign in required" }, { status: 401 });
  const b: any = await req.json().catch(() => null);
  if (
    !b ||
    typeof b.id !== "string" ||
    !/^[-a-zA-Z0-9]{20,60}$/.test(b.id) ||
    !Number.isInteger(b.game) ||
    b.game < 4 ||
    b.game > 7 ||
    b.rounds !== 8 ||
    !Number.isInteger(b.correct) ||
    b.correct < 0 ||
    b.correct > 8 ||
    !Number.isInteger(b.level) ||
    b.level < 1 ||
    b.level > 3 ||
    !Number.isInteger(b.speed) ||
    b.speed < 0 ||
    b.speed > 3600000
  )
    return Response.json({ error: "Invalid session" }, { status: 400 });
  const { data: c, error: calibrationError } = await getSupabase().from("calibrations").select("levels").eq("user_id", u.userId).maybeSingle();
  if (calibrationError) throw calibrationError;
  if (!c)
    return Response.json(
      { error: "Complete the starting-level assessment first." },
      { status: 409 },
    );
  if (JSON.parse(c.levels)[b.game] !== b.level)
    return Response.json(
      { error: "Your level changed. Reload before starting another game." },
      { status: 409 },
    );
  const { error: insertError } = await getSupabase()
    .from("sessions")
    .upsert({
      id: u.userId + ":" + b.id,
      user_id: u.userId,
      date: new Date().toISOString(),
      game: b.game,
      accuracy: Math.round((b.correct / 8) * 100),
      speed: b.speed,
      level: b.level,
    }, { onConflict: "id", ignoreDuplicates: true });
  if (insertError) throw insertError;
  return Response.json({ ok: true }, { headers: privateHeaders });
}
