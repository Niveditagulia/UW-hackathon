import { languageCodes } from "../../../lib/languages";
import { identity, sameOrigin, privateHeaders } from "../../../lib/access";
import { getDb } from "../../../db";
import { profiles } from "../../../db/schema";
import { eq } from "drizzle-orm";
export async function GET() {
  const user = await identity();
  if (!user)
    return Response.json(
      { error: "Sign in required" },
      { status: 401, headers: privateHeaders },
    );
  const profile = await getDb()
    .select()
    .from(profiles)
    .where(eq(profiles.id, user.userId))
    .get();
  return Response.json(
    {
      user: {
        name: user.displayName,
        email: user.email,
        isStaff: user.isStaff,
      },
      profile: profile
        ? {
            ...profile,
            passport: profile.passport
              ? "••••" + profile.passport.slice(-4)
              : null,
          }
        : null,
    },
    { headers: privateHeaders },
  );
}
export async function POST(request: Request) {
  if (!sameOrigin(request))
    return Response.json({ error: "Invalid request" }, { status: 403 });
  const user = await identity();
  if (!user)
    return Response.json({ error: "Sign in required" }, { status: 401 });
  const b: any = await request.json().catch(() => null);
  if (!b || typeof b !== "object")
    return Response.json({ error: "Invalid request" }, { status: 400 });
  if (
    typeof b.name !== "string" ||
    !b.name.trim() ||
    b.name.length > 100 ||
    !Number.isInteger(b.age) ||
    b.age < 18 ||
    b.age > 120 ||
    ![
      "Woman",
      "Man",
      "Non-binary",
      "Self-described",
      "Prefer not to say",
    ].includes(b.gender) ||
    !["email", "phone", "passport"].includes(b.contactType) ||
    typeof b.contact !== "string" ||
    b.contact.length > 150 ||
    !b.contact.trim()
  )
    return Response.json(
      { error: "Please check your profile details." },
      { status: 400 },
    );
  if (
    b.contactType === "email" &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.contact)
  )
    return Response.json(
      { error: "Enter a valid email address." },
      { status: 400 },
    );
  if (b.contactType === "phone" && !/^[+\d\s().-]{7,25}$/.test(b.contact))
    return Response.json(
      { error: "Enter a valid phone number." },
      { status: 400 },
    );
  const existing =
    b.contactType === "passport"
      ? await getDb()
          .select()
          .from(profiles)
          .where(eq(profiles.id, user.userId))
          .get()
      : null;
  if (
    b.contactType === "passport" &&
    b.contact !== existing?.contact &&
    !/^[A-Za-z0-9 -]{5,25}$/.test(b.contact)
  )
    return Response.json(
      { error: "Enter a valid passport number." },
      { status: 400 },
    );
  const data = {
    id: user.userId,
    name: b.name.trim(),
    age: b.age,
    gender: b.gender,
    language: languageCodes.includes(b.language) ? b.language : "en",
    contactType: b.contactType,
    contact:
      b.contactType === "passport"
        ? "••••" + b.contact.slice(-4)
        : b.contact.trim(),
    passport: null,
    createdAt: new Date().toISOString(),
  };
  await getDb()
    .insert(profiles)
    .values(data)
    .onConflictDoUpdate({
      target: profiles.id,
      set: {
        name: data.name,
        age: data.age,
        gender: data.gender,
        language: data.language,
        contactType: data.contactType,
        contact: data.contact,
      },
    });
  return Response.json({ ok: true }, { headers: privateHeaders });
}
