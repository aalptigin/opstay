type GatewayResponse<T> = T & { ok: boolean; error?: string };

export async function gsCall<T>(
  action: string,
  payload: Record<string, any> = {}
): Promise<GatewayResponse<T>> {
  const url = process.env.GS_GATEWAY_URL;
  const token = process.env.OPSSTAY_API_TOKEN;

  if (!url || !token) {
    return { ok: false, error: "Missing GS_GATEWAY_URL or OPSSTAY_API_TOKEN" } as any;
  }

  const res = await fetch(`${url}?token=${encodeURIComponent(token)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, ...payload }),
    // Cloudflare runtime ok
  });

  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return { ok: false, error: `Invalid gateway JSON: ${text.slice(0, 200)}` } as any;
  }
}
