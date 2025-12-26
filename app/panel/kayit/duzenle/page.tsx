"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

type Row = {
  record_id: string;
  full_name: string;
  phone: string;
  risk_level: string;
  summary: string;
};

type Meta = {
  reservation_no?: string;
  date?: string; // YYYY-MM-DD
  time?: string; // HH:mm
  table_no?: string;
  restaurant?: "Happy Moons" | "Roof";
  children_u7?: number;
  note?: string; // rezervasyon/müşteri notu
};

function safeParseMeta(summary: string): Meta {
  if (!summary) return {};
  try {
    const obj = JSON.parse(summary);
    if (obj && typeof obj === "object") return obj as Meta;
    return {};
  } catch {
    // Eski kayıtlar düz metin olabilir -> not olarak koru
    return { note: summary };
  }
}

function splitISODate(iso?: string) {
  if (!iso || typeof iso !== "string") return { y: "", m: "", d: "" };
  const [y, m, d] = iso.split("-");
  return { y: y || "", m: m || "", d: d || "" };
}

function toISODate(y: string, m: string, d: string) {
  const yy = y.trim();
  const mm = m.trim();
  const dd = d.trim();
  if (!yy || !mm || !dd) return "";
  return `${yy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
}

export default function KayitDuzenlePage() {
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [selected, setSelected] = useState<Row | null>(null);
  const [meta, setMeta] = useState<Meta>({});
  const [msg, setMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Tarih parça state (GG/AA/YYYY)
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  // Saat (HH:mm)
  const [time, setTime] = useState("");

  async function load() {
    setMsg(null);
    const res = await fetch("/api/records", { cache: "no-store" });
    const data = await res.json();
    if (res.ok) setRows(data.rows || []);
    else setMsg(data?.error || "Liste alınamadı");
  }

  useEffect(() => {
    load();
  }, []);

  // Seçili kayıt değişince meta + tarih/saat alanlarını doldur
  useEffect(() => {
    if (!selected) return;

    const m = safeParseMeta(selected.summary || "");
    const restaurant = (m.restaurant as any) || "Happy Moons";

    const merged: Meta = {
      ...m,
      restaurant: restaurant === "Roof" ? "Roof" : "Happy Moons",
      children_u7: typeof m.children_u7 === "number" ? m.children_u7 : 0,
      note: typeof m.note === "string" ? m.note : "",
      time: typeof m.time === "string" ? m.time : "",
    };

    setMeta(merged);

    const { y, m: mm, d } = splitISODate(merged.date);
    setYear(y || "");
    setMonth(mm || "");
    setDay(d || "");

    setTime(merged.time || "");
  }, [selected]);

  const isoDate = useMemo(() => toISODate(year, month, day), [year, month, day]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;

    return rows.filter((r) => {
      const m = safeParseMeta(r.summary || "");
      const hay = [
        r.full_name || "",
        r.phone || "",
        r.record_id || "",
        m.reservation_no || "",
        m.table_no || "",
        m.date || "",
        m.time || "",
        m.restaurant || "",
        String(m.children_u7 ?? ""),
        m.note || "",
      ]
        .join(" ")
        .toLowerCase();

      return hay.includes(s);
    });
  }, [q, rows]);

  async function save() {
    if (!selected) return;

    setSaving(true);
    setMsg(null);

    const nextMeta: Meta = {
      ...meta,
      date: isoDate || meta.date || "",
      time: (time || "").trim(),
      restaurant: meta.restaurant || "Happy Moons",
      note: (meta.note || "").trim(),
      // Roof seçildiyse çocuk sayısını kaydetmeyelim
      children_u7: meta.restaurant === "Happy Moons" ? Number(meta.children_u7 || 0) : undefined,
    };

    const payload: Row = {
      ...selected,
      // API uyumluluğu için korunur (UI’da yok)
      risk_level: selected.risk_level || "bilgi",
      // Tüm yeni alanlar summary JSON içinde
      summary: JSON.stringify(nextMeta),
    };

    const res = await fetch("/api/records", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    setSaving(false);

    if (!res.ok) return setMsg(data?.error || "Güncellenemedi");

    setMsg("Kayıt güncellendi.");
    await load();
  }

  function selectRow(r: Row) {
    setSelected({ ...r });
  }

  return (
    <div>
      <div className="text-white/60 text-xs tracking-[0.35em] font-semibold">KAYIT</div>
      <h1 className="mt-2 text-2xl md:text-3xl font-extrabold text-white">Kayıt Düzenle</h1>

      <div className="mt-4">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full sm:w-[420px] rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
          placeholder="Ara: isim / telefon / id"
        />
      </div>

      <div className="mt-5 grid lg:grid-cols-2 gap-5">
        {/* SOL LİSTE */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden"
        >
          <div className="px-5 py-4 text-sm text-white/70">{msg}</div>

          <div className="divide-y divide-white/10 max-h-[520px] overflow-auto">
            {filtered.map((r) => {
              const m = safeParseMeta(r.summary || "");
              const restaurant = (m.restaurant as any) || "-";
              const date = m.date || "-";
              const t = m.time || "-";
              const resNo = m.reservation_no || "-";
              const table = m.table_no || "-";
              const kids =
                m.restaurant === "Happy Moons" ? ` • Çocuk(7-): ${Number(m.children_u7 ?? 0)}` : "";
              const note = (m.note || "").trim();

              return (
                <button
                  key={r.record_id}
                  onClick={() => selectRow(r)}
                  className="w-full text-left px-5 py-4 hover:bg-white/5"
                >
                  <div className="text-white font-semibold">{r.full_name || "İsim girilmemiş"}</div>
                  <div className="text-white/60 text-sm">{r.phone || "-"}</div>

                  <div className="text-white/55 text-sm mt-2">
                    <span className="text-white/45">Rez No:</span> {resNo}{" "}
                    <span className="text-white/35">•</span>{" "}
                    <span className="text-white/45">Tarih:</span> {date}{" "}
                    <span className="text-white/35">•</span>{" "}
                    <span className="text-white/45">Saat:</span> {t}{" "}
                    <span className="text-white/35">•</span>{" "}
                    <span className="text-white/45">Masa:</span> {table}{" "}
                    <span className="text-white/35">•</span>{" "}
                    <span className="text-white/45">Restoran:</span> {restaurant}
                    {kids}
                  </div>

                  <div className="text-white/55 text-sm mt-2 line-clamp-2">
                    <span className="text-white/45">Not:</span> {note || "-"}
                  </div>

                  <div className="text-white/35 text-xs mt-2">ID: {r.record_id}</div>
                </button>
              );
            })}

            {filtered.length === 0 && (
              <div className="px-5 py-10 text-sm text-white/55">Kayıt bulunamadı.</div>
            )}
          </div>
        </motion.div>

        {/* SAĞ FORM */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5"
        >
          {!selected ? (
            <div className="text-white/60 text-sm">Düzenlemek için soldan bir kayıt seçin.</div>
          ) : (
            <>
              {/* ÜST: Restoran (solda) + Rezervasyon No (sağda) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-white/60">Restoran</label>
                  <select
                    value={meta.restaurant || "Happy Moons"}
                    onChange={(e) =>
                      setMeta((p) => ({
                        ...p,
                        restaurant: e.target.value as any,
                        children_u7: e.target.value === "Happy Moons" ? Number(p.children_u7 || 0) : 0,
                      }))
                    }
                    style={{ colorScheme: "dark" }}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
                  >
                    <option className="bg-[#0b1220] text-white" value="Happy Moons">
                      Happy Moons
                    </option>
                    <option className="bg-[#0b1220] text-white" value="Roof">
                      Roof
                    </option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-white/60">Rezervasyon Numarası</label>
                  <input
                    value={meta.reservation_no || ""}
                    onChange={(e) => setMeta((p) => ({ ...p, reservation_no: e.target.value }))}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
                    placeholder="Örn: RZV-1023"
                  />
                </div>
              </div>

              {/* GRID: istenen yeni sıralama */}
              <div className="mt-5 grid md:grid-cols-2 gap-4">
                {/* 3) Masa numarası (rezervasyonun eski yeri) */}
                <div>
                  <label className="text-xs text-white/60">Masa Numarası</label>
                  <input
                    value={meta.table_no || ""}
                    onChange={(e) => setMeta((p) => ({ ...p, table_no: e.target.value }))}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
                    placeholder="Örn: 12"
                  />
                </div>

                {/* 4) Gün/Ay/Yıl (masa numarasının yeri) */}
                <div>
                  <label className="text-xs text-white/60">Gün / Ay / Yıl</label>
                  <div className="mt-2 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                    <input
                      value={day}
                      onChange={(e) => setDay(e.target.value.replace(/\D/g, "").slice(0, 2))}
                      className="w-14 bg-transparent text-white outline-none text-sm"
                      placeholder="GG"
                    />
                    <span className="text-white/30">/</span>
                    <input
                      value={month}
                      onChange={(e) => setMonth(e.target.value.replace(/\D/g, "").slice(0, 2))}
                      className="w-14 bg-transparent text-white outline-none text-sm"
                      placeholder="AA"
                    />
                    <span className="text-white/30">/</span>
                    <input
                      value={year}
                      onChange={(e) => setYear(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      className="w-20 bg-transparent text-white outline-none text-sm"
                      placeholder="YYYY"
                    />
                  </div>
                </div>

                {/* 5) Saat (gün/ay/yıl yerine) -> sadece saat, daha prestijli */}
                <div>
                  <label className="text-xs text-white/60">Saat</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base font-semibold tracking-[0.10em] text-white outline-none"
                  />
                </div>

                {/* 6) Müşteri adı soyadı (saatin yerine) */}
                <div>
                  <label className="text-xs text-white/60">Müşteri Adı Soyadı</label>
                  <input
                    value={selected.full_name}
                    onChange={(e) => setSelected({ ...selected, full_name: e.target.value })}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
                    placeholder="Örn: Ad Soyad"
                  />
                </div>

                {/* 7) Telefon (müşteri adı soyadı yerine) */}
                <div>
                  <label className="text-xs text-white/60">Telefon Numarası</label>
                  <input
                    value={selected.phone}
                    onChange={(e) => setSelected({ ...selected, phone: e.target.value })}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
                    placeholder="05xx..."
                  />
                </div>

                {/* 8) Çocuk sayısı (telefon yerine) -> sadece Happy Moons */}
                {meta.restaurant === "Happy Moons" ? (
                  <div>
                    <label className="text-xs text-white/60">7 yaş altı çocuk sayısı (Happy Moons)</label>
                    <input
                      type="number"
                      min={0}
                      value={String(meta.children_u7 ?? 0)}
                      onChange={(e) => setMeta((p) => ({ ...p, children_u7: Number(e.target.value || 0) }))}
                      className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
                      placeholder="0"
                    />
                  </div>
                ) : (
                  <div className="hidden md:block" />
                )}

                {/* Not */}
                <div className="md:col-span-2">
                  <label className="text-xs text-white/60">Not</label>
                  <textarea
                    value={meta.note || ""}
                    onChange={(e) => setMeta((p) => ({ ...p, note: e.target.value }))}
                    className="mt-2 w-full min-h-[140px] rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
                    placeholder="Blacklist / operasyon notu..."
                  />
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between gap-3">
                <div className="text-sm text-white/70">{saving ? "Kaydediliyor..." : ""}</div>
                <button
                  onClick={save}
                  disabled={saving}
                  className="rounded-xl bg-[#0ea5ff] px-5 py-3 text-sm font-semibold text-[#06121f] disabled:opacity-60"
                >
                  Kaydet
                </button>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
