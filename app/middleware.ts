import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { COOKIE_NAME } from "@/lib/auth.cookie";

export const runtime = "edge";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Her zaman serbest olanlar
  if (
    pathname === "/" ||
    pathname === "/login" ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/api/auth/login") ||
    pathname.startsWith("/api/auth/me")
  ) {
    return NextResponse.next();
  }

  // Sadece /panel/* koru
  if (!pathname.startsWith("/panel")) return NextResponse.next();

  // Cookie kontrol
  const session = req.cookies.get(COOKIE_NAME)?.value;

  if (session) return NextResponse.next();

  // Oturum yoksa login'e
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

// Middleware matcher (performans + doğru kapsam)
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
