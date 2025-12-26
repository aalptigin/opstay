import { cookies } from "next/headers";
import { COOKIE_NAME } from "./auth.cookie";

export type GatewayErr = { ok: false; error: string };
export type GatewayOk<T> = { ok: true; data: T };

function env(name: string) {
  const v = process.env[name];
  return (v || "").trim();
}

/**
 * Apps Script Gateway çağrısı.
 * Gateway tarafı { ok: true, ... } veya { ok: false, error: "..." } döndürür.
 * Biz bunu { ok: true, data: <gatewayResponse> } şeklinde normalize ediyoruz.
 */
export async function gsCall<T>(action: string, payload: any = {}): Promise<GatewayOk<T> | GatewayErr> {
  const url = env("GS_GATEWAY_URL");
  const token = env("OPSSTAY_API_TOKEN");

  if (!url || !token) {
    return { ok: false, error: "Missing GS_GATEWAY_URL or OPSSTAY_API_TOKEN" };
  }

  // oturum cookie’sini gateway’e opsiyonel iletmek istersen
  // (şu an Apps Script kodun token + actor_email ile çalışıyor; cookie şart değil)
  const c = await cookies();
  const session = c.get(COOKIE_NAME)?.value || "";

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        // opsiyonel: gateway’e session göndermek istersen
        "x-opsstay-session": session,
      },
      body: JSON.stringify({
        token,
        action,
        payload,
      }),
      cache: "no-store",
    });

    const json = await res.json().catch(() => null);

    // Gateway kendi ok/error formatını döndürüyorsa:
    if (json && typeof json.ok === "boolean") {
      if (json.ok) return { ok: true, data: json as T };
      return { ok: false, error: String(json.error || "gateway error") };
    }

    // Gateway farklı döndürdüyse:
    if (!res.ok) {
      return { ok: false, error: `gateway http ${res.status}` };
    }

    return { ok: true, data: json as T };
  } catch (e: any) {
    return { ok: false, error: e?.message || String(e) };
  }
}

/**
 * Kullanıcıyı (me) zorunlu okuma.
 * Eğer gateway’de auth.me yoksa ama başka yerde me çekiyorsan,
 * bu fonksiyonu o akışa göre uyarlarsın.
 */
export type Me = { user: { email: string; role: string; restaurant_name: string; full_name: string; is_active?: any } };

export async function requireMe(): Promise<Me["user"]> {
  const r = await gsCall<any>("auth.me", {});
  if (!r.ok) throw new Error(r.error);

  // bazı gateway’ler { ok:true, user:{...} } döner, bazıları direkt user dönebilir
  const data = (r as GatewayOk<any>).data;
  const user = data?.user ?? data;

  if (!user) throw new Error("unauthorized");
  if (user?.is_active !== undefined && String(user.is_active).toUpperCase() !== "TRUE") {
    throw new Error("Hesap pasif.");
  }

  return user as Me["user"];
}
