import { NextResponse } from "next/server";
import { loginSchema } from "../../../../lib/validators";
import { gsCall } from "../../../../lib/gs";
import { createSessionCookie, SESSION_COOKIE_NAME } from "../../../../lib/session";

export const runtime = "edge";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }

  const { email, password } = parsed.data;

  // Apps Script auth.login
  const data = await gsCall<{ ok: true; user: any }>("auth.login", { email, password });

  const secret = process.env.OPSSTAY_SESSION_SECRET || "dev_secret_change_me";
  const session = await createSessionCookie(
    {
      email: data.user.email,
      role: data.user.role,
      restaurant_name: data.user.restaurant_name,
      full_name: data.user.full_name,
    },
    secret
  );

  const res = NextResponse.json({ ok: true });
  res.headers.set("Cache-Control", "no-store");

  res.cookies.set(SESSION_COOKIE_NAME, session, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });

  return res;
}
