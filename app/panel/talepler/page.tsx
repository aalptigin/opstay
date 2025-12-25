"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

type Role = "manager" | "staff";
type Me = { user: { role: Role; full_name: string; restaurant_name: string } };

type ReqRow = {
  request_id: string;
  created_at: string;
  guest_full_name: string;
  guest_phone: string;
  department: string;
  risk_level: "bilgi" | "dikkat" | "kritik";
  summary: string;
  status: "open" | "in_review" | "resolved" | "rejected";
  response_text?: string;
};

export default function TaleplerPage() {
  const [me, setMe] = useState<Me | null>(null);

  const [rows, setRows] = useState<ReqRow[]>([]);
  const [q, setQ] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // create form (staff + manager)
  const [guestFullName, setGuestFullName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [department, setDepartment] = useState("Ön Büro");
  const [risk, setRisk] = useState<ReqRow["risk_level"]>("bilgi");
  const [summary, setSummary] = useState("");

  // respond (manager)
  const [selected, setSelected] = useState<ReqRow | null>(null);
  const [responseText, setResponseText] = useState("");
  const [status, setStatus] = useState<ReqRow["status"]>("resolved");

  async function loadMe() {
    const r = await fetch("/api/auth/me", { cache: "no-store" });
    const d = await r.json();
    if (r.ok) setMe(d);
  }

  async function load() {
    setLoading(true);
    setMsg(null);
    const res = await fetch("/api/requests", { cache: "no-store" });
    const data = await res.json();
    if (res.ok) setRows(data.rows || []);
    else setMsg(data?.error || "Talepler alınamadı");
    setLoading(false);
  }

  useEffect(() => {
    loadMe();
    load();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((r) =>
      (r.guest_full_name || "").toLowerCase().includes(s) ||
      (r.guest_phone || "").toLowerCase().includes(s) ||
      (r.department || "").toLowerCase().includes(s) ||
      (r.status || "").toLowerCase().includes(s)
    );
  }, [q, rows]);

  const isManager = me?.user?.role === "manager";

  async function createRequest() {
    setMsg(null);
    const res = await fetch("/api/requests", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        guest_full_name: guestFullName,
        guest_phone: guestPhone,
        department,
        risk_level: risk,
        summary,
      }),
    });
    const data = await res.json();
    if (!res.ok) return setMsg(data?.error || "Talep oluşturulamadı");
    setMsg("Talep oluşturuldu.");
    setGuestFullName("");
    setGuestPhone("");
    setDepartment("Ön Büro");
    setRisk("bilgi");
    setSummary("");
    await load();
  }

  async function respond() {
    if (!selected) return;
    setMsg(null);
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
    if (!res.ok) return setMsg(data?.error || "Yanıt kaydedilemedi");
    setMsg("Yanıt kaydedildi.");
    setSelected(null);
    setResponseText("");
    await load();
  }

  return (
    <div>
      <div className="text-white/60 text-xs tracking-[0.35em] font-semibold">TALEPLER</div>
      <h1 className="mt-2 text-2xl md:text-3xl font-extrabold text-white">Talepler</h1>
      <p className="mt-2 text-sm text-white/60">
        Operasyon değerlendirmesi için gelen talepleri yönetin.
      </p>

      <div className="mt-4 flex flex-wrap gap-3 items-center justify-between">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full sm:w-[420px] rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
          placeholder="Ara: isim, telefon, departman, durum..."
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
          <div className="px-5 py-4 border-b border-white/10 text-xs text-white/55 grid grid-cols-[1fr_120px_110px] gap-3">
            <div>Talep</div>
            <div>Seviye</div>
            <div>Durum</div>
          </div>

          {loading ? (
            <div className="px-5 py-10 text-sm text-white/55">Yükleniyor...</div>
          ) : filtered.length === 0 ? (
            <div className="px-5 py-10 text-sm text-white/55">Kayıt yok.</div>
          ) : (
            <div className="divide-y divide-white/10 max-h-[560px] overflow-auto">
              {filtered.map((r) => (
                <button
                  key={r.request_id}
                  onClick={() => {
                    setSelected(r);
                    setResponseText(r.response_text || "");
                    setStatus(r.status || "resolved");
                  }}
                  className="w-full text-left px-5 py-4 hover:bg-white/5"
                >
                  <div className="grid grid-cols-[1fr_120px_110px] gap-3 items-start">
                    <div>
                      <div className="text-white font-semibold">{r.guest_full_name}</div>
                      <div className="text-white/60 text-sm">{r.guest_phone} • {r.department}</div>
                      <div className="text-white/55 text-sm mt-1 line-clamp-2">{r.summary}</div>
                      <div className="text-white/35 text-xs mt-2">ID: {r.request_id}</div>
                    </div>
                    <div className="text-sm text-white/80">{r.risk_level}</div>
                    <div className="text-sm text-white/80">{r.status}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Sağ panel: staff -> oluşturma, manager -> yanıt */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5"
        >
          {!isManager && (
            <>
              <div className="text-white font-semibold">Yeni talep oluştur</div>
              <p className="mt-2 text-sm text-white/60">Talebiniz operasyon ve müdür tarafından değerlendirilecektir.</p>

              <div className="mt-4">
                <label className="text-xs text-white/60">Misafir adı soyadı</label>
                <input value={guestFullName} onChange={(e) => setGuestFullName(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
              </div>

              <div className="mt-4">
                <label className="text-xs text-white/60">Telefon</label>
                <input value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
              </div>

              <div className="mt-4 grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-white/60">Departman</label>
                  <input value={department} onChange={(e) => setDepartment(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
                </div>
                <div>
                  <label className="text-xs text-white/60">Seviye</label>
                  <select value={risk} onChange={(e) => setRisk(e.target.value as any)}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
                  >
                    <option value="bilgi">Bilgi</option>
                    <option value="dikkat">Dikkat</option>
                    <option value="kritik">Kritik</option>
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="text-xs text-white/60">Durum özeti</label>
                <textarea value={summary} onChange={(e) => setSummary(e.target.value)}
                  className="mt-2 w-full min-h-[160px] rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
              </div>

              <div className="mt-5 flex justify-end">
                <button
                  onClick={createRequest}
                  className="rounded-xl bg-[#0ea5ff] px-5 py-3 text-sm font-semibold text-[#06121f]"
                >
                  Talep oluştur
                </button>
              </div>
            </>
          )}

          {isManager && (
            <>
              <div className="text-white font-semibold">Talep yanıtı</div>
              <p className="mt-2 text-sm text-white/60">Seçili talebi değerlendirin ve durumu güncelleyin.</p>

              {!selected ? (
                <div className="mt-6 text-sm text-white/60">Soldan bir talep seçin.</div>
              ) : (
                <>
                  <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
                    <div className="text-white font-semibold">{selected.guest_full_name}</div>
                    <div className="text-white/60 text-sm">{selected.guest_phone} • {selected.department}</div>
                    <div className="text-white/55 text-sm mt-2">{selected.summary}</div>
                    <div className="text-white/35 text-xs mt-3">ID: {selected.request_id}</div>
                  </div>

                  <div className="mt-4">
                    <label className="text-xs text-white/60">Durum</label>
                    <select value={status} onChange={(e) => setStatus(e.target.value as any)}
                      className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
                    >
                      <option value="open">open</option>
                      <option value="in_review">in_review</option>
                      <option value="resolved">resolved</option>
                      <option value="rejected">rejected</option>
                    </select>
                  </div>

                  <div className="mt-4">
                    <label className="text-xs text-white/60">Yanıt</label>
                    <textarea value={responseText} onChange={(e) => setResponseText(e.target.value)}
                      className="mt-2 w-full min-h-[180px] rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
                      placeholder="Kurumsal ve net bir yanıt yazın." />
                  </div>

                  <div className="mt-5 flex justify-end gap-3">
                    <button
                      onClick={() => { setSelected(null); setResponseText(""); }}
                      className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white"
                    >
                      Vazgeç
                    </button>
                    <button
                      onClick={respond}
                      className="rounded-xl bg-[#0ea5ff] px-5 py-3 text-sm font-semibold text-[#06121f]"
                    >
                      Yanıtla
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
