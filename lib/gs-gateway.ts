import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME, readSessionCookie, type SessionUser } from "./auth";

export type GatewayErr = { ok: false; error: string };
export type GatewayOk<T> = { ok: true; data: T };

function env(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing ${name}`);
  return v;
}

async function getSession_(): Promise<SessionUser | null> {
  const c = await cookies();
  const raw = c.get(SESSION_COOKIE_NAME)?.value;
  if (!raw) return null;

  const secret = process.env.OPSSTAY_SESSION_SECRET || "dev_secret_change_me";
  return await readSessionCookie(raw, secret);
}

export async function requireMe(): Promise<SessionUser> {
  const me = await getSession_();
  if (!me) throw new Error("unauthorized");
  return me;
}

/**
 * ✅ Yeni imza: requireRole(["manager"])
 * me parametresi yok -> tek standart.
 */
export async function requireRole(roles: string[]): Promise<SessionUser> {
  const me = await requireMe();
  if (!roles.includes(String(me.role))) throw new Error("forbidden");
  return me;
}

/**
 * Apps Script doPost sözleşmesi:
 * { token, action, payload }
 * payload içine actor_email otomatik ekler.
 */
export async function gsCall<T>(action: string, payload: any = {}): Promise<GatewayOk<T> | GatewayErr> {
  const url = env("GS_GATEWAY_URL");
  const token = env("OPSSTAY_API_TOKEN");

  // actor_email otomatik ekle (auth.login hariç)
  const isAuthAction = action === "auth.login" || action === "users.getByEmail";
  if (!isAuthAction && !payload?.actor_email) {
    const me = await getSession_();
    if (me?.email) payload = { ...payload, actor_email: me.email };
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ token, action, payload }),
    cache: "no-store",
  });

  let json: any = null;
  try {
    json = await res.json();
  } catch {
    // Apps Script bazen HTML dönerse buraya düşer
    return { ok: false, error: `gateway_invalid_json_http_${res.status}` };
  }

  if (!res.ok) return { ok: false, error: json?.error || `gateway_http_${res.status}` };
  if (!json?.ok) return { ok: false, error: json?.error || "gateway_error" };

  // Standart data mapping:
  const data =
    json.data ??
    json.rows ??
    json.user ??
    json.matches ??
    json.result ??
    json.record_id ??
    json.request_id ??
    json;

  return { ok: true, data: data as T };
}
