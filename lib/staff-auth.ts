import { currentUser } from "./local-session";
export { hex, digest, passwordHash, equal } from "./local-session";
export async function staffAuthenticated() {
  return !!(await currentUser())?.isStaff;
}
