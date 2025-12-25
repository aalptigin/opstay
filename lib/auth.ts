import { cookies } from "next/headers";
import { verifySessionCookie, SESSION_COOKIE_NAME } from "./session";

export async function requireUser() {
  const c = await cookies();
  const token = c.get(SESSION_COOKIE_NAME)?.value;
  if (!token) throw new Error("unauthorized");

  const secret = process.env.OPSSTAY_SESSION_SECRET || "dev_secret_change_me";
  const user = await verifySessionCookie(token, secret);
  if (!user) throw new Error("unauthorized");

  return user;
}
