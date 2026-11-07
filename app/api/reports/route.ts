import { staffAuthenticated } from "../../../lib/staff-auth";
import { identity, privateHeaders } from "../../../lib/access";
import { getDb } from "../../../db";
import { profiles, sessions } from "../../../db/schema";
import { eq, asc } from "drizzle-orm";
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
    return Response.json(
      await getDb()
        .select({
          id: profiles.id,
          name: profiles.name,
          age: profiles.age,
          gender: profiles.gender,
          createdAt: profiles.createdAt,
        })
        .from(profiles),
      { headers: privateHeaders },
    );
  }
  const id = requested || u.userId;
  const profile = await getDb()
    .select({ name: profiles.name, age: profiles.age, gender: profiles.gender })
    .from(profiles)
    .where(eq(profiles.id, id))
    .get();
  const records = await getDb()
    .select()
    .from(sessions)
    .where(eq(sessions.userId, id))
    .orderBy(asc(sessions.date));
  return Response.json(
    { profile, sessions: records },
    { headers: privateHeaders },
  );
}
