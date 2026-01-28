// ============================================================================
// FLOOR DEFINITIONS - Kat tanımları
// ============================================================================

export type FloorId = "teras" | "loca" | "bekleme";

export interface Floor {
    id: FloorId;
    label: string;
}

export const FLOORS: Floor[] = [
    { id: "teras", label: "Teras" },
    { id: "loca", label: "Loca" },
    { id: "bekleme", label: "Bekleme" },
];

/**
 * Entity ID'sinden floor ID çıkar
 * T* -> teras, L* -> loca, B* -> bekleme
 */
export function getFloorIdFromEntityId(entityId: string): FloorId {
    const prefix = entityId.charAt(0).toUpperCase();
    if (prefix === "L") return "loca";
    if (prefix === "B") return "bekleme";
    return "teras"; // T* veya diğerleri
}
