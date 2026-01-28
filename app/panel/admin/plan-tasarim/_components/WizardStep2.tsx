"use client";

import { useState, useMemo } from "react";
import { WizardFloorInput } from "../../../../../lib/planBuilderTypes";

interface Props {
    floors: WizardFloorInput[];
    initialTotal: number;
    onComplete: (floors: WizardFloorInput[], total: number) => void;
    onBack: () => void;
}

export default function WizardStep2({ floors: initialFloors, initialTotal, onComplete, onBack }: Props) {
    const [floors, setFloors] = useState<WizardFloorInput[]>(
        initialFloors.map((f) => ({ ...f, tableCount: f.tableCount || 0 }))
    );
    const [totalInput, setTotalInput] = useState(initialTotal || 0);

    const floorSum = useMemo(() => {
        return floors.reduce((sum, f) => sum + f.tableCount, 0);
    }, [floors]);

    const isValid = totalInput > 0 && floorSum === totalInput && floors.every((f) => f.tableCount >= 0);

    const handleTableCountChange = (index: number, delta: number) => {
        const newFloors = [...floors];
        newFloors[index] = {
            ...newFloors[index],
            tableCount: Math.max(0, newFloors[index].tableCount + delta),
        };
        setFloors(newFloors);
    };

    const handleTableCountInput = (index: number, value: number) => {
        const newFloors = [...floors];
        newFloors[index] = {
            ...newFloors[index],
            tableCount: Math.max(0, value),
        };
        setFloors(newFloors);
    };

    const handleSubmit = () => {
        if (isValid) {
            onComplete(floors, totalInput);
        }
    };

    return (
        <div className="max-w-xl">
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
                <div className="text-center mb-6">
                    <div className="text-4xl mb-3">🪑</div>
                    <h2 className="text-xl font-bold text-white">Masa Sayıları</h2>
                    <p className="mt-2 text-sm text-white/60">
                        Her katta kaç masa olduğunu ve toplam masa sayısını girin.
                    </p>
                </div>

                {/* Total input */}
                <div className="mb-6 p-4 rounded-xl border border-white/10 bg-black/20">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-white/70">Toplam Masa Sayısı</label>
                        <input
                            type="number"
                            min={1}
                            value={totalInput || ""}
                            onChange={(e) => setTotalInput(parseInt(e.target.value, 10) || 0)}
                            placeholder="Örn: 23"
                            className="w-24 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-center text-lg font-bold text-white outline-none focus:border-blue-500"
                        />
                    </div>
                </div>

                {/* Per-floor inputs */}
                <div className="space-y-3">
                    <label className="block text-sm font-medium text-white/70">Kat Başı Masa Sayısı</label>
                    {floors.map((floor, i) => (
                        <div
                            key={floor.id}
                            className="flex items-center justify-between gap-3 p-3 rounded-xl border border-white/10 bg-black/10"
                        >
                            <span className="text-sm font-medium text-white">{floor.label}</span>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => handleTableCountChange(i, -1)}
                                    disabled={floor.tableCount <= 0}
                                    className="w-8 h-8 rounded-lg border border-white/10 bg-white/5 text-white font-bold hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-sm"
                                >
                                    −
                                </button>
                                <input
                                    type="number"
                                    min={0}
                                    value={floor.tableCount}
                                    onChange={(e) => handleTableCountInput(i, parseInt(e.target.value, 10) || 0)}
                                    className="w-16 rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 text-center text-sm font-bold text-white outline-none focus:border-blue-500"
                                />
                                <button
                                    type="button"
                                    onClick={() => handleTableCountChange(i, 1)}
                                    className="w-8 h-8 rounded-lg border border-white/10 bg-white/5 text-white font-bold hover:bg-white/10 text-sm"
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Validation */}
                <div className="mt-4 p-3 rounded-xl border border-white/10 bg-black/10">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-white/60">Kat Toplamı:</span>
                        <span className={`font-bold ${floorSum === totalInput ? "text-emerald-400" : "text-amber-400"}`}>
                            {floorSum}
                        </span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-1">
                        <span className="text-white/60">Genel Toplam:</span>
                        <span className="font-bold text-white">{totalInput || "-"}</span>
                    </div>
                    {totalInput > 0 && floorSum !== totalInput && (
                        <p className="mt-2 text-xs text-red-400">
                            ⚠️ Kat toplamı ile genel toplam uyuşmuyor.
                        </p>
                    )}
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
                        disabled={!isValid}
                        className="flex-1 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        Devam Et →
                    </button>
                </div>
            </div>
        </div>
    );
}
