import { staffAuthenticated } from "../../lib/staff-auth";
import { requireUser } from "../auth";
import { identity } from "../../lib/access";
import ReportView from "../ReportView";
export const dynamic = "force-dynamic";
export default async function Page() {
  await requireUser("/report");
  return (
    <ReportView
      staffWorkspace={await staffAuthenticated()}
      staff={!!(await identity())?.isStaff}
    />
  );
}
