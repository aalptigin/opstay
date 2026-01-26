"use client";

import React, { useState, useMemo } from "react";

// ============================================================================
// TİPLER
// ============================================================================
type EntityStatus = "available" | "reserved" | "occupied" | "blocked";
type EntityKind = "table" | "lounge" | "booth";

interface TableEntity {
    id: string;
    kind: EntityKind;
    x: number;
    y: number;
    w: number;
    h: number;
    capacity: number;
    status: EntityStatus;
}

// ============================================================================
// RENK ŞEMASI
// ============================================================================
const STATUS_COLORS: Record<EntityStatus, string> = {
    available: "#10b981",
    reserved: "#f59e0b",
    occupied: "#ef4444",
    blocked: "#374151",
};

// ============================================================================
// MASA/LOCA/BOOTH VERİLERİ - Görselden birebir
// ============================================================================
const TABLES: TableEntity[] = [
    // ========== ÜST SIRA SOL (T15, T17, T18) ==========
    { id: "T15", kind: "table", x: 70, y: 35, w: 55, h: 55, capacity: 4, status: "available" },
    { id: "T17", kind: "table", x: 140, y: 35, w: 55, h: 55, capacity: 4, status: "available" },
    { id: "T18", kind: "table", x: 210, y: 35, w: 55, h: 55, capacity: 4, status: "available" },

    // ========== ÜST SIRA ORTA (T20, T22, T24) ==========
    { id: "T20", kind: "table", x: 325, y: 35, w: 55, h: 55, capacity: 4, status: "available" },
    { id: "T22", kind: "table", x: 395, y: 35, w: 55, h: 55, capacity: 4, status: "available" },
    { id: "T24", kind: "table", x: 465, y: 35, w: 55, h: 55, capacity: 4, status: "available" },

    // ========== ÜST SIRA SAĞ - BAR YANI (T26, T28, T30) ==========
    { id: "T26", kind: "table", x: 640, y: 60, w: 55, h: 55, capacity: 4, status: "available" },
    { id: "T28", kind: "table", x: 710, y: 60, w: 55, h: 55, capacity: 4, status: "available" },
    { id: "T30", kind: "table", x: 780, y: 60, w: 55, h: 55, capacity: 4, status: "available" },

    // ========== 2. SIRA SOL (T14, T16, T19) ==========
    { id: "T14", kind: "table", x: 25, y: 105, w: 55, h: 55, capacity: 4, status: "available" },
    { id: "T16", kind: "table", x: 140, y: 105, w: 55, h: 55, capacity: 2, status: "available" },
    { id: "T19", kind: "table", x: 210, y: 105, w: 55, h: 55, capacity: 2, status: "available" },

    // ========== 2. SIRA ORTA (T21, T23) ==========
    { id: "T21", kind: "table", x: 325, y: 105, w: 55, h: 55, capacity: 2, status: "available" },
    { id: "T23", kind: "table", x: 395, y: 105, w: 55, h: 55, capacity: 2, status: "available" },

    // ========== 2. SIRA SAĞ (T25, T27, T29) ==========
    { id: "T25", kind: "table", x: 640, y: 130, w: 55, h: 55, capacity: 2, status: "available" },
    { id: "T27", kind: "table", x: 710, y: 130, w: 55, h: 55, capacity: 2, status: "available" },
    { id: "T29", kind: "table", x: 780, y: 130, w: 55, h: 55, capacity: 2, status: "available" },

    // ========== LOCA ÜST (L2, L4, L6, L8) ==========
    { id: "L2", kind: "lounge", x: 100, y: 215, w: 65, h: 55, capacity: 6, status: "available" },
    { id: "L4", kind: "lounge", x: 180, y: 215, w: 65, h: 55, capacity: 6, status: "available" },
    { id: "L6", kind: "lounge", x: 260, y: 215, w: 65, h: 55, capacity: 6, status: "available" },
    { id: "L8", kind: "lounge", x: 340, y: 215, w: 65, h: 55, capacity: 6, status: "available" },

    // ========== LOCA ALT (L1, L3, L5, L7) ==========
    { id: "L1", kind: "lounge", x: 100, y: 285, w: 65, h: 55, capacity: 6, status: "available" },
    { id: "L3", kind: "lounge", x: 180, y: 285, w: 65, h: 55, capacity: 6, status: "available" },
    { id: "L5", kind: "lounge", x: 260, y: 285, w: 65, h: 55, capacity: 6, status: "available" },
    { id: "L7", kind: "lounge", x: 340, y: 285, w: 65, h: 55, capacity: 6, status: "available" },

    // ========== T13 ==========
    { id: "T13", kind: "table", x: 455, y: 250, w: 55, h: 55, capacity: 4, status: "available" },

    // ========== BOOTH (B1-B6) ==========
    { id: "B1", kind: "booth", x: 530, y: 235, w: 50, h: 45, capacity: 4, status: "available" },
    { id: "B2", kind: "booth", x: 590, y: 235, w: 50, h: 45, capacity: 4, status: "available" },
    { id: "B3", kind: "booth", x: 650, y: 235, w: 50, h: 45, capacity: 4, status: "available" },
    { id: "B4", kind: "booth", x: 710, y: 235, w: 50, h: 45, capacity: 4, status: "available" },
    { id: "B5", kind: "booth", x: 770, y: 235, w: 50, h: 45, capacity: 4, status: "blocked" },
    { id: "B6", kind: "booth", x: 830, y: 235, w: 50, h: 45, capacity: 4, status: "blocked" },

    // ========== ALT SOL (T1) ==========
    { id: "T1", kind: "table", x: 25, y: 360, w: 55, h: 70, capacity: 4, status: "available" },

    // ========== ALT SIRA (T3, T5, T7, T9, T11) ==========
    { id: "T3", kind: "table", x: 120, y: 360, w: 55, h: 55, capacity: 2, status: "available" },
    { id: "T5", kind: "table", x: 190, y: 360, w: 55, h: 55, capacity: 2, status: "available" },
    { id: "T7", kind: "table", x: 260, y: 360, w: 55, h: 55, capacity: 2, status: "available" },
    { id: "T9", kind: "table", x: 330, y: 360, w: 55, h: 55, capacity: 2, status: "available" },
    { id: "T11", kind: "table", x: 415, y: 360, w: 55, h: 55, capacity: 2, status: "available" },
];

// ============================================================================
// ANA BİLEŞEN
// ============================================================================
export default function RoofFloorPlan() {
    const [entities, setEntities] = useState<TableEntity[]>(TABLES);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [hoveredId, setHoveredId] = useState<string | null>(null);

    const selectedEntity = useMemo(
        () => entities.find((e) => e.id === selectedId),
        [entities, selectedId]
    );

    const handleStatusChange = (status: EntityStatus) => {
        if (!selectedId) return;
        setEntities((prev) =>
            prev.map((e) => (e.id === selectedId ? { ...e, status } : e))
        );
    };

    return (
        <div className="min-h-screen bg-[#0c1222] flex">
            {/* SOL: Plan Alanı */}
            <div className="flex-1 p-6">
                <svg
                    viewBox="0 0 900 480"
                    className="w-full h-full"
                    style={{ maxHeight: "calc(100vh - 48px)" }}
                >
                    {/* Arka plan */}
                    <rect width="900" height="480" fill="#0c1222" />

                    {/* ========== TERAS RESTORAN ALANI Yazısı ========== */}
                    <text x="280" y="175" fill="#4a5e7a" fontSize="11" fontWeight="500">
                        TERAS RESTORAN ALANI
                    </text>
                    <text x="430" y="175" fill="#3a4a60" fontSize="9">219.97m²</text>

                    {/* ========== LOCA ALANI ========== */}
                    <rect
                        x="75"
                        y="195"
                        width="355"
                        height="165"
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="1.5"
                        strokeDasharray="6 4"
                        rx="8"
                        opacity="0.4"
                    />
                    <text x="85" y="210" fill="#3b82f6" fontSize="10" fontWeight="500" opacity="0.7">
                        LOCA ALANI
                    </text>
                    <text x="160" y="210" fill="#3b82f6" fontSize="8" opacity="0.5">11.50m²</text>

                    {/* ========== BAR ALANI ========== */}
                    <rect
                        x="600"
                        y="15"
                        width="280"
                        height="105"
                        fill="none"
                        stroke="#0ea5e9"
                        strokeWidth="1.5"
                        rx="6"
                        opacity="0.3"
                    />
                    <text x="615" y="35" fill="#0ea5e9" fontSize="12" fontWeight="600" opacity="0.8">
                        BAR
                    </text>
                    <text x="615" y="48" fill="#0ea5e9" fontSize="9" opacity="0.5">10.45m²</text>

                    {/* ========== SERVİS MUTFAĞI ========== */}
                    <rect
                        x="530"
                        y="330"
                        width="250"
                        height="130"
                        fill="#111827"
                        stroke="#1e293b"
                        strokeWidth="1"
                        rx="6"
                        opacity="0.6"
                    />
                    <text x="590" y="400" fill="#6b7280" fontSize="14" fontWeight="500">
                        SERVİS MUTFAĞI
                    </text>
                    <text x="640" y="420" fill="#4b5563" fontSize="10">48.27m²</text>

                    {/* ========== SAHNE (Dikey, sol kenar) ========== */}
                    <rect
                        x="0"
                        y="360"
                        width="20"
                        height="110"
                        fill="#1e3a5f"
                        rx="3"
                    />
                    <text
                        x="10"
                        y="420"
                        fill="#60a5fa"
                        fontSize="10"
                        fontWeight="600"
                        textAnchor="middle"
                        transform="rotate(-90, 10, 420)"
                    >
                        SAHNE
                    </text>

                    {/* ========== MASALAR ========== */}
                    {entities.map((entity) => {
                        const isSelected = selectedId === entity.id;
                        const isHovered = hoveredId === entity.id;
                        const color = STATUS_COLORS[entity.status];

                        return (
                            <g
                                key={entity.id}
                                className="cursor-pointer transition-transform"
                                onClick={() => setSelectedId(entity.id)}
                                onMouseEnter={() => setHoveredId(entity.id)}
                                onMouseLeave={() => setHoveredId(null)}
                            >
                                {/* Seçim çerçevesi */}
                                {isSelected && (
                                    <rect
                                        x={entity.x - 4}
                                        y={entity.y - 4}
                                        width={entity.w + 8}
                                        height={entity.h + 8}
                                        rx="10"
                                        fill="none"
                                        stroke="#0ea5e9"
                                        strokeWidth="2"
                                    />
                                )}

                                {/* Masa gövdesi */}
                                <rect
                                    x={entity.x}
                                    y={entity.y}
                                    width={entity.w}
                                    height={entity.h}
                                    rx="8"
                                    fill={color}
                                    opacity={isHovered ? 0.9 : 0.85}
                                    style={{
                                        transition: "opacity 0.15s",
                                    }}
                                />

                                {/* Masa ID */}
                                <text
                                    x={entity.x + entity.w / 2}
                                    y={entity.y + entity.h / 2 + 5}
                                    fill="white"
                                    fontSize="14"
                                    fontWeight="bold"
                                    textAnchor="middle"
                                    style={{ pointerEvents: "none" }}
                                >
                                    {entity.id}
                                </text>
                            </g>
                        );
                    })}
                </svg>
            </div>

            {/* SAĞ: Detay Paneli */}
            <div className="w-72 bg-[#111827] border-l border-white/10 p-4 flex flex-col">
                {selectedEntity ? (
                    <>
                        {/* Başlık */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
                                    style={{ backgroundColor: STATUS_COLORS[selectedEntity.status] }}
                                >
                                    {selectedEntity.id}
                                </div>
                                <div>
                                    <div className="text-white font-semibold">{selectedEntity.id}</div>
                                    <div className="text-white/50 text-xs capitalize">{selectedEntity.kind}</div>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedId(null)}
                                className="text-white/50 hover:text-white p-1"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Kapasite */}
                        <div className="mb-5">
                            <div className="text-white/60 text-xs mb-2">Kapasite</div>
                            <div className="text-white text-lg font-semibold">
                                {selectedEntity.capacity} Kişi
                            </div>
                        </div>

                        {/* Durum */}
                        <div className="mb-5">
                            <div className="text-white/60 text-xs mb-2">Durum</div>
                            <div className="grid grid-cols-2 gap-2">
                                {(["available", "reserved", "occupied", "blocked"] as EntityStatus[]).map(
                                    (status) => (
                                        <button
                                            key={status}
                                            onClick={() => handleStatusChange(status)}
                                            className={`px-3 py-2 rounded-lg text-xs font-medium transition ${selectedEntity.status === status
                                                    ? "ring-2 ring-white/30"
                                                    : ""
                                                }`}
                                            style={{
                                                backgroundColor: STATUS_COLORS[status],
                                                opacity: selectedEntity.status === status ? 1 : 0.6,
                                            }}
                                        >
                                            {status === "available"
                                                ? "Boş"
                                                : status === "reserved"
                                                    ? "Rezerve"
                                                    : status === "occupied"
                                                        ? "Dolu"
                                                        : "Bloke"}
                                        </button>
                                    )
                                )}
                            </div>
                        </div>

                        {/* Konum Bilgisi */}
                        <div className="text-white/40 text-xs mt-auto">
                            Konum: ({selectedEntity.x}, {selectedEntity.y})
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-white/40 text-sm">
                        Masa seçin
                    </div>
                )}
            </div>
        </div>
    );
}
