import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME, readSessionCookie } from "@/lib/session";

export const runtime = "edge";

export async function GET() {
  const c = await cookies();
  const raw = c.get(SESSION_COOKIE_NAME)?.value;

  if (!raw) {
    return NextResponse.json(
      { user: null },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  }

  const secret = process.env.OPSSTAY_SESSION_SECRET || "dev_secret_change_me";
  const user = await readSessionCookie(raw, secret);

  return NextResponse.json(
    { user: user ?? null },
    { status: 200, headers: { "Cache-Control": "no-store" } }
  );
}
