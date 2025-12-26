// app/panel/talepler/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

type Role = "manager" | "staff";
type Me = { user: { role: Role; full_name: string; restaurant_name: string } };

type ReqStatus = "open" | "in_review" | "resolved" | "rejected";

type ReqRow = {
  request_id: string;
  created_at: string;
  guest_full_name: string;
  guest_phone: string;
  summary: string; // operasyon notu
  status: ReqStatus;
  response_text?: string;
};

function trStatus(s: ReqStatus) {
  if (s === "open") return "Yeni";
  if (s === "in_review") return "İncelemede";
  if (s === "resolved") return "Kapandı";
  return "Reddedildi";
}

function pillClass(s: ReqStatus) {
  if (s === "in_review") return "border-yellow-300/25 bg-yellow-500/10 text-yellow-100";
  if (s === "resolved") return "border-emerald-300/25 bg-emerald-500/10 text-emerald-100";
  if (s === "rejected") return "border-red-300/25 bg-red-500/10 text-red-100";
  return "border-white/10 bg-white/5 text-white/80";
}

export default function TaleplerPage() {
  const [me, setMe] = useState<Me | null>(null);

  const [rows, setRows] = useState<ReqRow[]>([]);
  const [q, setQ] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // staff form
  const [guestFullName, setGuestFullName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [summary, setSummary] = useState("");

  // manager respond
  const [selected, setSelected] = useState<ReqRow | null>(null);
  const [responseText, setResponseText] = useState("");
  const [status, setStatus] = useState<ReqStatus>("in_review");

  async function loadMe() {
    const r = await fetch("/api/auth/me", { cache: "no-store" });
    const d = await r.json();
    if (r.ok) setMe(d);
  }

  async function load() {
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/requests", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Talepler alınamadı");
      setRows(data.rows || []);
    } catch (e: any) {
      setMsg(e?.message || "Hata");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMe();
    load();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((r) => {
      const hay = [
        r.guest_full_name || "",
        r.guest_phone || "",
        r.request_id || "",
        r.summary || "",
        r.status || "",
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(s);
    });
  }, [q, rows]);

  const isManager = me?.user?.role === "manager";

  async function createRequest() {
    setMsg(null);
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          guest_full_name: guestFullName,
          guest_phone: guestPhone,
          summary, // not
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Talep oluşturulamadı");
      setMsg("Talep iletildi.");
      setGuestFullName("");
      setGuestPhone("");
      setSummary("");
      await load();
    } catch (e: any) {
      setMsg(e?.message || "Hata");
    }
  }

  async function respond() {
    if (!selected) return;
    setMsg(null);
    try {
      const res = await fetch("/api/requests/respond", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          request_id: selected.request_id,
          response_text: responseText,
          status,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Kaydedilemedi");
      setMsg("Kaydedildi.");
      setSelected(null);
      setResponseText("");
      await load();
    } catch (e: any) {
      setMsg(e?.message || "Hata");
    }
  }

  return (
    <div>
      <div className="text-white/60 text-xs tracking-[0.35em] font-semibold">TALEPLER</div>
      <h1 className="mt-2 text-2xl md:text-3xl font-extrabold text-white">Talepler</h1>
      <p className="mt-2 text-sm text-white/60">
        Bu alan, blacklist şüphesi bulunan misafirler için operasyon notlarının müdüre iletildiği yerdir.
      </p>

      <div className="mt-4 flex flex-wrap gap-3 items-center justify-between">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full sm:w-[520px] rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
          placeholder="Ara: isim, telefon, durum, ID, not..."
        />
        <div className="text-sm text-white/70">{msg}</div>
      </div>

      <div className="mt-6 grid lg:grid-cols-2 gap-5">
        {/* Liste */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-white/10 text-xs text-white/55 grid grid-cols-[1fr_140px_170px] gap-3">
            <div>Talep</div>
            <div>Durum</div>
            <div>Tarih</div>
          </div>

          {loading ? (
            <div className="px-5 py-10 text-sm text-white/55">Yükleniyor...</div>
          ) : filtered.length === 0 ? (
            <div className="px-5 py-10 text-sm text-white/55">Kayıt yok.</div>
          ) : (
            <div className="divide-y divide-white/10 max-h-[640px] overflow-auto">
              {filtered.map((r) => (
                <button
                  key={r.request_id}
                  onClick={() => {
                    setSelected(r);
                    setResponseText(r.response_text || "");
                    setStatus((r.status as ReqStatus) || "in_review");
                  }}
                  className="w-full text-left px-5 py-4 hover:bg-white/5"
                >
                  <div className="grid grid-cols-[1fr_140px_170px] gap-3 items-start">
                    <div>
                      <div className="text-white font-semibold">{r.guest_full_name || "İsim girilmemiş"}</div>
                      <div className="text-white/55 text-sm mt-2 line-clamp-2">{r.summary || "Not eklenmemiş"}</div>
                      <div className="text-white/35 text-xs mt-3">ID: {r.request_id}</div>
                    </div>

                    <div className="pt-1">
                      <span
                        className={[
                          "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold",
                          pillClass(r.status),
                        ].join(" ")}
                      >
                        {trStatus(r.status)}
                      </span>
                    </div>

                    <div className="text-white/60 text-sm pt-1">{r.created_at || "-"}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Sağ panel */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5"
        >
          {!isManager && (
            <>
              <div className="text-white font-semibold">Talep ilet</div>
              <p className="mt-2 text-sm text-white/60">
                Blacklist şüphesi bulunan misafir için kısa not bırakın; müdür değerlendirecektir.
              </p>

              <div className="mt-4">
                <label className="text-xs text-white/60">Misafir adı soyadı</label>
                <input
                  value={guestFullName}
                  onChange={(e) => setGuestFullName(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
                />
              </div>

              <div className="mt-4">
                <label className="text-xs text-white/60">Telefon</label>
                <input
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
                />
              </div>

              <div className="mt-4">
                <label className="text-xs text-white/60">Not</label>
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="mt-2 w-full min-h-[220px] rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
                  placeholder="Kısa ve net şekilde durumu yazın."
                />
              </div>

              <div className="mt-5 flex justify-end">
                <button
                  onClick={createRequest}
                  className="rounded-xl bg-[#0ea5ff] px-5 py-3 text-sm font-semibold text-[#06121f]"
                >
                  Talep gönder
                </button>
              </div>
            </>
          )}

          {isManager && (
            <>
              <div className="text-white font-semibold text-lg">Müdür değerlendirmesi</div>
              <p className="mt-2 text-sm text-white/60">
                Seçili talebi inceleyin; onaylayın veya reddedin ve kurumsal bir yanıt girin.
              </p>

              {!selected ? (
                <div className="mt-6 text-sm text-white/60">Soldan bir talep seçin.</div>
              ) : (
                <>
                  <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-white font-semibold">{selected.guest_full_name || "İsim girilmemiş"}</div>
                        <div className="text-white/55 text-sm mt-1">{selected.guest_phone || "-"}</div>
                        <div className="text-white/35 text-xs mt-2">ID: {selected.request_id}</div>
                        <div className="text-white/35 text-xs mt-1">{selected.created_at || "-"}</div>
                      </div>
                      <span
                        className={[
                          "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold",
                          pillClass(selected.status),
                        ].join(" ")}
                      >
                        {trStatus(selected.status)}
                      </span>
                    </div>

                    <div className="mt-4">
                      <div className="text-xs text-white/60">Talep notu</div>
                      <div className="text-white/70 text-sm mt-2">{selected.summary || "Not eklenmemiş"}</div>
                    </div>
                  </div>

                  <div className="mt-5">
                    <label className="text-xs text-white/60">Durum</label>

                    {/* ✅ SADECE BU KISIM DÜZELTİLDİ (bg + appearance + option class) */}
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as ReqStatus)}
                      className="mt-2 w-full rounded-xl border border-white/10 bg-[#0b1220] px-4 py-3 text-sm text-white outline-none appearance-none"
                    >
                      <option className="bg-[#0b1220] text-white" value="open">
                        Yeni
                      </option>
                      <option className="bg-[#0b1220] text-white" value="in_review">
                        İncelemede
                      </option>
                      <option className="bg-[#0b1220] text-white" value="resolved">
                        Kapandı
                      </option>
                      <option className="bg-[#0b1220] text-white" value="rejected">
                        Reddedildi
                      </option>
                    </select>
                  </div>

                  <div className="mt-4">
                    <label className="text-xs text-white/60">Müdür yanıtı</label>
                    <textarea
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      className="mt-2 w-full min-h-[220px] rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
                      placeholder="Kurumsal ve net bir yanıt yazın."
                    />
                  </div>

                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      onClick={() => {
                        setSelected(null);
                        setResponseText("");
                      }}
                      className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white"
                    >
                      Vazgeç
                    </button>
                    <button
                      onClick={respond}
                      className="rounded-xl bg-[#0ea5ff] px-5 py-3 text-sm font-semibold text-[#06121f]"
                    >
                      Kaydet
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
