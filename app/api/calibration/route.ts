import { identity, sameOrigin, privateHeaders } from "../../../lib/access";
import { getDb } from "../../../db";
import { calibrations, profiles } from "../../../db/schema";
import { eq } from "drizzle-orm";
import { calibratedLevels } from "../../../lib/game-rules";
export async function GET() {
  const u = await identity();
  if (!u) return Response.json({ error: "Sign in required" }, { status: 401 });
  const c = await getDb()
    .select()
    .from(calibrations)
    .where(eq(calibrations.userId, u.userId))
    .get();
  return Response.json(
    c ? { levels: JSON.parse(c.levels), completedAt: c.completedAt } : null,
    { headers: privateHeaders },
  );
}
export async function POST(req: Request) {
  if (!sameOrigin(req))
    return Response.json({ error: "Invalid request" }, { status: 403 });
  const u = await identity();
  if (!u) return Response.json({ error: "Sign in required" }, { status: 401 });
  const profile = await getDb()
    .select()
    .from(profiles)
    .where(eq(profiles.id, u.userId))
    .get();
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
      userId: u.userId,
      levels: JSON.stringify(levels),
      stages: JSON.stringify(b.stages),
      completedAt: new Date().toISOString(),
    };
    await getDb()
      .insert(calibrations)
      .values(data)
      .onConflictDoUpdate({ target: calibrations.userId, set: data });
    return Response.json({ levels }, { headers: privateHeaders });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Invalid assessment" },
      { status: 400 },
    );
  }
}
