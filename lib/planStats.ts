// ============================================================================
// PLAN STATISTICS - İstatistik hesaplama fonksiyonları
// ============================================================================

import { getPlanBuilderData, getFloorSeatCount, getFloorTableCount } from "./planBuilderStorage";

export interface FloorStats {
    floorCount: number;
    tableCount: number;
    seatCount: number;
}

/**
 * Plan builder verisinden istatistikleri hesapla
 * @param selectedFloor - Seçili kat ID veya "all" tümü için
 */
export function computeFloorStats(selectedFloor: string): FloorStats {
    const data = getPlanBuilderData();

    if (!data || data.floors.length === 0) {
        return {
            floorCount: 0,
            tableCount: 0,
            seatCount: 0,
        };
    }

    const floorCount = data.floors.length;

    if (selectedFloor === "all") {
        // Tüm katlar
        const tableCount = data.floors.reduce((sum, f) => sum + f.tables.length, 0);
        const seatCount = data.floors.reduce(
            (sum, f) => sum + f.tables.reduce((ts, t) => ts + t.seats, 0),
            0
        );
        return { floorCount, tableCount, seatCount };
    }

    // Belirli bir kat
    const tableCount = getFloorTableCount(data, selectedFloor);
    const seatCount = getFloorSeatCount(data, selectedFloor);

    return { floorCount, tableCount, seatCount };
}
