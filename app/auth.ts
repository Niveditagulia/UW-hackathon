// Local account authentication backed by persistent SQLite sessions.
import { redirect } from "next/navigation";
import { currentUser } from "../lib/local-session";
export const getCurrentUser = currentUser;
export async function requireUser(returnTo: string) {
  const user = await currentUser();
  if (user) return user;
  redirect("/signin?return_to=" + encodeURIComponent(returnTo));
}
export function signInPath(returnTo: string) {
  return "/signin?return_to=" + encodeURIComponent(returnTo);
}
export function signOutPath() {
  return "/signout";
}
