"use client";

import Link from "next/link";

type ReservationRow = any; // Using simplified type

type ProReservationsTableProps = {
    rows: ReservationRow[];
    loading: boolean;
    dateLabel: string;
    restaurantLabel: string;
};

export default function ProReservationsTable({ rows, loading, dateLabel, restaurantLabel }: ProReservationsTableProps) {
    return (
        <div className="flex flex-col h-full rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
                <div>
                    <h2 className="text-lg font-bold text-slate-800">Rezervasyon Akışı</h2>
                    <div className="text-xs text-slate-500 mt-1">{dateLabel} — {restaurantLabel}</div>
                </div>
                <div className="flex gap-2">
                    <Link href="/panel/rezervasyon" className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-blue-300 bg-white hover:bg-blue-50 text-xs font-semibold text-slate-600 hover:text-blue-700 transition-all shadow-sm">
                        Oluştur
                    </Link>
                    <Link href="/panel/rezervasyon/duzenle" className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-blue-300 bg-white hover:bg-blue-50 text-xs font-semibold text-slate-600 hover:text-blue-700 transition-all shadow-sm">
                        Düzenle
                    </Link>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto min-h-[400px]">
                {loading ? (
                    <div className="flex h-full items-center justify-center text-slate-500 text-sm">Yükleniyor...</div>
                ) : rows.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center p-8 text-center">
                        <div className="text-slate-300 text-4xl mb-3">∅</div>
                        <div className="text-slate-500 font-medium">Kayıt bulunamadı.</div>
                        <div className="text-slate-400 text-sm mt-1">Seçili filtreler için rezervasyon yok.</div>
                    </div>
                ) : (
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-500 sticky top-0 z-10 box-decoration-clone">
                            <tr>
                                <th className="px-6 py-3 font-bold tracking-wider w-24 border-b border-slate-200">Saat</th>
                                <th className="px-6 py-3 font-bold tracking-wider border-b border-slate-200">Misafir</th>
                                <th className="px-6 py-3 font-bold tracking-wider hidden sm:table-cell border-b border-slate-200">Detay</th>
                                <th className="px-6 py-3 font-bold tracking-wider hidden md:table-cell border-b border-slate-200">Not</th>
                                <th className="px-6 py-3 font-bold tracking-wider w-24 text-right border-b border-slate-200">İşlem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-600">
                            {rows.map((r: any, i: number) => (
                                <tr key={r.reservation_id || i} className="group hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 align-top">
                                        <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded text-xs border border-blue-100">
                                            {String(r.time || "").slice(0, 5) || "--:--"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 align-top">
                                        <div className="font-bold text-slate-800 mb-0.5">{r.customer_full_name || "-"}</div>
                                        <div className="text-xs text-slate-500 font-mono tracking-tight">{r.customer_phone}</div>
                                    </td>
                                    <td className="px-6 py-4 align-top hidden sm:table-cell">
                                        <div className="text-xs space-y-1">
                                            <div className="flex items-center gap-1.5"><span className="text-slate-400 w-16 uppercase text-[10px] font-bold tracking-widest">Masa</span> <span className="text-slate-700 font-medium">{r.table_no || "-"}</span></div>
                                            <div className="flex items-center gap-1.5"><span className="text-slate-400 w-16 uppercase text-[10px] font-bold tracking-widest">Çocuk</span> <span className="text-slate-700 font-medium">{r.kids_u7 || "0"}</span></div>
                                            <div className="flex items-center gap-1.5"><span className="text-slate-400 w-16 uppercase text-[10px] font-bold tracking-widest">Rez No</span> <span className="text-slate-500 font-mono text-[10px]">{r.reservation_no}</span></div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 align-top hidden md:table-cell max-w-[200px]">
                                        {r.note ? (
                                            <div className="text-xs text-slate-500 italic leading-relaxed line-clamp-2 bg-slate-50 p-1.5 rounded">
                                                "{r.note}"
                                            </div>
                                        ) : (
                                            <span className="text-slate-300 text-xs">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 align-top text-right">
                                        <Link
                                            href="/panel/rezervasyon/duzenle"
                                            className="opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-lg shadow-blue-500/20"
                                        >
                                            Düzenle
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
