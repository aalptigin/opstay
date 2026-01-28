"use client";

import { LeaveRequest, LEAVE_STATUS_LABELS, LEAVE_STATUS_COLORS, LeaveStatus } from "@/lib/leave/types";
import { formatDate } from "@/lib/audit/utils";
import { useState } from "react";

interface LeaveDetailPanelProps {
    request: LeaveRequest | null;
    canApprove: boolean;
    onAction: (id: string, action: "approve" | "reject", data?: any) => Promise<void>;
}

export function LeaveDetailPanel({ request, canApprove, onAction }: LeaveDetailPanelProps) {
    const [processing, setProcessing] = useState(false);
    const [rejectReason, setRejectReason] = useState("");
    const [showRejectForm, setShowRejectForm] = useState(false);

    if (!request) {
        return (
            <div className="h-full flex items-center justify-center text-slate-400 p-8 text-center bg-slate-50/50">
                <div>
                    <span className="text-4xl block mb-2">👈</span>
                    <p>Detaylarını görmek için soldan bir talep seçin.</p>
                </div>
            </div>
        );
    }

    const handleApprove = async () => {
        if (!confirm("Eminsiniz?")) return;
        setProcessing(true);
        await onAction(request.id, "approve");
        setProcessing(false);
    };

    const handleReject = async () => {
        if (!rejectReason) return alert("Sebep giriniz");
        setProcessing(true);
        await onAction(request.id, "reject", { reason: rejectReason });
        setProcessing(false);
        setShowRejectForm(false);
        setRejectReason("");
    };

    return (
        <div className="h-full bg-white flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-start">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 mb-1">{request.personName}</h2>
                    <p className="text-sm text-slate-500">{request.unitName || "-"}</p>
                </div>
                <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${LEAVE_STATUS_COLORS[request.status]}`}>
                        {LEAVE_STATUS_LABELS[request.status]}
                    </span>
                    <p className="text-xs text-slate-400 mt-2 font-mono">{request.requestNo}</p>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">

                {/* Dates */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                    <div>
                        <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Başlangıç</p>
                        <p className="text-lg font-bold text-slate-800">{formatDate(request.startDate)}</p>
                        <p className="text-xs text-slate-500">{request.startPart === "FULL" ? "Tam Gün" : request.startPart === "AM" ? "Sabah" : "Öğleden Sonra"}</p>
                    </div>
                    <div className="text-center px-4">
                        <span className="text-2xl text-slate-300">➜</span>
                        <p className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded mt-1">{request.totalDays} Gün</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Bitiş</p>
                        <p className="text-lg font-bold text-slate-800">{formatDate(request.endDate)}</p>
                        <p className="text-xs text-slate-500">{request.endPart === "FULL" ? "Tam Gün" : request.endPart === "AM" ? "Sabah" : "Öğleden Sonra"}</p>
                    </div>
                </div>

                {/* Description */}
                <div>
                    <h3 className="text-sm font-semibold text-slate-800 mb-2">Açıklama</h3>
                    <p className="text-slate-600 text-sm leading-relaxed p-4 bg-white border border-slate-200 rounded-lg">
                        {request.description}
                    </p>
                </div>

                {/* Approvals Timeline */}
                {request.approvals.length > 0 && (
                    <div>
                        <h3 className="text-sm font-semibold text-slate-800 mb-3">İşlem Geçmişi</h3>
                        <div className="space-y-3 pl-2 border-l-2 border-slate-100">
                            {request.approvals.map(app => (
                                <div key={app.id} className="pl-4 relative">
                                    <span className={`absolute -left-[5px] top-1.5 w-2 h-2 rounded-full ${app.decision === "APPROVED" ? "bg-green-500" : "bg-red-500"}`} />
                                    <p className="text-sm font-medium text-slate-800">{app.approverName}</p>
                                    <p className="text-xs text-slate-500 mb-1">{app.decision === "APPROVED" ? "Onayladı" : "Reddetti"} • {formatDate(app.decidedAt, true)}</p>
                                    {app.note && <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded mt-1 italic">"{app.note}"</p>}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Actions Footer */}
            {canApprove && request.status === LeaveStatus.PENDING && (
                <div className="p-6 border-t border-slate-100 bg-slate-50">
                    {!showRejectForm ? (
                        <div className="flex gap-3">
                            <button
                                onClick={handleApprove}
                                disabled={processing}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg font-semibold shadow-lg shadow-green-600/20 disabled:opacity-50 transition"
                            >
                                {processing ? "..." : "Onayla"}
                            </button>
                            <button
                                onClick={() => setShowRejectForm(true)}
                                disabled={processing}
                                className="flex-1 bg-white border border-red-200 text-red-600 hover:bg-red-50 py-2.5 rounded-lg font-semibold transition"
                            >
                                Reddet
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <textarea
                                autoFocus
                                className="w-full p-3 rounded-lg border border-slate-300 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
                                placeholder="Red sebebi belirtiniz (Zorunlu)..."
                                value={rejectReason}
                                onChange={e => setRejectReason(e.target.value)}
                                rows={3}
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowRejectForm(false)}
                                    className="px-4 py-2 text-slate-500 text-sm hover:bg-slate-100 rounded-lg"
                                >
                                    İptal
                                </button>
                                <button
                                    onClick={handleReject}
                                    disabled={!rejectReason || processing}
                                    className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50"
                                >
                                    {processing ? "..." : "Reddet ve Tamamla"}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
