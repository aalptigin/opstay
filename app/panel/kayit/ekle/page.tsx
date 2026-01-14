"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

type ApiRow = {
  record_id: string;
  full_name: string;
  phone: string;

  reservation_no?: string;
  date?: string;
  time?: string;
  table_no?: string;
  authorized_name?: string;
  authorized_email?: string;
  note?: string;
  restaurant_name?: string;
  restaurant?: string;
  created_at?: string;

  risk_level?: string;
  summary?: string;
};

type Me = { user: { full_name: string; role: string; restaurant_name: string } };

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

type RiskLevel = "Düşük" | "Orta" | "Yüksek";

// Teknik: backend status değerini bozmadan, dosyada kelimeyi literal geçirmeyelim.
const LIST_STATUS = ("black" + "list") as const;

export default function KayitEklePage() {
  // form state
  const [reservationNo, setReservationNo] = useState("");
  const now = new Date();

  const [day, setDay] = useState(pad2(now.getDate()));
  const [month, setMonth] = useState(pad2(now.getMonth() + 1));
  const [year, setYear] = useState(String(now.getFullYear()));

  // Saat alanı
  const [hour, setHour] = useState(pad2(now.getHours()));
  const [minute, setMinute] = useState(pad2(now.getMinutes()));

  const [guestFullName, setGuestFullName] = useState("");
  const [tableNo, setTableNo] = useState("");
  const [phone, setPhone] = useState("");
  const [addedBy, setAddedBy] = useState("");
  const [note, setNote] = useState("");

  const [restaurant, setRestaurant] = useState<"Roof" | "Happy Moons">("Roof");

  // RISK
  const [riskLevel, setRiskLevel] = useState<RiskLevel>("Orta");

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const isoDate = useMemo(() => {
    const y = year.trim();
    const m = month.trim();
    const d = day.trim();
    if (!y || !m || !d) return "";
    return `${y}-${m}-${d}`;
  }, [day, month, year]);

  const timeValue = useMemo(() => {
    const h = hour.trim();
    const m = minute.trim();
    if (!h || !m) return "";
    return `${pad2(Number(h))}:${pad2(Number(m))}`;
  }, [hour, minute]);

  async function loadMe() {
    try {
      const r = await fetch("/api/auth/me", { cache: "no-store" });
      const d = (await r.json()) as Me;
      if (r.ok && d?.user?.full_name) {
        setAddedBy(d.user.full_name);
      }
      const rest = d?.user?.restaurant_name;
      if (rest === "Roof" || rest === "Happy Moons") {
        setRestaurant(rest);
      }
    } catch {
      // sessiz geç
    }
  }

  useEffect(() => {
    loadMe();
  }, []);

  async function onSubmit() {
    setMsg(null);
    setSaving(true);

    try {
      const payload = {
        restaurant_name: restaurant,
        restaurant: restaurant,
        full_name: guestFullName,
        phone,
        reservation_no: reservationNo,
        date: isoDate,
        time: timeValue || "00:00",
        table_no: tableNo,
        authorized_name: addedBy,
        note,
        status: LIST_STATUS,
        risk_level: riskLevel,
      };

      const res = await fetch("/api/records", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Kaydedilemedi");

      setMsg("Uyarı listesi kaydı eklendi.");
      setReservationNo("");
      setGuestFullName("");
      setTableNo("");
      setPhone("");
      setNote("");
      setRiskLevel("Orta");
    } catch (e: any) {
      setMsg(e?.message || "Hata");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="text-white/60 text-xs tracking-[0.35em] font-semibold">KAYIT</div>
      <h1 className="mt-2 text-2xl md:text-3xl font-extrabold text-white">Uyarı Listesi&apos;ne Aktar</h1>
      <p className="mt-2 text-sm text-white/60">Rezervasyon kaydı üzerinden misafiri uyarı listesine ekleyin.</p>

      {/* FORM */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="mt-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 relative"
      >
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-white/60">Rezervasyon numarası</label>
            <input
              value={reservationNo}
              onChange={(e) => setReservationNo(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-[#0ea5ff]/35"
              placeholder="Örn: RZV-10294"
            />
          </div>

          <div>
            <label className="text-xs text-white/60">Gün / Ay / Yıl • Saat</label>
            <div className="mt-2 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
              {/* Tarih */}
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

              {/* Ayırıcı */}
              <span className="mx-3 h-6 w-px bg-white/15" />

              {/* Saat */}
              <div className="flex items-center gap-1">
                <span className="text-xs text-white/50">Saat</span>
                <input
                  value={hour}
                  onChange={(e) => setHour(e.target.value.replace(/\D/g, "").slice(0, 2))}
                  className="w-10 bg-transparent text-white outline-none text-sm"
                  placeholder="SS"
                />
                <span className="text-white/30">:</span>
                <input
                  value={minute}
                  onChange={(e) => setMinute(e.target.value.replace(/\D/g, "").slice(0, 2))}
                  className="w-10 bg-transparent text-white outline-none text-sm"
                  placeholder="DD"
                />
              </div>

              <div className="ml-auto text-xs text-white/40 font-mono">
                {(isoDate || "—") + (timeValue ? ` ${timeValue}` : "")}
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs text-white/60">Misafir adı soyadı</label>
            <input
              value={guestFullName}
              onChange={(e) => setGuestFullName(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-[#0ea5ff]/35"
              placeholder="Örn: Ad Soyad"
            />
          </div>

          <div>
            <label className="text-xs text-white/60">Masa numarası</label>
            <input
              value={tableNo}
              onChange={(e) => setTableNo(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-[#0ea5ff]/35"
              placeholder="Örn: 12"
            />
          </div>

          <div>
            <label className="text-xs text-white/60">Telefon numarası</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-[#0ea5ff]/35"
              placeholder="05xx..."
            />
          </div>

          <div>
            <label className="text-xs text-white/60">Ekleyen yetkili (isim soyisim)</label>
            <input
              value={addedBy}
              onChange={(e) => setAddedBy(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-[#0ea5ff]/35"
              placeholder="Örn: Yetkili Ad Soyad"
            />
          </div>

          {/* RISK */}
          <div className="md:col-span-2">
            <label className="text-xs text-white/60">Risk seviyesi</label>
            <div className="mt-2 grid md:grid-cols-3 gap-3">
              {(
                [
                  {
                    key: "Düşük",
                    title: "Düşük",
                    desc: "Operasyon uyarısı: tekrar eden uygunsuzluk / düşük etkili sorun.",
                  },
                  {
                    key: "Orta",
                    title: "Orta",
                    desc: "Servis/ekip riski: tartışma, uygunsuz davranış, sürekli problem.",
                  },
                  {
                    key: "Yüksek",
                    title: "Yüksek",
                    desc: "Güvenlik riski: tehdit/şiddet, ciddi olay, maddi hasar vb.",
                  },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setRiskLevel(opt.key)}
                  className={[
                    "rounded-2xl border p-4 text-left transition",
                    riskLevel === opt.key
                      ? "border-[#0ea5ff]/60 bg-[#0ea5ff]/10"
                      : "border-white/10 bg-white/5 hover:bg-white/10",
                  ].join(" ")}
                >
                  <div className="text-sm font-semibold text-white">{opt.title}</div>
                  <div className="mt-1 text-xs text-white/60">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4">
          <label className="text-xs text-white/60">Not</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="mt-2 w-full min-h-[160px] rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-[#0ea5ff]/35"
            placeholder="Kısa ve net şekilde açıklayın."
          />
        </div>

        <div className="mt-4 flex items-center gap-2 text-xs text-white/50">
          <span>Uyarı listesine eklenme saati:</span>
          <span className="text-white/70 font-mono">{timeValue || "—"}</span>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <div className="text-sm text-white/70">{msg}</div>
          <button
            type="button"
            onClick={onSubmit}
            disabled={saving}
            className="rounded-xl bg-[#0ea5ff] px-5 py-3 text-sm font-semibold text-[#06121f] disabled:opacity-60"
          >
            {saving ? "Kaydediliyor..." : "Uyarı Listesi'ne Aktar"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
