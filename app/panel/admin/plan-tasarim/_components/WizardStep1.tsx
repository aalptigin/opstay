"use client";

import { useState } from "react";

interface Props {
    initialFloorCount: number;
    initialLabels: string[];
    onComplete: (floorCount: number, labels: string[]) => void;
}

export default function WizardStep1({ initialFloorCount, initialLabels, onComplete }: Props) {
    const [floorCount, setFloorCount] = useState(initialFloorCount || 1);
    const [labels, setLabels] = useState<string[]>(
        initialLabels.length > 0 ? initialLabels : [""]
    );

    // Sync label array with floor count
    const handleFloorCountChange = (count: number) => {
        const newCount = Math.max(1, Math.min(10, count));
        setFloorCount(newCount);

        if (newCount > labels.length) {
            setLabels([...labels, ...Array(newCount - labels.length).fill("")]);
        } else if (newCount < labels.length) {
            setLabels(labels.slice(0, newCount));
        }
    };

    const handleLabelChange = (index: number, value: string) => {
        const newLabels = [...labels];
        newLabels[index] = value;
        setLabels(newLabels);
    };

    const allLabelsValid = labels.every((l) => l.trim().length > 0);
    const canProceed = floorCount > 0 && allLabelsValid;

    const handleSubmit = () => {
        if (canProceed) {
            onComplete(floorCount, labels.map((l) => l.trim()));
        }
    };

    return (
        <div className="max-w-xl">
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
                <div className="text-center mb-6">
                    <div className="text-4xl mb-3">🏢</div>
                    <h2 className="text-xl font-bold text-white">Kaç kat var?</h2>
                    <p className="mt-2 text-sm text-white/60">
                        Restoranınızdaki kat sayısını ve her katın adını belirleyin.
                    </p>
                </div>

                {/* Floor Count */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-white/70 mb-2">Kat Sayısı</label>
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => handleFloorCountChange(floorCount - 1)}
                            disabled={floorCount <= 1}
                            className="w-10 h-10 rounded-lg border border-white/10 bg-white/5 text-white font-bold hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            −
                        </button>
                        <input
                            type="number"
                            min={1}
                            max={10}
                            value={floorCount}
                            onChange={(e) => handleFloorCountChange(parseInt(e.target.value, 10) || 1)}
                            className="w-20 rounded-lg border border-white/10 bg-black/20 px-4 py-2 text-center text-lg font-bold text-white outline-none focus:border-blue-500"
                        />
                        <button
                            type="button"
                            onClick={() => handleFloorCountChange(floorCount + 1)}
                            disabled={floorCount >= 10}
                            className="w-10 h-10 rounded-lg border border-white/10 bg-white/5 text-white font-bold hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            +
                        </button>
                    </div>
                </div>

                {/* Floor Labels */}
                <div className="space-y-3">
                    <label className="block text-sm font-medium text-white/70">Kat İsimleri</label>
                    {labels.map((label, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <span className="w-8 text-sm text-white/50 font-medium">{i + 1}.</span>
                            <input
                                type="text"
                                value={label}
                                onChange={(e) => handleLabelChange(i, e.target.value)}
                                placeholder={`Kat ${i + 1} adı (örn: Roof, Teras)`}
                                className="flex-1 rounded-lg border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-blue-500"
                            />
                            {label.trim() ? (
                                <span className="text-emerald-400 text-sm">✓</span>
                            ) : (
                                <span className="text-amber-400 text-sm">*</span>
                            )}
                        </div>
                    ))}
                </div>

                {/* Submit */}
                <div className="mt-6 pt-4 border-t border-white/10">
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={!canProceed}
                        className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        Devam Et →
                    </button>
                    {!allLabelsValid && (
                        <p className="mt-2 text-xs text-amber-400 text-center">
                            Tüm kat isimleri zorunludur.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
