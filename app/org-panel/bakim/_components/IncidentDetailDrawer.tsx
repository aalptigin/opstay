"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Incident, WorkOrder, IncidentComment, IncidentStatus } from "@/lib/incidents/types";

interface IncidentDetailDrawerProps {
    incidentId: string | null;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: () => void;
}

const STATUS_OPTIONS: { value: IncidentStatus; label: string; color: string }[] = [
    { value: "OPEN", label: "Açık", color: "bg-red-500" },
    { value: "IN_PROGRESS", label: "Devam Ediyor", color: "bg-blue-500" },
    { value: "RESOLVED", label: "Çözüldü", color: "bg-green-500" },
];

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("tr-TR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export function IncidentDetailDrawer({
    incidentId,
    isOpen,
    onClose,
    onUpdate,
}: IncidentDetailDrawerProps) {
    const [loading, setLoading] = useState(true);
    const [incident, setIncident] = useState<Incident | null>(null);
    const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
    const [comments, setComments] = useState<IncidentComment[]>([]);
    const [newComment, setNewComment] = useState("");
    const [commentLoading, setCommentLoading] = useState(false);
    const [statusLoading, setStatusLoading] = useState(false);

    useEffect(() => {
        if (incidentId && isOpen) {
            loadDetail();
        }
    }, [incidentId, isOpen]);

    const loadDetail = async () => {
        if (!incidentId) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/incidents/${incidentId}`);
            const data = await res.json();
            if (data.ok) {
                setIncident(data.item);
                setWorkOrders(data.workOrders || []);
                setComments(data.comments || []);
            }
        } catch (err) {
            console.error("Load detail error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (newStatus: IncidentStatus) => {
        if (!incidentId || statusLoading) return;
        setStatusLoading(true);
        try {
            const res = await fetch(`/api/incidents/${incidentId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) {
                await loadDetail();
                onUpdate();
            }
        } catch (err) {
            console.error("Status update error:", err);
        } finally {
            setStatusLoading(false);
        }
    };

    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!incidentId || !newComment.trim()) return;
        setCommentLoading(true);
        try {
            const res = await fetch(`/api/incidents/${incidentId}/comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ body: newComment }),
            });
            if (res.ok) {
                setNewComment("");
                await loadDetail();
            }
        } catch (err) {
            console.error("Add comment error:", err);
        } finally {
            setCommentLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex justify-end">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                    onClick={onClose}
                />

                <motion.div
                    initial={{ x: "100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="relative bg-white w-full max-w-lg shadow-2xl flex flex-col"
                >
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-slate-800">
                            {loading ? "Yükleniyor..." : incident?.refNo || "Detay"}
                        </h2>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-lg bg-white shadow flex items-center justify-center text-slate-400 hover:text-slate-600"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="w-8 h-8 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : incident ? (
                            <>
                                {/* Title & Description */}
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${incident.type === "INCIDENT" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                                            }`}>
                                            {incident.type === "INCIDENT" ? "Arıza" : "Bakım"}
                                        </span>
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${incident.severity === "HIGH" ? "bg-red-100 text-red-700" :
                                                incident.severity === "MED" ? "bg-amber-100 text-amber-700" :
                                                    "bg-slate-100 text-slate-600"
                                            }`}>
                                            {incident.severity === "HIGH" ? "Yüksek" : incident.severity === "MED" ? "Orta" : "Düşük"}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-semibold text-slate-800 mb-2">{incident.title}</h3>
                                    <p className="text-slate-600">{incident.description}</p>
                                </div>

                                {/* Status Control */}
                                <div className="bg-slate-50 rounded-xl p-4">
                                    <label className="block text-xs font-medium text-slate-600 mb-2">Durum</label>
                                    <div className="flex gap-2">
                                        {STATUS_OPTIONS.map((opt) => (
                                            <button
                                                key={opt.value}
                                                onClick={() => handleStatusChange(opt.value)}
                                                disabled={statusLoading || incident.status === opt.value}
                                                className={`flex-1 py-2 rounded-lg font-medium text-sm transition ${incident.status === opt.value
                                                        ? `${opt.color} text-white`
                                                        : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                                                    } disabled:opacity-50`}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Info Grid */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-50 rounded-lg p-3">
                                        <p className="text-xs text-slate-500 mb-1">Bildiren</p>
                                        <p className="font-medium text-slate-800">{incident.createdBy.name}</p>
                                    </div>
                                    <div className="bg-slate-50 rounded-lg p-3">
                                        <p className="text-xs text-slate-500 mb-1">Sorumlu</p>
                                        <p className="font-medium text-slate-800">
                                            {incident.assignedTo?.name || "Atanmadı"}
                                        </p>
                                    </div>
                                    <div className="bg-slate-50 rounded-lg p-3">
                                        <p className="text-xs text-slate-500 mb-1">Oluşturulma</p>
                                        <p className="font-medium text-slate-800">{formatDate(incident.createdAt)}</p>
                                    </div>
                                    <div className="bg-slate-50 rounded-lg p-3">
                                        <p className="text-xs text-slate-500 mb-1">Hedef Tarih</p>
                                        <p className="font-medium text-slate-800">
                                            {incident.dueAt ? formatDate(incident.dueAt) : "—"}
                                        </p>
                                    </div>
                                </div>

                                {/* Work Orders */}
                                {workOrders.length > 0 && (
                                    <div>
                                        <h4 className="font-semibold text-slate-800 mb-3">İş Emirleri</h4>
                                        <div className="space-y-2">
                                            {workOrders.map((wo) => (
                                                <div key={wo.id} className="bg-slate-50 rounded-lg p-3 flex items-center justify-between">
                                                    <div>
                                                        <p className="font-medium text-slate-800">{wo.title}</p>
                                                        <p className="text-xs text-slate-500">
                                                            {wo.assignedTo?.name || "Atanmadı"}
                                                        </p>
                                                    </div>
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${wo.status === "DONE" ? "bg-green-100 text-green-700" :
                                                            wo.status === "IN_PROGRESS" ? "bg-blue-100 text-blue-700" :
                                                                "bg-slate-100 text-slate-600"
                                                        }`}>
                                                        {wo.status === "DONE" ? "Tamamlandı" : wo.status === "IN_PROGRESS" ? "Devam Ediyor" : "Açık"}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Comments Timeline */}
                                <div>
                                    <h4 className="font-semibold text-slate-800 mb-3">Aktivite</h4>

                                    {/* Add comment form */}
                                    <form onSubmit={handleAddComment} className="mb-4">
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={newComment}
                                                onChange={(e) => setNewComment(e.target.value)}
                                                placeholder="Yorum ekle..."
                                                className="flex-1 px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm"
                                            />
                                            <button
                                                type="submit"
                                                disabled={commentLoading || !newComment.trim()}
                                                className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium text-sm hover:bg-blue-600 disabled:opacity-50"
                                            >
                                                {commentLoading ? "..." : "Gönder"}
                                            </button>
                                        </div>
                                    </form>

                                    {/* Comments list */}
                                    <div className="space-y-3">
                                        {comments.map((comment) => (
                                            <div key={comment.id} className="flex gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${comment.kind === "COMMENT" ? "bg-slate-400" :
                                                        comment.kind === "STATUS_CHANGE" ? "bg-blue-400" :
                                                            comment.kind === "ASSIGNMENT" ? "bg-purple-400" :
                                                                "bg-amber-400"
                                                    }`}>
                                                    {comment.createdBy.name.charAt(0)}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm text-slate-800">{comment.body}</p>
                                                    <p className="text-xs text-slate-400 mt-0.5">
                                                        {comment.createdBy.name} • {formatDate(comment.createdAt)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                        {comments.length === 0 && (
                                            <p className="text-sm text-slate-400 text-center py-4">Henüz aktivite yok</p>
                                        )}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-12 text-slate-500">Kayıt bulunamadı</div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
