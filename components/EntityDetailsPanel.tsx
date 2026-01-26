"use client";

import React, { useState } from "react";
import { type PlanEntity, type EntityStatus, STATUS_COLORS } from "@/lib/roofPlanData";

interface Props {
    entity: PlanEntity | null;
    onStatusChange: (id: string, status: EntityStatus) => void;
    onCapacityChange: (id: string, capacity: number) => void;
    onClose: () => void;
}

const STATUS_OPTIONS: { value: EntityStatus; label: string }[] = [
    { value: "available", label: "Boş" },
    { value: "reserved", label: "Rezerve" },
    { value: "occupied", label: "Dolu" },
    { value: "blocked", label: "Bloke" },
];

export default function EntityDetailsPanel({ entity, onStatusChange, onCapacityChange, onClose }: Props) {
    const [note, setNote] = useState("");

    if (!entity) {
        return (
            <div className="w-72 bg-[#0c1220] border-l border-white/10 p-4 flex flex-col items-center justify-center text-white/40 text-sm">
                <svg className="w-10 h-10 mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
                <div>Masa seçin</div>
            </div>
        );
    }

    const statusColor = STATUS_COLORS[entity.status];
    const kindLabels = { table: "Masa", lounge: "Loca", booth: "Booth" };

    return (
        <div className="w-72 bg-[#0c1220] border-l border-white/10 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-3 py-2.5">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-xs" style={{ backgroundColor: statusColor.fill }}>
                        {entity.id}
                    </div>
                    <div>
                        <div className="text-white font-semibold text-sm">{entity.id}</div>
                        <div className="text-white/50 text-[10px]">{kindLabels[entity.kind]}</div>
                    </div>
                </div>
                <button onClick={onClose} className="p-1 rounded hover:bg-white/10 text-white/60 hover:text-white" aria-label="Kapat">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 p-3 space-y-4 overflow-y-auto">
                {/* Durum */}
                <div>
                    <label className="text-white/60 text-[10px] font-medium block mb-1.5">Durum</label>
                    <div className="grid grid-cols-2 gap-1.5">
                        {STATUS_OPTIONS.map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => onStatusChange(entity.id, opt.value)}
                                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded border text-[11px] transition ${entity.status === opt.value ? "border-white/30 bg-white/10" : "border-white/10 bg-white/5 hover:bg-white/10"}`}
                            >
                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[opt.value].fill }} />
                                <span className="text-white">{opt.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Kapasite */}
                <div>
                    <label className="text-white/60 text-[10px] font-medium block mb-1.5">Kapasite</label>
                    <div className="flex items-center gap-1.5">
                        <button onClick={() => onCapacityChange(entity.id, Math.max(1, entity.capacity - 1))} className="w-8 h-8 rounded border border-white/10 bg-white/5 hover:bg-white/10 text-white text-sm font-bold">−</button>
                        <div className="flex-1 h-8 rounded border border-white/10 bg-white/5 flex items-center justify-center text-white text-sm font-medium">{entity.capacity} kişi</div>
                        <button onClick={() => onCapacityChange(entity.id, Math.min(12, entity.capacity + 1))} className="w-8 h-8 rounded border border-white/10 bg-white/5 hover:bg-white/10 text-white text-sm font-bold">+</button>
                    </div>
                </div>

                {/* Koordinatlar */}
                <div>
                    <label className="text-white/60 text-[10px] font-medium block mb-1.5">Konum (px)</label>
                    <div className="grid grid-cols-4 gap-1 text-[10px]">
                        <div className="px-2 py-1.5 rounded bg-white/5 border border-white/10 text-white/70 text-center">x:{entity.x}</div>
                        <div className="px-2 py-1.5 rounded bg-white/5 border border-white/10 text-white/70 text-center">y:{entity.y}</div>
                        <div className="px-2 py-1.5 rounded bg-white/5 border border-white/10 text-white/70 text-center">w:{entity.w}</div>
                        <div className="px-2 py-1.5 rounded bg-white/5 border border-white/10 text-white/70 text-center">h:{entity.h}</div>
                    </div>
                </div>

                {/* Not */}
                <div>
                    <label className="text-white/60 text-[10px] font-medium block mb-1.5">Not</label>
                    <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        className="w-full h-20 rounded border border-white/10 bg-white/5 text-white text-[11px] p-2 resize-none focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
                        placeholder="Not ekle..."
                    />
                </div>
            </div>

            {/* Footer */}
            <div className="border-t border-white/10 p-3">
                <button onClick={onClose} className="w-full py-2 rounded bg-cyan-600 text-[#06121f] font-semibold text-xs hover:bg-cyan-500 transition">Kaydet</button>
            </div>
        </div>
    );
}
