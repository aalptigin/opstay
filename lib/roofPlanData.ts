// ============================================================================
// ROOF PLAN DATA - PNG'den BİREBİR ölçülmüş koordinatlar
// PNG Boyutu: 640 x 352 piksel (viewBox bu değerlerle çalışacak)
// ============================================================================

import { FloorId } from "./floors";

export type EntityKind = "table" | "lounge" | "booth";
export type EntityStatus = "available" | "reserved" | "occupied" | "blocked";

export interface PlanEntity {
    id: string;
    kind: EntityKind;
    floorId: FloorId;
    x: number;
    y: number;
    w: number;
    h: number;
    r?: number;
    capacity: number;
    status: EntityStatus;
}

export interface SeatMarker {
    x: number;
    y: number;
    r: number;
}

export interface GreenPlanter {
    x: number;
    y: number;
    w: number;
    h: number;
}

export interface PurpleBlock {
    cx: number;
    cy: number;
    r: number;
}

export interface WallLine {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    color?: string;
    width?: number;
}

// PNG boyutları
export const PNG_WIDTH = 640;
export const PNG_HEIGHT = 352;

// ============================================================================
// MASALAR - PNG'den piksel piksel ölçülmüş
// ============================================================================
export const ENTITIES: PlanEntity[] = [
    // ==================== ÜST SOL TERAS (1. sıra) ====================
    // T15, T17, T18 grubu
    { id: "T15", kind: "table", floorId: "teras", x: 38, y: 15, w: 26, h: 38, capacity: 4, status: "available" },
    { id: "T17", kind: "table", floorId: "teras", x: 80, y: 15, w: 26, h: 38, capacity: 4, status: "available" },
    { id: "T18", kind: "table", floorId: "teras", x: 122, y: 15, w: 26, h: 38, capacity: 4, status: "available" },

    // T20, T22, T24 grubu (mor noktalardan sonra)
    { id: "T20", kind: "table", floorId: "teras", x: 200, y: 15, w: 26, h: 38, capacity: 4, status: "available" },
    { id: "T22", kind: "table", floorId: "teras", x: 242, y: 15, w: 26, h: 38, capacity: 4, status: "available" },
    { id: "T24", kind: "table", floorId: "teras", x: 284, y: 15, w: 26, h: 38, capacity: 4, status: "available" },

    // ==================== BAR YANI (Sağ Üst) ====================
    { id: "T26", kind: "table", floorId: "teras", x: 420, y: 15, w: 26, h: 38, capacity: 4, status: "available" },
    { id: "T28", kind: "table", floorId: "teras", x: 462, y: 15, w: 26, h: 38, capacity: 4, status: "available" },
    { id: "T30", kind: "table", floorId: "teras", x: 504, y: 15, w: 26, h: 38, capacity: 4, status: "available" },

    // ==================== 2. SIRA ====================
    { id: "T14", kind: "table", floorId: "teras", x: 10, y: 72, w: 26, h: 32, capacity: 4, status: "available" },

    { id: "T16", kind: "table", floorId: "teras", x: 80, y: 78, w: 22, h: 20, capacity: 2, status: "available" },
    { id: "T19", kind: "table", floorId: "teras", x: 122, y: 78, w: 22, h: 20, capacity: 2, status: "available" },

    { id: "T21", kind: "table", floorId: "teras", x: 200, y: 78, w: 22, h: 20, capacity: 2, status: "available" },
    { id: "T23", kind: "table", floorId: "teras", x: 242, y: 78, w: 22, h: 20, capacity: 2, status: "available" },

    { id: "T25", kind: "table", floorId: "teras", x: 420, y: 78, w: 22, h: 20, capacity: 2, status: "available" },
    { id: "T27", kind: "table", floorId: "teras", x: 462, y: 78, w: 22, h: 20, capacity: 2, status: "available" },
    { id: "T29", kind: "table", floorId: "teras", x: 504, y: 78, w: 22, h: 20, capacity: 2, status: "available" },

    // ==================== LOCA ÜST SIRA ====================
    { id: "L2", kind: "lounge", floorId: "loca", x: 68, y: 127, w: 36, h: 32, capacity: 6, status: "available" },
    { id: "L4", kind: "lounge", floorId: "loca", x: 120, y: 127, w: 36, h: 32, capacity: 6, status: "available" },
    { id: "L6", kind: "lounge", floorId: "loca", x: 172, y: 127, w: 36, h: 32, capacity: 6, status: "available" },
    { id: "L8", kind: "lounge", floorId: "loca", x: 224, y: 127, w: 36, h: 32, capacity: 6, status: "available" },

    // ==================== LOCA ALT SIRA ====================
    { id: "L1", kind: "lounge", floorId: "loca", x: 68, y: 185, w: 36, h: 32, capacity: 6, status: "available" },
    { id: "L3", kind: "lounge", floorId: "loca", x: 120, y: 185, w: 36, h: 32, capacity: 6, status: "available" },
    { id: "L5", kind: "lounge", floorId: "loca", x: 172, y: 185, w: 36, h: 32, capacity: 6, status: "available" },
    { id: "L7", kind: "lounge", floorId: "loca", x: 224, y: 185, w: 36, h: 32, capacity: 6, status: "available" },

    // ==================== T13 ====================
    { id: "T13", kind: "table", floorId: "teras", x: 290, y: 155, w: 30, h: 42, capacity: 4, status: "available" },

    // ==================== BOOTH B1-B6 ====================
    { id: "B1", kind: "booth", floorId: "bekleme", x: 340, y: 155, w: 24, h: 28, capacity: 4, status: "available" },
    { id: "B2", kind: "booth", floorId: "bekleme", x: 374, y: 155, w: 24, h: 28, capacity: 4, status: "available" },
    { id: "B3", kind: "booth", floorId: "bekleme", x: 408, y: 155, w: 24, h: 28, capacity: 4, status: "available" },
    { id: "B4", kind: "booth", floorId: "bekleme", x: 442, y: 155, w: 24, h: 28, capacity: 4, status: "available" },
    { id: "B5", kind: "booth", floorId: "bekleme", x: 476, y: 155, w: 24, h: 28, capacity: 4, status: "available" },
    { id: "B6", kind: "booth", floorId: "bekleme", x: 510, y: 155, w: 24, h: 28, capacity: 4, status: "available" },

    // ==================== SOL ALT (SAHNE YANI) ====================
    { id: "T1", kind: "table", floorId: "teras", x: 10, y: 244, w: 24, h: 32, capacity: 4, status: "available" },
    { id: "T2", kind: "table", floorId: "teras", x: 10, y: 292, w: 24, h: 32, capacity: 4, status: "available" },

    // ==================== ALT TERAS ÜST SIRA ====================
    { id: "T3", kind: "table", floorId: "teras", x: 68, y: 244, w: 22, h: 20, capacity: 2, status: "available" },
    { id: "T5", kind: "table", floorId: "teras", x: 108, y: 244, w: 22, h: 20, capacity: 2, status: "available" },
    { id: "T7", kind: "table", floorId: "teras", x: 152, y: 244, w: 22, h: 20, capacity: 2, status: "available" },
    { id: "T9", kind: "table", floorId: "teras", x: 196, y: 244, w: 22, h: 20, capacity: 2, status: "available" },
    { id: "T11", kind: "table", floorId: "teras", x: 260, y: 244, w: 22, h: 20, capacity: 2, status: "available" },

    // ==================== ALT TERAS ALT SIRA ====================
    { id: "T4", kind: "table", floorId: "teras", x: 68, y: 292, w: 24, h: 32, capacity: 4, status: "available" },
    { id: "T6", kind: "table", floorId: "teras", x: 108, y: 292, w: 24, h: 32, capacity: 4, status: "available" },
    { id: "T8", kind: "table", floorId: "teras", x: 152, y: 292, w: 24, h: 32, capacity: 4, status: "available" },
    { id: "T10", kind: "table", floorId: "teras", x: 196, y: 292, w: 24, h: 32, capacity: 4, status: "available" },
    { id: "T12", kind: "table", floorId: "teras", x: 260, y: 292, w: 24, h: 32, capacity: 4, status: "available" },
];

// ============================================================================
// KOLTUK MARKER'LARI - PNG'deki gerçek daire konumları (üstten görüş, yeşil daireler)
// Her bir oturma dairesi tek tek ölçüldü
// ============================================================================
export const SEAT_MARKERS: SeatMarker[] = [
    // T15 çevresi (4 koltuk - üst, alt, sol, sağ)
    { x: 51, y: 8, r: 5 }, { x: 51, y: 60, r: 5 }, { x: 32, y: 34, r: 5 }, { x: 70, y: 34, r: 5 },
    // T17 çevresi
    { x: 93, y: 8, r: 5 }, { x: 93, y: 60, r: 5 }, { x: 74, y: 34, r: 5 }, { x: 112, y: 34, r: 5 },
    // T18 çevresi
    { x: 135, y: 8, r: 5 }, { x: 135, y: 60, r: 5 }, { x: 116, y: 34, r: 5 }, { x: 154, y: 34, r: 5 },

    // T20 çevresi
    { x: 213, y: 8, r: 5 }, { x: 213, y: 60, r: 5 }, { x: 194, y: 34, r: 5 }, { x: 232, y: 34, r: 5 },
    // T22 çevresi
    { x: 255, y: 8, r: 5 }, { x: 255, y: 60, r: 5 }, { x: 236, y: 34, r: 5 }, { x: 274, y: 34, r: 5 },
    // T24 çevresi
    { x: 297, y: 8, r: 5 }, { x: 297, y: 60, r: 5 }, { x: 278, y: 34, r: 5 }, { x: 316, y: 34, r: 5 },

    // T26, T28, T30 (bar yanı)
    { x: 433, y: 8, r: 5 }, { x: 433, y: 60, r: 5 }, { x: 414, y: 34, r: 5 }, { x: 452, y: 34, r: 5 },
    { x: 475, y: 8, r: 5 }, { x: 475, y: 60, r: 5 }, { x: 456, y: 34, r: 5 }, { x: 494, y: 34, r: 5 },
    { x: 517, y: 8, r: 5 }, { x: 517, y: 60, r: 5 }, { x: 498, y: 34, r: 5 }, { x: 536, y: 34, r: 5 },

    // LOCA L2 çevresi (6 koltuk)
    { x: 60, y: 143, r: 4 }, { x: 112, y: 143, r: 4 }, // sol-sağ
    { x: 76, y: 120, r: 4 }, { x: 96, y: 120, r: 4 },  // üst
    { x: 76, y: 166, r: 4 }, { x: 96, y: 166, r: 4 },  // alt

    // LOCA L4 çevresi
    { x: 112, y: 143, r: 4 }, { x: 164, y: 143, r: 4 },
    { x: 128, y: 120, r: 4 }, { x: 148, y: 120, r: 4 },
    { x: 128, y: 166, r: 4 }, { x: 148, y: 166, r: 4 },

    // LOCA L6 çevresi
    { x: 164, y: 143, r: 4 }, { x: 216, y: 143, r: 4 },
    { x: 180, y: 120, r: 4 }, { x: 200, y: 120, r: 4 },
    { x: 180, y: 166, r: 4 }, { x: 200, y: 166, r: 4 },

    // LOCA L8 çevresi
    { x: 216, y: 143, r: 4 }, { x: 268, y: 143, r: 4 },
    { x: 232, y: 120, r: 4 }, { x: 252, y: 120, r: 4 },
    { x: 232, y: 166, r: 4 }, { x: 252, y: 166, r: 4 },

    // LOCA L1, L3, L5, L7 (alt sıra - benzer düzen)
    { x: 60, y: 201, r: 4 }, { x: 112, y: 201, r: 4 },
    { x: 76, y: 178, r: 4 }, { x: 96, y: 178, r: 4 },
    { x: 76, y: 224, r: 4 }, { x: 96, y: 224, r: 4 },

    { x: 112, y: 201, r: 4 }, { x: 164, y: 201, r: 4 },
    { x: 128, y: 178, r: 4 }, { x: 148, y: 178, r: 4 },
    { x: 128, y: 224, r: 4 }, { x: 148, y: 224, r: 4 },

    { x: 164, y: 201, r: 4 }, { x: 216, y: 201, r: 4 },
    { x: 180, y: 178, r: 4 }, { x: 200, y: 178, r: 4 },
    { x: 180, y: 224, r: 4 }, { x: 200, y: 224, r: 4 },

    { x: 216, y: 201, r: 4 }, { x: 268, y: 201, r: 4 },
    { x: 232, y: 178, r: 4 }, { x: 252, y: 178, r: 4 },
    { x: 232, y: 224, r: 4 }, { x: 252, y: 224, r: 4 },
];

// ============================================================================
// YEŞİL SAKSILAR / BİTKİ BANTLARI - PNG'den birebir
// ============================================================================
export const GREEN_PLANTERS: GreenPlanter[] = [
    // Üst sıra arası dikey
    { x: 64, y: 12, w: 4, h: 48 },
    { x: 106, y: 12, w: 4, h: 48 },
    { x: 162, y: 12, w: 4, h: 28 },
    { x: 182, y: 12, w: 4, h: 28 },
    { x: 226, y: 12, w: 4, h: 48 },
    { x: 268, y: 12, w: 4, h: 48 },

    // LOCA çerçevesi - sol ve sağ dikey
    { x: 50, y: 112, w: 5, h: 115 },
    { x: 275, y: 112, w: 5, h: 115 },

    // LOCA çerçevesi - üst ve alt yatay
    { x: 52, y: 108, w: 226, h: 4 },
    { x: 52, y: 227, w: 226, h: 4 },

    // LOCA iç ayırıcılar (dikey)
    { x: 104, y: 115, w: 4, h: 108 },
    { x: 156, y: 115, w: 4, h: 108 },
    { x: 208, y: 115, w: 4, h: 108 },

    // Alt teras arası dikey
    { x: 50, y: 236, w: 4, h: 96 },
    { x: 90, y: 236, w: 4, h: 96 },
    { x: 134, y: 236, w: 4, h: 96 },
    { x: 178, y: 236, w: 4, h: 96 },
    { x: 240, y: 236, w: 4, h: 96 },
    { x: 284, y: 236, w: 4, h: 96 },
];

// ============================================================================
// MOR BLOKLAR / KOLONLAR - PNG'den birebir
// ============================================================================
export const PURPLE_BLOCKS: PurpleBlock[] = [
    // Üst orta (T18-T20 arası)
    { cx: 168, cy: 30, r: 6 },
    { cx: 184, cy: 30, r: 6 },

    // Bar yanı dikey dizi
    { cx: 385, cy: 32, r: 8 },
    { cx: 385, cy: 50, r: 8 },
    { cx: 385, cy: 68, r: 8 },

    // Sağ kenar
    { cx: 550, cy: 30, r: 6 },
    { cx: 550, cy: 168, r: 6 },
    { cx: 550, cy: 320, r: 8 },

    // B6 yanı
    { cx: 542, cy: 172, r: 4 },
];

// ============================================================================
// DUVAR ÇİZGİLERİ - PNG'den birebir
// ============================================================================
export const WALL_LINES: WallLine[] = [
    // Koridor çizgileri (yatay, kesikli)
    { x1: 32, y1: 66, x2: 320, y2: 66, width: 0.5 },
    { x1: 32, y1: 105, x2: 300, y2: 105, width: 0.5 },
    { x1: 32, y1: 232, x2: 300, y2: 232, width: 0.5 },

    // BAR alanı sınırı (L şekli, mavi)
    { x1: 350, y1: 8, x2: 565, y2: 8, color: "#0ea5ff", width: 1.5 },
    { x1: 565, y1: 8, x2: 565, y2: 102, color: "#0ea5ff", width: 1.5 },
    { x1: 565, y1: 102, x2: 405, y2: 102, color: "#0ea5ff", width: 1.5 },
    { x1: 405, y1: 102, x2: 405, y2: 66, color: "#0ea5ff", width: 1.5 },
    { x1: 405, y1: 66, x2: 350, y2: 66, color: "#0ea5ff", width: 1.5 },
    { x1: 350, y1: 66, x2: 350, y2: 8, color: "#0ea5ff", width: 1.5 },

    // LOCA ALANI yazısı üstü çizgi (mavi kesikli)
    { x1: 280, y1: 108, x2: 330, y2: 108, color: "#3b82f6", width: 1 },
];

// ============================================================================
// ALAN SINIRLARI
// ============================================================================
export const SAHNE_AREA = { x: 2, y: 178, w: 24, h: 130 };
export const BAR_AREA = { x: 352, y: 32, w: 40, h: 28 };
export const KITCHEN_AREA = { x: 332, y: 212, w: 145, h: 126 };
export const STAIRS_AREA = { x: 545, y: 200, w: 80, h: 120, steps: 10 };

// ============================================================================
// ALAN ETİKETLERİ
// ============================================================================
export const AREA_LABELS = [
    { id: "teras", text: "TERAS RESTORAN ALANI", subText: "219.97m²", x: 98, y: 102 },
    { id: "bar", text: "BAR", subText: "10.45m²", x: 358, y: 48 },
    { id: "loca", text: "LOCA ALANI", x: 295, y: 115 },
    { id: "sahne", text: "SAHNE", subText: "12.00m²", x: 6, y: 220 },
    { id: "mutfak", text: "SERVİS MUTFAĞI", subText: "48.27m²", x: 380, y: 268 },
    { id: "merdiven", text: "MERDİVEN HOLÜ", subText: "20.08m²", x: 552, y: 218 },
];

// ============================================================================
// RENK ŞEMASI
// ============================================================================
export const STATUS_COLORS: Record<EntityStatus, { fill: string; stroke: string }> = {
    available: { fill: "#10b981", stroke: "#059669" },
    reserved: { fill: "#f59e0b", stroke: "#d97706" },
    occupied: { fill: "#ef4444", stroke: "#dc2626" },
    blocked: { fill: "#6b7280", stroke: "#4b5563" },
};
