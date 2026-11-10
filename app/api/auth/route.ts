import { getSupabase } from "../../../lib/supabase";
import { sameOrigin, privateHeaders } from "../../../lib/access";
import {
  digest,
  passwordHash,
  hex,
  equal,
  sessionCookie,
} from "../../../lib/local-session";
import { cookies } from "next/headers";
export async function POST(req: Request) {
  const db = getSupabase();
  if (!sameOrigin(req))
    return Response.json({ error: "Invalid request." }, { status: 403 });
  const b: any = await req.json().catch(() => null);
  if (!b || !["login", "register", "logout"].includes(b.action))
    return Response.json({ error: "Invalid request." }, { status: 400 });
  const secure = new URL(req.url).protocol === "https:" ? "; Secure" : "";
  if (b.action === "logout") {
    const token = (await cookies()).get(sessionCookie)?.value;
    if (token)
      await db
        .from("local_sessions")
        .delete()
        .eq("token_hash", await digest(token));
    return Response.json(
      { ok: true },
      {
        headers: {
          ...privateHeaders,
          "Set-Cookie": `${sessionCookie}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`,
        },
      },
    );
  }
  if (
    typeof b.username !== "string" ||
    !/^[a-zA-Z0-9_.-]{3,40}$/.test(b.username) ||
    typeof b.password !== "string" ||
    b.password.length < 12 ||
    b.password.length > 128
  )
    return Response.json(
      {
        error:
          "Use a 3–40 character username and a password of 12–128 characters.",
      },
      { status: 400 },
    );
  const username = b.username.toLowerCase();
  const accountResult = await db
    .from("local_accounts")
    .select("*")
    .eq("username", username)
    .maybeSingle();
  if (accountResult.error) throw accountResult.error;
  let row = accountResult.data;
  if (b.action === "register") {
    if (row)
      return Response.json(
        { error: "That username is already registered." },
        { status: 409 },
      );
    const role = b.role === "staff" ? "staff" : "resident";
    const code = process.env.STAFF_REGISTRATION_CODE;
    if (
      role === "staff" &&
      (!code || typeof b.code !== "string" || !equal(b.code, code))
    )
      return Response.json(
        { error: "Enter the staff setup code provided by your administrator." },
        { status: 403 },
      );
    const salt = hex(crypto.getRandomValues(new Uint8Array(32))),
      id = crypto.randomUUID();
    const hash = await passwordHash(b.password, salt);
    const { error } = await db.from("local_accounts").insert({
      id,
      username,
      email: username + "@local.grove",
      role,
      salt,
      password_hash: hash,
    });
    if (error) {
      return Response.json(
        { error: "That username is already registered." },
        { status: 409 },
      );
    }
    row = { id, role };
  } else {
    if (!row)
      return Response.json(
        { error: "Username or password is incorrect." },
        { status: 401 },
      );
    const now = Date.now();
    if (row.window_start < now - 900000) {
      row = { ...row, attempts: 0, window_start: now };
      const { error } = await db
        .from("local_accounts")
        .update({ attempts: 0, window_start: now })
        .eq("id", row.id);
      if (error) throw error;
    }
    if (row.attempts >= 5)
      return Response.json(
        { error: "Too many attempts. Try again in 15 minutes." },
        { status: 429 },
      );
    await db
      .from("local_accounts")
      .update({ attempts: row.attempts + 1 })
      .eq("id", row.id);
    if (!equal(await passwordHash(b.password, row.salt), row.password_hash))
      return Response.json(
        { error: "Username or password is incorrect." },
        { status: 401 },
      );
    if (b.role === "staff" && row.role !== "staff")
      return Response.json(
        { error: "This is a resident account. Use resident sign-in." },
        { status: 403 },
      );
  }
  const token = hex(crypto.getRandomValues(new Uint8Array(32))),
    duration = b.remember === true ? 2592000 : 28800;
  const now = Date.now();
  const { error: resetError } = await db
    .from("local_accounts")
    .update({ attempts: 0, window_start: now })
    .eq("id", row.id);
  if (resetError) throw resetError;
  await db.from("local_sessions").delete().lte("expires_at", now);
  const { error: sessionError } = await db.from("local_sessions").insert({
    token_hash: await digest(token),
    user_id: row.id,
    expires_at: now + duration * 1000,
  });
  if (sessionError) throw sessionError;
  return Response.json(
    { ok: true, role: row.role },
    {
      headers: {
        ...privateHeaders,
        "Set-Cookie": `${sessionCookie}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${duration}${secure}`,
      },
    },
  );
}
