import { COOKIE_NAME } from "./auth.cookie";
import { cookies } from "next/headers";
import { requireUser, type SessionUser } from "./auth";

export type GatewayErr = { ok: false; error: string };
export type GatewayOk<T> = { ok: true; data: T };

function env(name: string) {
  return (process.env[name] || "").trim();
}

/**
 * Projedeki auth.ts "requireUser" export ettiği için
 * session çözmeyi buradan yapıyoruz.
 */
async function getSessionUser(): Promise<SessionUser | null> {
  try {
    // Bazı projelerde requireUser() direkt cookie'den okur.
    // Okumuyorsa bile en azından aşağıda raw cookie varsa yakalayıp davranış stabil olur.
    const u = await requireUser();
    return (u as any) || null;
  } catch {
    return null;
  }
}

/**
 * Apps Script Gateway çağrısı.
 * auth.login dışında, payload içinde actor_email yoksa cookie'den otomatik ekler.
 */
export async function gsCall<T>(
  action: string,
  payload: any = {}
): Promise<GatewayOk<T> | GatewayErr> {
  const url = env("GS_GATEWAY_URL");
  const token = env("OPSSTAY_API_TOKEN");

  if (!url || !token) {
    return { ok: false, error: "Missing GS_GATEWAY_URL or OPSSTAY_API_TOKEN" };
  }

  // auth.login haricinde actor_email otomatik tamamla
  let finalPayload = payload || {};
  if (action !== "auth.login" && !finalPayload.actor_email) {
    const u = await getSessionUser();
    if (u?.email) {
      finalPayload = { ...finalPayload, actor_email: u.email };
    } else {
      // En azından cookie var mı kontrol et (bazı akışlarda requireUser farklı davranabilir)
      const c = await cookies();
      const raw = c.get(COOKIE_NAME)?.value;
      if (raw) {
        // actor_email yoksa gateway requireActor_ patlayabilir; burada set edemedik.
        // Bu durumda API route tarafı zaten unauthorized dönmeli.
      }
    }
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token, action, payload: finalPayload }),
      cache: "no-store",
    });

    const text = await res.text();
    let json: any = null;

    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      return { ok: false, error: `Gateway returned non-JSON (${res.status})` };
    }

    if (json && typeof json.ok === "boolean") {
      if (json.ok) return { ok: true, data: json as T };
      return { ok: false, error: String(json.error || "gateway error") };
    }

    if (!res.ok) return { ok: false, error: `gateway http ${res.status}` };
    return { ok: true, data: json as T };
  } catch (e: any) {
    return { ok: false, error: e?.message || String(e) };
  }
}

export type MeUser = {
  email: string;
  role: string;
  restaurant_name: string;
  full_name: string;
  is_active?: any;
};

export async function requireMe(): Promise<MeUser> {
  const u = await getSessionUser();
  if (!u?.email) throw new Error("unauthorized");

  return {
    email: u.email,
    role: String((u as any).role || ""),
    restaurant_name: String((u as any).restaurant_name || ""),
    full_name: String((u as any).full_name || ""),
    is_active: (u as any).is_active,
  };
}

export async function requireRole(roles: string | string[]): Promise<MeUser> {
  const user = await requireMe();
  const allowed = Array.isArray(roles) ? roles : [roles];
  if (!allowed.includes(String(user.role))) throw new Error("forbidden");
  return user;
}
