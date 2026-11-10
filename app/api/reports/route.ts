import { staffAuthenticated } from "../../../lib/staff-auth";
import { identity, privateHeaders } from "../../../lib/access";
import { getSupabase } from "../../../lib/supabase";
export async function GET(req: Request) {
  const u = await identity();
  if (!u) return Response.json({ error: "Sign in required" }, { status: 401 });
  const staffOk = u.isStaff && (await staffAuthenticated());
  const requested = new URL(req.url).searchParams.get("resident");
  if (requested && requested !== u.userId && !staffOk)
    return Response.json({ error: "Staff access required" }, { status: 403 });
  if (new URL(req.url).searchParams.has("all")) {
    if (!staffOk)
      return Response.json({ error: "Staff access required" }, { status: 403 });
    const { data, error } = await getSupabase().from("profiles").select("id,name,age,gender,created_at");
    if (error) throw error;
    return Response.json(
      (data || []).map((person: any) => ({
        ...person,
        createdAt: person.created_at,
      })),
      { headers: privateHeaders },
    );
  }
  const id = requested || u.userId;
  const db = getSupabase();
  const { data: profile, error: profileError } = await db.from("profiles").select("name,age,gender").eq("id", id).maybeSingle();
  if (profileError) throw profileError;
  const { data: records, error: recordError } = await db.from("sessions").select("*").eq("user_id", id).order("date");
  if (recordError) throw recordError;
  return Response.json(
    { profile, sessions: records || [] },
    { headers: privateHeaders },
  );
}
