import { NextResponse } from "next/server";
import { COOKIE_NAME } from "@/lib/auth.cookie";

export const runtime = "edge";

function clearCookie(res: NextResponse) {
  res.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}

// Eğer buton fetch ile POST atıyorsa
export async function POST(req: Request) {
  const res = NextResponse.redirect(new URL("/login", req.url));
  return clearCookie(res);
}

// Eğer kullanıcı tarayıcıda /api/auth/logout açıyorsa (GET)
export async function GET(req: Request) {
  const res = NextResponse.redirect(new URL("/login", req.url));
  return clearCookie(res);
}
