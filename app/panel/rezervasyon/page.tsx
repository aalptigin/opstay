"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

type ReservationRow = {
  reservation_id?: string;

  restaurant?: "Happy Moons" | "Roof";

  reservation_no?: string;
  table_no?: string;

  date?: string; // YYYY-MM-DD
  time?: string; // HH:mm

  customer_full_name?: string;
  customer_phone?: string;

  child_u7_count?: string; // sadece Happy Moons
  staff_full_name?: string;

  note?: string;

  // eski alanlar gelebilir (geriye uyumluluk)
  datetime?: string;
  full_name?: string;
  phone?: string;
};

export default function ReservationsPage() {
  const [rows, setRows] = useState<ReservationRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // Restoran seçimi (buton + mini menü)
  const [restaurant, setRestaurant] = useState<"Happy Moons" | "Roof">("Happy Moons");
  const [restaurantOpen, setRestaurantOpen] = useState(false);

  // Form state
  const now = new Date();
  const yyyy = String(now.getFullYear());
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");

  // 2) Gün/Ay/Yıl yerine -> Rezervasyon No
  const [reservationNo, setReservationNo] = useState("");

  // 3) Saat yerine -> Masa No
  const [tableNo, setTableNo] = useState("");

  // 4) İsim Soyisim yerine -> Gün/Ay/Yıl (date)
  const [date, setDate] = useState(`${yyyy}-${mm}-${dd}`);

  // 5) Numara yerine -> Saat
  const [time, setTime] = useState("19:00");

  // 6) Gün/Ay/Yıl altına -> Müşteri Ad Soyad
  const [customerFullName, setCustomerFullName] = useState("");

  // 7) Saat altına -> Müşteri Telefon
  const [customerPhone, setCustomerPhone] = useState("");

  // 8) 7 yaş altı çocuk sayısı (sadece Happy Moons)
  const [childU7Count, setChildU7Count] = useState("");

  // 9) Rezervasyonu alan yetkili isim soyisim
  const [staffFullName, setStaffFullName] = useState("");

  // Sonuncusu: müşteri notu
  const [note, setNote] = useState("");

  const datetimeISO = useMemo(() => {
    // Backend halen datetime bekliyorsa diye ISO da üretip gönderiyoruz.
    // YYYY-MM-DDTHH:mm:00
    const d = (date || "").trim();
    const t = (time || "").trim();
    if (!d || !t) return "";
    return `${d}T${t}:00`;
  }, [date, time]);

  async function load() {
    setMsg(null);
    setLoading(true);
    try {
      const res = await fetch("/api/reservations", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Rezervasyonlar alınamadı");
      setRows(data.rows || []);
    } catch (e: any) {
      setMsg(e?.message || "Hata");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function createReservation() {
    setMsg(null);
    setLoading(true);

    try {
      const payload: any = {
        restaurant,

        reservation_no: reservationNo,
        table_no: tableNo,

        date,
        time,

        customer_full_name: customerFullName,
        customer_phone: customerPhone,

        staff_full_name: staffFullName,
        note,

        // geriye uyumluluk (backend eski alanları kullanıyorsa)
        datetime: datetimeISO,
        full_name: customerFullName,
        phone: customerPhone,
      };

      // child_u7_count sadece Happy Moons
      if (restaurant === "Happy Moons") payload.child_u7_count = childU7Count;

      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Rezervasyon oluşturulamadı");

      setMsg("Rezervasyon oluşturuldu.");

      setReservationNo("");
      setTableNo("");
      setDate(`${yyyy}-${mm}-${dd}`);
      setTime("19:00");
      setCustomerFullName("");
      setCustomerPhone("");
      setChildU7Count("");
      setStaffFullName("");
      setNote("");

      await load();
    } catch (e: any) {
      setMsg(e?.message || "Hata");
    } finally {
      setLoading(false);
    }
  }

  // Listeyi ekranda tutarlı göstermek için (bazı kayıtlar eski format olabilir)
  function viewDate(r: ReservationRow) {
    if (r.date) return r.date;
    if (r.datetime) return String(r.datetime).slice(0, 10);
    return "-";
  }
  function viewTime(r: ReservationRow) {
    if (r.time) return r.time;
    if (r.datetime) return String(r.datetime).slice(11, 16);
    return "-";
  }
  function viewCustomerName(r: ReservationRow) {
    return r.customer_full_name || r.full_name || "-";
  }
  function viewCustomerPhone(r: ReservationRow) {
    return r.customer_phone || r.phone || "-";
  }

  return (
    <div>
      <div className="text-white/60 text-xs tracking-[0.35em] font-semibold">REZERVASYON</div>
      <h1 className="mt-2 text-2xl md:text-3xl font-extrabold text-white">Rezervasyon Oluştur</h1>
      <p className="mt-2 text-sm text-white/60">
        Restoran seçimi ile birlikte rezervasyon bilgilerini kaydedin.
      </p>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="mt-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 relative"
      >
        {/* 1) Sağ üst: Restoran seçimi (aykırı görünüm) */}
        <div className="absolute -top-4 right-4 z-20">
          <div className="relative">
            <button
              type="button"
              onClick={() => setRestaurantOpen((v) => !v)}
              className="rounded-xl border border-white/15 bg-[#050B14]/90 px-4 py-2 text-sm text-white/90 shadow-lg backdrop-blur"
              title="Restoran seç"
            >
              {restaurant} ▾
            </button>

            {restaurantOpen && (
              <div className="absolute right-0 mt-2 w-44 rounded-xl border border-white/10 bg-[#050B14]/95 backdrop-blur shadow-xl overflow-hidden">
                {(["Happy Moons", "Roof"] as const).map((x) => (
                  <button
                    key={x}
                    type="button"
                    onClick={() => {
                      setRestaurant(x);
                      setRestaurantOpen(false);
                      // Roof seçilince çocuk alanını otomatik boşalt
                      if (x === "Roof") setChildU7Count("");
                    }}
                    className={[
                      "w-full text-left px-4 py-3 text-sm",
                      restaurant === x ? "bg-white/10 text-white" : "text-white/80 hover:bg-white/5",
                    ].join(" ")}
                  >
                    {x}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* FORM GRID */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* 2) Rezervasyon No */}
          <div>
            <label className="text-xs text-white/60">Rezervasyon numarası</label>
            <input
              value={reservationNo}
              onChange={(e) => setReservationNo(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-[#0ea5ff]/35"
              placeholder="Örn: RZV-1024"
            />
          </div>

          {/* 3) Masa No */}
          <div>
            <label className="text-xs text-white/60">Masa numarası</label>
            <input
              value={tableNo}
              onChange={(e) => setTableNo(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-[#0ea5ff]/35"
              placeholder="Örn: 12"
              inputMode="numeric"
            />
          </div>

          {/* 4) Gün/Ay/Yıl (date) */}
          <div>
            <label className="text-xs text-white/60">Gün / Ay / Yıl</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-[#0ea5ff]/35"
            />
            {/* 6) altına müşteri adı */}
            <div className="mt-3">
              <label className="text-xs text-white/60">Müşteri isim soyisim</label>
              <input
                value={customerFullName}
                onChange={(e) => setCustomerFullName(e.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-[#0ea5ff]/35"
                placeholder="Örn: Burak Yılmaz"
              />
            </div>
          </div>

          {/* 5) Saat (time) */}
          <div>
            <label className="text-xs text-white/60">Saat</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-[#0ea5ff]/35"
            />
            {/* 7) altına müşteri telefon */}
            <div className="mt-3">
              <label className="text-xs text-white/60">Müşteri telefon numarası</label>
              <input
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-[#0ea5ff]/35"
                placeholder="05xx..."
                inputMode="tel"
              />
            </div>
          </div>

          {/* 8) 7 yaş altı çocuk sayısı (sadece Happy Moons) */}
          {restaurant === "Happy Moons" && (
            <div>
              <label className="text-xs text-white/60">7 yaş altı çocuk sayısı</label>
              <input
                value={childU7Count}
                onChange={(e) => setChildU7Count(e.target.value.replace(/\D/g, "").slice(0, 2))}
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-[#0ea5ff]/35"
                placeholder="0"
                inputMode="numeric"
              />
            </div>
          )}

          {/* 9) Yetkili adı */}
          <div>
            <label className="text-xs text-white/60">Rezervasyonu alan yetkili (isim soyisim)</label>
            <input
              value={staffFullName}
              onChange={(e) => setStaffFullName(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-[#0ea5ff]/35"
              placeholder="Örn: Operasyon Personeli"
            />
          </div>
        </div>

        {/* Not */}
        <div className="mt-4">
          <label className="text-xs text-white/60">Müşteri notu</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="mt-2 w-full min-h-[120px] rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-[#0ea5ff]/35"
            placeholder="Kısa not..."
          />
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <div className="text-sm text-white/70">{msg}</div>
          <button
            type="button"
            onClick={createReservation}
            disabled={loading}
            className="rounded-xl bg-[#0ea5ff] px-5 py-3 text-sm font-semibold text-[#06121f] disabled:opacity-60"
          >
            {loading ? "Kaydediliyor..." : "Rezervasyon oluştur"}
          </button>
        </div>
      </motion.div>

      {/* Liste */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="mt-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden"
      >
        <div className="px-5 py-4 flex items-center justify-between">
          <div className="text-white font-semibold">Rezervasyonlar</div>
          <button type="button" onClick={load} className="text-sm text-white/70 hover:text-white">
            Yenile
          </button>
        </div>

        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="text-white/55">
              <tr className="border-t border-white/10">
                <th className="text-left px-5 py-3 whitespace-nowrap">Restoran</th>
                <th className="text-left px-5 py-3 whitespace-nowrap">Rez. No</th>
                <th className="text-left px-5 py-3 whitespace-nowrap">Masa</th>
                <th className="text-left px-5 py-3 whitespace-nowrap">Gün/Ay/Yıl</th>
                <th className="text-left px-5 py-3 whitespace-nowrap">Saat</th>
                <th className="text-left px-5 py-3 whitespace-nowrap">Müşteri</th>
                <th className="text-left px-5 py-3 whitespace-nowrap">Telefon</th>
                <th className="text-left px-5 py-3 whitespace-nowrap">Çocuk (7-)</th>
                <th className="text-left px-5 py-3 whitespace-nowrap">Yetkili</th>
                <th className="text-left px-5 py-3 whitespace-nowrap">Not</th>
              </tr>
            </thead>

            <tbody className="text-white/85">
              {rows.map((r, idx) => (
                <tr key={(r.reservation_id || "") + idx} className="border-t border-white/10">
                  <td className="px-5 py-3 text-white/70 whitespace-nowrap">{r.restaurant || "-"}</td>
                  <td className="px-5 py-3 whitespace-nowrap">{r.reservation_no || "-"}</td>
                  <td className="px-5 py-3 text-white/70 whitespace-nowrap">{r.table_no || "-"}</td>
                  <td className="px-5 py-3 text-white/70 whitespace-nowrap">{viewDate(r)}</td>
                  <td className="px-5 py-3 text-white/70 whitespace-nowrap">{viewTime(r)}</td>
                  <td className="px-5 py-3 whitespace-nowrap">{viewCustomerName(r)}</td>
                  <td className="px-5 py-3 text-white/70 whitespace-nowrap">{viewCustomerPhone(r)}</td>
                  <td className="px-5 py-3 text-white/70 whitespace-nowrap">
                    {r.restaurant === "Happy Moons" ? (r.child_u7_count || "-") : "-"}
                  </td>
                  <td className="px-5 py-3 text-white/70 whitespace-nowrap">{r.staff_full_name || "-"}</td>
                  <td className="px-5 py-3 text-white/70 min-w-[260px]">{r.note || "-"}</td>
                </tr>
              ))}

              {rows.length === 0 && (
                <tr className="border-t border-white/10">
                  <td className="px-5 py-10 text-white/55" colSpan={10}>
                    Kayıt yok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
