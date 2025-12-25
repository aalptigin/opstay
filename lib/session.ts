import { cookies } from "next/headers";
import { COOKIE_NAME } from "./auth.cookie";

export const SESSION_COOKIE_NAME = COOKIE_NAME;

export type SessionUser = {
  email: string;
  role: "manager" | "staff" | string;
  restaurant_name: string;
  full_name: string;
  iat?: number;
};

function toB64Url(bytes: Uint8Array) {
  let s = "";
  bytes.forEach((b) => (s += String.fromCharCode(b)));
  const b64 = btoa(s);
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromB64Url(b64url: string) {
  const pad = "=".repeat((4 - (b64url.length % 4)) % 4);
  const b64 = (b64url + pad).replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

async function hmacSha256(secret: string, data: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return new Uint8Array(sig);
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

/**
 * Format: base64url(jsonPayload) + "." + base64url(hmac(payloadB64))
 */
export async function createSessionCookie(user: SessionUser, secret: string) {
  const payload: SessionUser = { ...user, iat: Date.now() };
  const payloadB64 = toB64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const sig = await hmacSha256(secret, payloadB64);
  const sigB64 = toB64Url(sig);
  return `${payloadB64}.${sigB64}`;
}

export async function readSessionCookie(token: string, secret: string): Promise<SessionUser | null> {
  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [payloadB64, sigB64] = parts;

  try {
    const expectedSig = await hmacSha256(secret, payloadB64);
    const gotSig = fromB64Url(sigB64);

    if (!timingSafeEqual(expectedSig, gotSig)) return null;

    const payloadJson = new TextDecoder().decode(fromB64Url(payloadB64));
    const user = JSON.parse(payloadJson) as SessionUser;

    if (!user?.email || !user?.role) return null;
    return user;
  } catch {
    return null;
  }
}

/**
 * ✅ Next.js 16: cookies() Promise döner -> await şart
 * ✅ Hem verifySessionCookie(secret) hem verifySessionCookie(token, secret) desteklenir
 */
export async function verifySessionCookie(token: string, secret: string): Promise<SessionUser | null>;
export async function verifySessionCookie(secret: string): Promise<SessionUser | null>;
export async function verifySessionCookie(a: string, b?: string): Promise<SessionUser | null> {
  // 2 arg: (token, secret)
  if (typeof b === "string") {
    const token = a;
    const secret = b;
    if (!token) return null;
    return await readSessionCookie(token, secret);
  }

  // 1 arg: (secret) -> cookie'den oku
  const secret = a;
  const c = await cookies();
  const raw = c.get(SESSION_COOKIE_NAME)?.value;
  if (!raw) return null;
  return await readSessionCookie(raw, secret);
}
