export { POST } from "../auth/route";
import { identity, privateHeaders } from "../../../lib/access";
export async function GET() {
  const u = await identity();
  return Response.json(
    { registered: !!u?.isStaff },
    { headers: privateHeaders },
  );
}
