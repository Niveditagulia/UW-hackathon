import {sqlDb} from "../../../db/sql";
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
  if (!sameOrigin(req))
    return Response.json({ error: "Invalid request." }, { status: 403 });
  const b: any = await req.json().catch(() => null);
  if (!b || !["login", "register", "logout"].includes(b.action))
    return Response.json({ error: "Invalid request." }, { status: 400 });
  const secure = new URL(req.url).protocol === "https:" ? "; Secure" : "";
  if (b.action === "logout") {
    const token = (await cookies()).get(sessionCookie)?.value;
    if (token)
      await sqlDb.prepare("DELETE FROM local_sessions WHERE token_hash=?")
        .bind(await digest(token))
        .run();
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
  let row = await sqlDb.prepare(
    "SELECT * FROM local_accounts WHERE username=?",
  )
    .bind(username)
    .first<any>();
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
    try {
      await sqlDb.prepare(
        "INSERT INTO local_accounts (id,username,email,role,salt,password_hash) VALUES (?,?,?,?,?,?)",
      )
        .bind(id, username, username + "@local.grove", role, salt, hash)
        .run();
    } catch {
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
    await sqlDb.prepare(
      "UPDATE local_accounts SET attempts=0,window_start=? WHERE id=? AND window_start<?",
    )
      .bind(now, row.id, now - 900000)
      .run();
    const attempt = await sqlDb.prepare(
      "UPDATE local_accounts SET attempts=attempts+1 WHERE id=? AND attempts<5 RETURNING id",
    )
      .bind(row.id)
      .first();
    if (!attempt)
      return Response.json(
        { error: "Too many attempts. Try again in 15 minutes." },
        { status: 429 },
      );
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
  await sqlDb.prepare(
    "UPDATE local_accounts SET attempts=0,window_start=? WHERE id=?",
  )
    .bind(Date.now(), row.id)
    .run();
  await sqlDb.prepare("DELETE FROM local_sessions WHERE expires_at<=?")
    .bind(Date.now())
    .run();
  await sqlDb.prepare(
    "INSERT INTO local_sessions (token_hash,user_id,expires_at) VALUES (?,?,?)",
  )
    .bind(await digest(token), row.id, Date.now() + duration * 1000)
    .run();
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
