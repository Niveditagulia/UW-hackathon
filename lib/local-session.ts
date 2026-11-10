import { getSupabase } from "./supabase";
import { cookies } from "next/headers";
export const sessionCookie = "grove_session";
export function hex(bytes: ArrayBuffer | Uint8Array) {
  return Array.from(new Uint8Array(bytes as ArrayBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
export async function digest(value: string) {
  return hex(
    await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)),
  );
}
export async function passwordHash(password: string, salt: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  return hex(
    await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt: new TextEncoder().encode(salt),
        iterations: 100000,
        hash: "SHA-256",
      },
      key,
      256,
    ),
  );
}
export function equal(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
export async function currentUser() {
  const token = (await cookies()).get(sessionCookie)?.value;
  if (!token) return null;
  const db = getSupabase();
  const { data: session, error: sessionError } = await db
    .from("local_sessions")
    .select("user_id")
    .eq("token_hash", await digest(token))
    .gt("expires_at", Date.now())
    .maybeSingle();
  if (sessionError) throw sessionError;
  if (!session) return null;
  const { data: row, error: accountError } = await db
    .from("local_accounts")
    .select("id,username,email,role")
    .eq("id", session.user_id)
    .maybeSingle();
  if (accountError) throw accountError;
  return row
    ? {
        userId: row.id,
        displayName: row.username,
        email: row.email,
        fullName: row.username,
        isStaff: row.role === "staff",
      }
    : null;
}
