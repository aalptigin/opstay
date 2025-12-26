export async function gsCall<T>(action: string, payload: any) {
  const url = process.env.GS_GATEWAY_URL!;
  const token = process.env.OPSSTAY_API_TOKEN!;

  if (!url || !token) {
    throw new Error("Missing GS_GATEWAY_URL or OPSSTAY_API_TOKEN");
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ token, action, payload }),
  });

  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.ok) {
    throw new Error(data?.error || "Gateway error");
  }
  return data as T;
}