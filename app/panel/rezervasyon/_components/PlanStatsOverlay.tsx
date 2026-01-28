"use client";

import { FloorStats } from "../../../../lib/planStats";

interface Props {
    stats: FloorStats;
}

/**
 * Plan istatistik overlay'i - Plan sağ üstünde gösterilen chip'ler
 */
export default function PlanStatsOverlay({ stats }: Props) {
    return (
        <div className="absolute top-3 right-3 z-10 flex flex-wrap gap-2">
            {/* Kat Sayısı */}
            <div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm px-2.5 py-1.5">
                <span className="text-[10px] text-white/50 font-medium">Kat</span>
                <span className="text-[11px] text-white font-bold">{stats.floorCount}</span>
            </div>

            {/* Masa Sayısı */}
            <div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm px-2.5 py-1.5">
                <span className="text-[10px] text-white/50 font-medium">Masa</span>
                <span className="text-[11px] text-white font-bold">{stats.tableCount}</span>
            </div>

            {/* Sandalye Sayısı */}
            <div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm px-2.5 py-1.5">
                <span className="text-[10px] text-white/50 font-medium">Koltuk</span>
                <span className="text-[11px] text-emerald-400 font-bold">{stats.seatCount}</span>
            </div>
        </div>
    );
}
