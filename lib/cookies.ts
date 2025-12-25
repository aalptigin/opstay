export const COOKIE_NAME = "opssstay_session";

export function cookieSerialize(
  name: string,
  value: string,
  opts?: {
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: "Lax" | "Strict" | "None";
    path?: string;
    maxAge?: number;
  }
) {
  const parts: string[] = [];
  parts.push(`${name}=${encodeURIComponent(value)}`);
  parts.push(`Path=${opts?.path ?? "/"}`);
  if (opts?.maxAge != null) parts.push(`Max-Age=${opts.maxAge}`);
  if (opts?.httpOnly ?? true) parts.push("HttpOnly");
  parts.push(`SameSite=${opts?.sameSite ?? "Lax"}`);
  if (opts?.secure ?? true) parts.push("Secure");
  return parts.join("; ");
}
