import { currentUser } from "./local-session";
export const identity = currentUser;
export function sameOrigin(request: Request) {
  return request.headers.get("origin") === new URL(request.url).origin;
}
export const privateHeaders = { "Cache-Control": "private, no-store" };
