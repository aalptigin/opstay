import { cookies } from "next/headers";

export type Role = "manager" | "staff";

export type Me = {
  ok: true;
  user: {
    email: string;
    role: Role;
    restaurant_name: string;
    full_name: string;
    is_active: boolean;
  };
};

type GatewayOk<T> = { ok: true; data: T };
type GatewayErr = { ok: false; error: string };

const COOKIE_NAME = "opsstay_session";

function env(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

export async function gsCall<T>(action: string, payload: any = {}): Promise<GatewayOk<T> | GatewayErr> {
  const url = env("GS_GATEWAY_URL");
  const token = env("OPSSTAY_API_TOKEN");

  const session = cookies().get(COOKIE_NAME)?.value || "";

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-opsstay-token": token,
    },
    body: JSON.stringify({
      token,          // body’de de yolluyoruz (gateway hangi formatı bekliyorsa)
      action,
      session,        // cookie’den gelen session id/token
      payload,
    }),
    cache: "no-store",
  });

  const text = await res.text();
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    // Apps Script bazen plain text dönebilir
  }

  if (!res.ok) {
    return { ok: false, error: json?.error || `Gateway error (${res.status})` };
  }

  if (json?.ok === false) return { ok: false, error: json?.error || "Gateway error" };
  return { ok: true, data: json?.data ?? json ?? {} };
}

export async function requireMe(): Promise<Me["user"]> {
  const r = await gsCall<Me["user"]>("auth.me", {});
  if (!r.ok) throw new Error(r.error);
  if (!r.data?.is_active) throw new Error("Hesap pasif.");
  return r.data;
}

export function requireRole(user: { role: Role }, roles: Role[]) {
  if (!roles.includes(user.role)) {
    throw new Error("Yetkiniz yok.");
  }
}
