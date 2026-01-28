"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    WizardState,
    WizardFloorInput,
    WizardTableInput,
    PlanBuilderData,
    FloorDef,
    DEFAULT_TABLE_W,
    DEFAULT_TABLE_H,
    DEFAULT_ROW_LAYOUT,
} from "../../../../lib/planBuilderTypes";
import { savePlanBuilderData, generateFloorId } from "../../../../lib/planBuilderStorage";
import WizardStep1 from "./_components/WizardStep1";
import WizardStep2 from "./_components/WizardStep2";
import WizardStep3 from "./_components/WizardStep3";
import WizardStep4 from "./_components/WizardStep4";

const initialState: WizardState = {
    step: 1,
    floorCount: 1,
    floors: [],
    totalTableCount: 0,
    tables: [],
};

export default function PlanTasarimPage() {
    const [state, setState] = useState<WizardState>(initialState);
    const [saved, setSaved] = useState(false);

    const goNext = useCallback(() => {
        setState((s) => ({
            ...s,
            step: Math.min(4, s.step + 1) as 1 | 2 | 3 | 4,
        }));
    }, []);

    const goBack = useCallback(() => {
        setState((s) => ({
            ...s,
            step: Math.max(1, s.step - 1) as 1 | 2 | 3 | 4,
        }));
    }, []);

    // Step 1: Floor count and names
    const handleStep1Complete = useCallback((floorCount: number, floorLabels: string[]) => {
        const floors: WizardFloorInput[] = floorLabels.map((label, i) => ({
            id: generateFloorId(label) || `floor_${i}`,
            label,
            tableCount: 0,
        }));
        setState((s) => ({ ...s, floorCount, floors }));
        goNext();
    }, [goNext]);

    // Step 2: Table counts per floor
    const handleStep2Complete = useCallback((floors: WizardFloorInput[], totalTableCount: number) => {
        // Generate table inputs
        const tables: WizardTableInput[] = [];
        let tableIndex = 0;
        for (const floor of floors) {
            for (let i = 0; i < floor.tableCount; i++) {
                tableIndex++;
                tables.push({
                    id: `T${tableIndex}`,
                    floorId: floor.id,
                    seats: 4, // default
                });
            }
        }
        setState((s) => ({ ...s, floors, totalTableCount, tables }));
        goNext();
    }, [goNext]);

    // Step 3: Seat counts per table
    const handleStep3Complete = useCallback((tables: WizardTableInput[]) => {
        setState((s) => ({ ...s, tables }));
        goNext();
    }, [goNext]);

    // Step 4: Canvas complete - save data
    const handleSave = useCallback((data: PlanBuilderData) => {
        savePlanBuilderData(data);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    }, []);

    // Build initial canvas data from wizard state (v2 format)
    const buildInitialData = useCallback((): PlanBuilderData => {
        const floors: FloorDef[] = state.floors.map((floor) => {
            const floorTables = state.tables.filter((t) => t.floorId === floor.id);
            return {
                id: floor.id,
                label: floor.label,
                layoutMode: "free" as const,
                rowLayout: { ...DEFAULT_ROW_LAYOUT },
                tables: floorTables.map((t, i) => ({
                    id: t.id,
                    seats: t.seats,
                    x: 80 + (i % 6) * 100,
                    y: 80 + Math.floor(i / 6) * 100,
                    w: DEFAULT_TABLE_W,
                    h: DEFAULT_TABLE_H,
                    rotation: 0,
                    shapeType: "roundRect" as const,
                    cornerRadius: 12,
                })),
                chairs: [],
                decorations: [],
            };
        });

        return { version: 2, floors };
    }, [state.floors, state.tables]);

    const stepTitles = [
        "Kat Sayısı ve İsimleri",
        "Masa Sayıları",
        "Sandalye Sayıları",
        "Plan Editörü",
    ];

    return (
        <div>
            <div className="text-white/60 text-xs tracking-[0.35em] font-semibold">ADMIN</div>
            <h1 className="mt-2 text-2xl md:text-3xl font-extrabold text-white">Plan Tasarım</h1>
            <p className="mt-2 text-sm text-white/60">
                Kat, masa ve sandalye yapılandırmasını oluşturun.
            </p>

            {/* Progress */}
            <div className="mt-6 flex items-center gap-2">
                {[1, 2, 3, 4].map((n) => (
                    <div key={n} className="flex items-center gap-2">
                        <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition ${state.step === n
                                ? "bg-blue-600 text-white"
                                : state.step > n
                                    ? "bg-emerald-600 text-white"
                                    : "bg-white/10 text-white/50"
                                }`}
                        >
                            {state.step > n ? "✓" : n}
                        </div>
                        {n < 4 && (
                            <div
                                className={`w-8 h-0.5 ${state.step > n ? "bg-emerald-600" : "bg-white/10"}`}
                            />
                        )}
                    </div>
                ))}
                <span className="ml-4 text-sm text-white/70">{stepTitles[state.step - 1]}</span>
            </div>

            {/* Saved indicator */}
            <AnimatePresence>
                {saved && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="fixed top-4 right-4 z-50 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white shadow-lg"
                    >
                        ✓ Plan kaydedildi
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Wizard Content */}
            <motion.div
                key={state.step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="mt-6"
            >
                {state.step === 1 && (
                    <WizardStep1
                        initialFloorCount={state.floorCount}
                        initialLabels={state.floors.map((f) => f.label)}
                        onComplete={handleStep1Complete}
                    />
                )}

                {state.step === 2 && (
                    <WizardStep2
                        floors={state.floors}
                        initialTotal={state.totalTableCount}
                        onComplete={handleStep2Complete}
                        onBack={goBack}
                    />
                )}

                {state.step === 3 && (
                    <WizardStep3
                        floors={state.floors}
                        tables={state.tables}
                        onComplete={handleStep3Complete}
                        onBack={goBack}
                    />
                )}

                {state.step === 4 && (
                    <WizardStep4
                        initialData={buildInitialData()}
                        onSave={handleSave}
                        onBack={goBack}
                    />
                )}
            </motion.div>
        </div>
    );
}
