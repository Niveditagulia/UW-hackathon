import { getCurrentUser } from "../auth";
import Login from "./Login";
export const dynamic = "force-dynamic";
export default async function Page() {
  const user = await getCurrentUser();
  return <Login signedIn={!!user} />;
}
