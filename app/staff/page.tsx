import { staffAuthenticated } from "../../lib/staff-auth";
import { redirect } from "next/navigation";
import { requireUser } from "../auth";
import { identity } from "../../lib/access";
import ReportView from "../ReportView";
export const dynamic = "force-dynamic";
export default async function Page() {
  await requireUser("/staff");
  const user = await identity();
  if (!user?.isStaff)
    return (
      <main className="access-denied">
        <h1>Staff access required</h1>
        <p>Your account does not have permission to view resident reports.</p>
        <a className="primary" href="/play">
          Return to my day
        </a>
      </main>
    );
  if (!(await staffAuthenticated())) redirect("/staff/login");
  return <ReportView staff directory />;
}
