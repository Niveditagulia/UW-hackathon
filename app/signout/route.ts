import { cookies } from "next/headers";
import { getSupabase } from "../../lib/supabase";
import { digest, sessionCookie } from "../../lib/local-session";
export async function GET(req: Request) {
  if (req.headers.get("sec-fetch-site") === "cross-site")
    return new Response("Invalid request", { status: 403 });
  const token = (await cookies()).get(sessionCookie)?.value;
  if (token)
    await getSupabase()
      .from("local_sessions")
      .delete()
      .eq("token_hash", await digest(token));
  return new Response(null, {
    status: 303,
    headers: {
      Location: "/login",
      "Cache-Control": "no-store",
      "Set-Cookie": `${sessionCookie}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
    },
  });
}
