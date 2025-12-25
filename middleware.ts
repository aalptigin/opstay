import { COOKIE_NAME } from "@/lib/auth.cookie";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";


export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Public routes + static
  if (
    pathname === "/" ||
    pathname === "/login" ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/api/auth/login") ||
    pathname.startsWith("/api/auth/logout") ||
    pathname.startsWith("/api/auth/me")
  ) {
    return NextResponse.next();
  }

  // Protect /panel
  if (pathname.startsWith("/panel")) {
    const hasSession = req.cookies.get(COOKIE_NAME)?.value;
    if (!hasSession) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/panel/:path*"],
};