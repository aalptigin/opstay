"use client";

import { useEffect, useMemo, useState } from "react";

type Row = Record<string, any>;
function s(v: any) { return String(v ?? "").trim(); }

export default function Page() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>("");

  const [q, setQ] = useState("");
  const [selectedId, setSelectedId] = useState<string>("");

  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      setErr("");
      try {
        const r = await fetch("/api/reservations", { cache: "no-store" });
        const j = await r.json();
        if (!alive) return;
        setRows(Array.isArray(j?.rows) ? j.rows : []);
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.message || "Yükleme hatası");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }
    load();
    return () => { alive = false; };
  }, []);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return rows;
    return rows.filter((r) => {
      const hay = [
        r.restaurant, r.restaurant_name,
        r.reservation_no, r.reservation_n0,
        r.customer_full_name, r.full_name,
        r.customer_phone, r.phone,
      ].map((x) => s(x).toLowerCase()).join(" | ");
      return hay.includes(qq);
    });
  }, [rows, q]);

  const selected = useMemo(() => {
    if (!selectedId) return null;
    return rows.find((r) => s(r.reservation_id) === selectedId) || null;
  }, [rows, selectedId]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Rezervasyon Düzenle</h1>
        <p className="text-white/60 text-sm">
          Bu ekran “seç + düzenle” akışı için hazırlandı. Kaydetme için gateway’e <code>reservations.update</code> ekleyeceğiz.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <label className="text-xs text-white/60">Arama</label>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Rez. no / müşteri / telefon..."
          className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-white/20"
        />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
            <div className="text-sm text-white/70">{loading ? "Yükleniyor..." : `Kayıt: ${filtered.length}`}</div>
            {err ? <div className="text-sm text-red-300">{err}</div> : null}
          </div>

          <div className="max-h-[520px] overflow-auto">
            {filtered.map((r, idx) => {
              const id = s(r.reservation_id) || `row-${idx}`;
              const label = `${s(r.restaurant || r.restaurant_name)} • ${s(r.reservation_no || r.reservation_n0)} • ${s(r.customer_full_name || r.full_name)}`;
              const active = selectedId === id;

              return (
                <button
                  key={id}
                  onClick={() => setSelectedId(id)}
                  className={[
                    "w-full text-left px-4 py-3 border-b border-white/10 hover:bg-white/5",
                    active ? "bg-white/10" : "",
                  ].join(" ")}
                >
                  <div className="text-sm">{label || "-"}</div>
                  <div className="text-xs text-white/50">
                    {s(r.date || r.gun_ay_yil)} • {s(r.time || r.saat)} • {s(r.customer_phone || r.phone)}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-sm font-medium mb-2">Seçili Rezervasyon</div>

          {!selected ? (
            <div className="text-sm text-white/50">Soldan bir rezervasyon seç.</div>
          ) : (
            <div className="space-y-2 text-sm">
              <div className="text-white/80">
                <span className="text-white/50">Restoran:</span> {s(selected.restaurant || selected.restaurant_name) || "-"}
              </div>
              <div className="text-white/80">
                <span className="text-white/50">Rez. No:</span> {s(selected.reservation_no || selected.reservation_n0) || "-"}
              </div>
              <div className="text-white/80">
                <span className="text-white/50">Tarih/Saat:</span> {s(selected.date || selected.gun_ay_yil)} {s(selected.time || selected.saat)}
              </div>
              <div className="text-white/80">
                <span className="text-white/50">Müşteri:</span> {s(selected.customer_full_name || selected.full_name) || "-"}
              </div>
              <div className="text-white/80">
                <span className="text-white/50">Telefon:</span> {s(selected.customer_phone || selected.phone) || "-"}
              </div>
              <div className="text-white/80">
                <span className="text-white/50">Not:</span> {s(selected.note || selected.customer_note) || "-"}
              </div>

              <div className="pt-3">
                <button
                  disabled
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/50 cursor-not-allowed"
                >
                  Kaydet (bu adımda kapalı)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
