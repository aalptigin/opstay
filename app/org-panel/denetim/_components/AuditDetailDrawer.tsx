"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AuditLog } from "@/lib/org/types";
import { formatDate } from "@/lib/audit/utils";
import { RESULT_COLORS, SEVERITY_COLORS, RESULT_LABELS, SEVERITY_LABELS } from "@/lib/audit/types";

interface AuditDetailDrawerProps {
    log: AuditLog | null;
    onClose: () => void;
}

export function AuditDetailDrawer({ log, onClose }: AuditDetailDrawerProps) {
    const [jsonTab, setJsonTab] = useState<"metadata" | "diff">("metadata");

    if (!log) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex justify-end">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/20 backdrop-blur-sm"
                    onClick={onClose}
                />

                {/* Drawer */}
                <motion.div
                    initial={{ x: "100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="relative w-full max-w-lg bg-white shadow-2xl h-full overflow-y-auto"
                >
                    {/* Header */}
                    <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
                        <div>
                            <p className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-1">
                                Olay ID: {log.id}
                            </p>
                            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <span>{log.action}</span>
                                {log.result === "FAIL" && <span className="text-red-500">❌</span>}
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="p-6 space-y-8">
                        {/* Summary */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                <span className="block text-xs text-slate-500 mb-1">Zaman</span>
                                <span className="font-semibold text-slate-800">
                                    {formatDate(log.createdAt, true)}
                                </span>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                <span className="block text-xs text-slate-500 mb-1">Kullanıcı (Actor)</span>
                                <span className="font-semibold text-slate-800 break-all">{log.actorId}</span>
                            </div>
                        </div>

                        {/* Badges */}
                        <div className="flex flex-wrap gap-2">
                            {log.module && (
                                <span className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-md border border-indigo-100">
                                    Module: {log.module}
                                </span>
                            )}
                            {log.severity && (
                                <span className={`px-2 py-1 text-xs font-medium rounded-md border ${SEVERITY_COLORS[log.severity] || "bg-slate-100"}`}>
                                    Severity: {SEVERITY_LABELS[log.severity]}
                                </span>
                            )}
                            {log.result && (
                                <span className={`px-2 py-1 text-xs font-medium rounded-md border ${RESULT_COLORS[log.result] || "bg-slate-100"}`}>
                                    Result: {RESULT_LABELS[log.result]}
                                </span>
                            )}
                        </div>

                        {/* Technical Details */}
                        <div className="space-y-3">
                            <h3 className="font-semibold text-slate-800 border-b border-slate-100 pb-2">Teknik Detaylar</h3>
                            <div className="grid grid-cols-[100px_1fr] gap-2 text-sm">
                                <span className="text-slate-500">IP Adresi:</span>
                                <span className="font-mono">{log.ip}</span>

                                {log.userAgent && (
                                    <>
                                        <span className="text-slate-500">User Agent:</span>
                                        <span className="font-mono text-xs text-slate-600 break-all">{log.userAgent}</span>
                                    </>
                                )}

                                <span className="text-slate-500">Entity:</span>
                                <span>
                                    <span className="font-medium">{log.entityType}</span>
                                    {log.entityId && <span className="text-slate-400 ml-1">#{log.entityId}</span>}
                                </span>

                                {log.correlationId && (
                                    <>
                                        <span className="text-slate-500">Correlation:</span>
                                        <span className="font-mono text-xs">{log.correlationId}</span>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Data Viewer */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-4 border-b border-slate-200">
                                <button
                                    onClick={() => setJsonTab("metadata")}
                                    className={`pb-2 text-sm font-medium border-b-2 transition ${jsonTab === "metadata" ? "border-slate-800 text-slate-800" : "border-transparent text-slate-500 hover:text-slate-800"}`}
                                >
                                    Metadata
                                </button>
                                {log.diff && (
                                    <button
                                        onClick={() => setJsonTab("diff")}
                                        className={`pb-2 text-sm font-medium border-b-2 transition ${jsonTab === "diff" ? "border-slate-800 text-slate-800" : "border-transparent text-slate-500 hover:text-slate-800"}`}
                                    >
                                        Değişiklikler (Diff)
                                    </button>
                                )}
                            </div>

                            <div className="bg-slate-900 rounded-xl p-4 overflow-x-auto text-xs font-mono text-emerald-400">
                                {jsonTab === "metadata" ? (
                                    <pre>{JSON.stringify(log.metadata || {}, null, 2)}</pre>
                                ) : (
                                    <pre>{JSON.stringify(log.diff || {}, null, 2)}</pre>
                                )}
                            </div>
                        </div>

                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
