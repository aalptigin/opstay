// ============================================================================
// PLAN BUILDER STORAGE v2 - Enhanced with chairs
// ============================================================================

import {
    PlanBuilderData,
    FloorDef,
    TableDef,
    DecorationDef,
    ChairDef,
    DEFAULT_ROW_LAYOUT,
} from "./planBuilderTypes";

const STORAGE_KEY = "opsstay_plan_builder_v2";

/**
 * Get plan data from localStorage
 */
export function getPlanBuilderData(): PlanBuilderData | null {
    if (typeof window === "undefined") return null;

    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const data = JSON.parse(raw);

        // Migrate v1 to v2 if needed
        if (!data.version || data.version < 2) {
            return migrateV1ToV2(data);
        }

        // Ensure chairs array exists
        if (data.floors) {
            data.floors = data.floors.map((f: FloorDef) => ({
                ...f,
                chairs: f.chairs || [],
            }));
        }

        return data as PlanBuilderData;
    } catch {
        return null;
    }
}

/**
 * Save plan data to localStorage
 */
export function savePlanBuilderData(data: PlanBuilderData): void {
    if (typeof window === "undefined") return;

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, version: 2 }));
    } catch {
        console.error("Plan builder verisi kaydedilemedi.");
    }
}

/**
 * Migrate v1 data to v2 format
 */
function migrateV1ToV2(oldData: { floors?: Array<{ id: string; label: string; tables?: Array<{ id: string; seats: number; x: number; y: number; w: number; h: number; rotation: number }> }> }): PlanBuilderData {
    const floors: FloorDef[] = (oldData.floors || []).map((f) => ({
        id: f.id,
        label: f.label,
        layoutMode: "free" as const,
        rowLayout: { ...DEFAULT_ROW_LAYOUT },
        tables: (f.tables || []).map((t) => ({
            ...t,
            shapeType: "roundRect" as const,
            cornerRadius: 8,
        })),
        chairs: [],
        decorations: [],
    }));

    return { version: 2, floors };
}

/**
 * Get floor by ID
 */
export function getFloorById(data: PlanBuilderData | null, floorId: string): FloorDef | null {
    if (!data) return null;
    return data.floors.find((f) => f.id === floorId) || null;
}

/**
 * Get total table count
 */
export function getTotalTableCount(data: PlanBuilderData | null): number {
    if (!data) return 0;
    return data.floors.reduce((sum, f) => sum + f.tables.length, 0);
}

/**
 * Get total seat count
 */
export function getTotalSeatCount(data: PlanBuilderData | null): number {
    if (!data) return 0;
    return data.floors.reduce(
        (sum, f) => sum + f.tables.reduce((ts, t) => ts + t.seats, 0),
        0
    );
}

/**
 * Get floor table count
 */
export function getFloorTableCount(data: PlanBuilderData | null, floorId: string): number {
    const floor = getFloorById(data, floorId);
    return floor?.tables.length || 0;
}

/**
 * Get floor seat count
 */
export function getFloorSeatCount(data: PlanBuilderData | null, floorId: string): number {
    const floor = getFloorById(data, floorId);
    if (!floor) return 0;
    return floor.tables.reduce((sum, t) => sum + t.seats, 0);
}

/**
 * Generate floor ID from label
 */
export function generateFloorId(label: string): string {
    return label
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "_")
        .replace(/_+/g, "_")
        .replace(/^_|_$/g, "");
}

/**
 * Generate unique table ID
 */
export function generateTableId(existingIds: string[]): string {
    let i = 1;
    while (existingIds.includes(`T${i}`)) i++;
    return `T${i}`;
}

/**
 * Generate unique decoration ID
 */
export function generateDecorationId(existingIds: string[]): string {
    let i = 1;
    while (existingIds.includes(`D${i}`)) i++;
    return `D${i}`;
}

/**
 * Generate unique chair ID
 */
export function generateChairId(existingIds: string[]): string {
    let i = 1;
    while (existingIds.includes(`C${i}`)) i++;
    return `C${i}`;
}

/**
 * Apply row layout to tables
 */
export function applyRowLayout(
    tables: TableDef[],
    rowLayout: {
        rows: number[];
        rowGap: number;
        colGap: number;
        align: "left" | "center" | "right";
        marginX: number;
        marginY: number;
    },
    canvasWidth: number
): TableDef[] {
    if (!rowLayout.rows.length) return tables;

    const result: TableDef[] = [];
    let tableIndex = 0;
    let currentY = rowLayout.marginY;

    for (const rowCount of rowLayout.rows) {
        const rowTables = tables.slice(tableIndex, tableIndex + rowCount);
        if (!rowTables.length) break;

        const rowWidth = rowTables.reduce((sum, t) => sum + t.w, 0) + (rowTables.length - 1) * rowLayout.colGap;

        let startX = rowLayout.marginX;
        if (rowLayout.align === "center") {
            startX = (canvasWidth - rowWidth) / 2;
        } else if (rowLayout.align === "right") {
            startX = canvasWidth - rowWidth - rowLayout.marginX;
        }

        let currentX = startX;
        let maxHeight = 0;

        for (const table of rowTables) {
            result.push({
                ...table,
                x: currentX,
                y: currentY,
            });
            currentX += table.w + rowLayout.colGap;
            maxHeight = Math.max(maxHeight, table.h);
        }

        currentY += maxHeight + rowLayout.rowGap;
        tableIndex += rowCount;
    }

    for (let i = tableIndex; i < tables.length; i++) {
        result.push(tables[i]);
    }

    return result;
}
