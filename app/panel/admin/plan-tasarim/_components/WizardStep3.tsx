"use client";

import { useState, useMemo } from "react";
import { WizardFloorInput, WizardTableInput } from "../../../../../lib/planBuilderTypes";

interface Props {
    floors: WizardFloorInput[];
    tables: WizardTableInput[];
    onComplete: (tables: WizardTableInput[]) => void;
    onBack: () => void;
}

export default function WizardStep3({ floors, tables: initialTables, onComplete, onBack }: Props) {
    const [tables, setTables] = useState<WizardTableInput[]>(initialTables);
    const [bulkSeats, setBulkSeats] = useState(4);
    const [selectedFloorId, setSelectedFloorId] = useState<string | null>(floors[0]?.id || null);

    const tablesByFloor = useMemo(() => {
        const map: Record<string, WizardTableInput[]> = {};
        for (const floor of floors) {
            map[floor.id] = tables.filter((t) => t.floorId === floor.id);
        }
        return map;
    }, [floors, tables]);

    const allValid = tables.every((t) => t.seats >= 1);

    const handleSeatsChange = (tableId: string, seats: number) => {
        setTables((prev) =>
            prev.map((t) => (t.id === tableId ? { ...t, seats: Math.max(1, Math.min(20, seats)) } : t))
        );
    };

    const handleBulkAssign = () => {
        if (!selectedFloorId) return;
        setTables((prev) =>
            prev.map((t) =>
                t.floorId === selectedFloorId ? { ...t, seats: Math.max(1, Math.min(20, bulkSeats)) } : t
            )
        );
    };

    const handleSubmit = () => {
        if (allValid) {
            onComplete(tables);
        }
    };

    return (
        <div className="max-w-3xl">
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
                <div className="text-center mb-6">
                    <div className="text-4xl mb-3">💺</div>
                    <h2 className="text-xl font-bold text-white">Sandalye Sayıları</h2>
                    <p className="mt-2 text-sm text-white/60">
                        Her masa için kaç sandalye olduğunu belirleyin.
                    </p>
                </div>

                {/* Bulk assign */}
                <div className="mb-6 p-4 rounded-xl border border-white/10 bg-black/20">
                    <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-sm text-white/70">Toplu Atama:</span>
                        <select
                            value={selectedFloorId || ""}
                            onChange={(e) => setSelectedFloorId(e.target.value)}
                            className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none"
                        >
                            {floors.map((f) => (
                                <option key={f.id} value={f.id}>
                                    {f.label}
                                </option>
                            ))}
                        </select>
                        <span className="text-white/50">→</span>
                        <input
                            type="number"
                            min={1}
                            max={20}
                            value={bulkSeats}
                            onChange={(e) => setBulkSeats(parseInt(e.target.value, 10) || 4)}
                            className="w-16 rounded-lg border border-white/10 bg-black/30 px-2 py-2 text-center text-sm text-white outline-none"
                        />
                        <span className="text-sm text-white/50">sandalye</span>
                        <button
                            type="button"
                            onClick={handleBulkAssign}
                            className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20 transition"
                        >
                            Uygula
                        </button>
                    </div>
                </div>

                {/* Floor tabs */}
                <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                    {floors.map((floor) => (
                        <button
                            key={floor.id}
                            type="button"
                            onClick={() => setSelectedFloorId(floor.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${selectedFloorId === floor.id
                                    ? "bg-blue-600 text-white"
                                    : "bg-white/5 text-white/70 hover:bg-white/10"
                                }`}
                        >
                            {floor.label} ({tablesByFloor[floor.id]?.length || 0})
                        </button>
                    ))}
                </div>

                {/* Table grid */}
                {selectedFloorId && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-[400px] overflow-y-auto p-1">
                        {tablesByFloor[selectedFloorId]?.map((table) => (
                            <div
                                key={table.id}
                                className="flex items-center justify-between gap-2 p-3 rounded-xl border border-white/10 bg-black/20"
                            >
                                <span className="text-sm font-bold text-white">{table.id}</span>
                                <input
                                    type="number"
                                    min={1}
                                    max={20}
                                    value={table.seats}
                                    onChange={(e) =>
                                        handleSeatsChange(table.id, parseInt(e.target.value, 10) || 1)
                                    }
                                    className="w-14 rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 text-center text-sm font-bold text-white outline-none focus:border-blue-500"
                                />
                            </div>
                        ))}
                    </div>
                )}

                {/* Summary */}
                <div className="mt-4 p-3 rounded-xl border border-white/10 bg-black/10">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-white/60">Toplam Masa:</span>
                        <span className="font-bold text-white">{tables.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-1">
                        <span className="text-white/60">Toplam Sandalye:</span>
                        <span className="font-bold text-emerald-400">
                            {tables.reduce((sum, t) => sum + t.seats, 0)}
                        </span>
                    </div>
                </div>

                {/* Navigation */}
                <div className="mt-6 pt-4 border-t border-white/10 flex gap-3">
                    <button
                        type="button"
                        onClick={onBack}
                        className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-medium text-white/70 hover:bg-white/10 transition"
                    >
                        ← Geri
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={!allValid}
                        className="flex-1 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        Devam Et →
                    </button>
                </div>
            </div>
        </div>
    );
}
