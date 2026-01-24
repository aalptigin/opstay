import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { COOKIE_NAME } from "./lib/auth.cookie";

export const runtime = 'edge';
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Herkese açık olanlar
  if (
    pathname === "/" ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/images") ||
    pathname === "/login" ||
    pathname.startsWith("/api/auth/login") ||
    pathname.startsWith("/api/auth/me")
  ) {
    return NextResponse.next();
  }

  // Sadece /panel/* koru
  if (!pathname.startsWith("/panel")) return NextResponse.next();

  // Cookie kontrol
  const hasSession = req.cookies.get(COOKIE_NAME)?.value;
  if (hasSession) return NextResponse.next();

  // Login'e yönlendir
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/panel/:path*"],
};
