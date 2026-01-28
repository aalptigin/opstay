// ============================================================================
// PLAN BUILDER TYPES v2 - Enhanced with chairs and infinite canvas
// ============================================================================

// Shape types for tables
export type ShapeType =
    | "rect"
    | "roundRect"
    | "circle"
    | "ellipse"
    | "capsule"
    | "hex"
    | "polygon"
    | "lshape";

// Decoration types
export type DecorationType =
    | "plant"
    | "column"
    | "bar"
    | "stage"
    | "wall"
    | "door"
    | "window"
    | "corridor"
    | "divider"
    | "textLabel";

// Chair shape types
export type ChairShape = "rect" | "circle" | "rounded";

// Layout modes
export type LayoutMode = "free" | "row";
export type RowAlign = "left" | "center" | "right";

// Table entity
export interface TableDef {
    id: string;
    seats: number;
    x: number;
    y: number;
    w: number;
    h: number;
    rotation: number;
    shapeType: ShapeType;
    cornerRadius?: number;
    sides?: number;
}

// Chair entity (NEW)
export interface ChairDef {
    id: string;
    x: number;
    y: number;
    w: number;
    h: number;
    rotation: number;
    shape: ChairShape;
}

// Decoration entity
export interface DecorationDef {
    id: string;
    type: DecorationType;
    label?: string;
    x: number;
    y: number;
    w: number;
    h: number;
    rotation: number;
}

// Row layout configuration
export interface RowLayout {
    enabled: boolean;
    rows: number[];
    rowGap: number;
    colGap: number;
    align: RowAlign;
    marginX: number;
    marginY: number;
}

// Floor definition
export interface FloorDef {
    id: string;
    label: string;
    layoutMode: LayoutMode;
    rowLayout: RowLayout;
    tables: TableDef[];
    chairs: ChairDef[];  // NEW
    decorations: DecorationDef[];
}

// Main data structure
export interface PlanBuilderData {
    version: 2;
    floors: FloorDef[];
}

// Wizard state types
export interface WizardFloorInput {
    id: string;
    label: string;
    tableCount: number;
}

export interface WizardTableInput {
    id: string;
    floorId: string;
    seats: number;
}

export interface WizardState {
    step: 1 | 2 | 3 | 4;
    floorCount: number;
    floors: WizardFloorInput[];
    totalTableCount: number;
    tables: WizardTableInput[];
}

// Canvas constants - MUCH LARGER for infinite canvas
export const CANVAS_WIDTH = 4000;
export const CANVAS_HEIGHT = 3000;
export const GRID_SIZE = 20;
export const DEFAULT_TABLE_W = 70;
export const DEFAULT_TABLE_H = 70;
export const DEFAULT_CHAIR_W = 24;
export const DEFAULT_CHAIR_H = 24;

// Default row layout
export const DEFAULT_ROW_LAYOUT: RowLayout = {
    enabled: false,
    rows: [],
    rowGap: 24,
    colGap: 18,
    align: "left",
    marginX: 60,
    marginY: 60,
};

// Shape labels (Turkish)
export const SHAPE_LABELS: Record<ShapeType, string> = {
    rect: "Dikdörtgen",
    roundRect: "Yuvarlatılmış",
    circle: "Daire",
    ellipse: "Elips",
    capsule: "Kapsül",
    hex: "Altıgen",
    polygon: "Çokgen",
    lshape: "L-Şekil",
};

// Chair shape labels
export const CHAIR_SHAPE_LABELS: Record<ChairShape, string> = {
    rect: "Kare",
    circle: "Yuvarlak",
    rounded: "Yuvarlatılmış",
};

// Decoration labels and icons with proper dimensions
export const DECORATION_CONFIG: Record<DecorationType, {
    label: string;
    icon: string;
    defaultW: number;
    defaultH: number;
    color: string;
}> = {
    plant: { label: "Bitki", icon: "🌿", defaultW: 40, defaultH: 40, color: "#166534" },
    column: { label: "Kolon", icon: "⬜", defaultW: 50, defaultH: 50, color: "#44403c" },
    bar: { label: "Bar", icon: "BAR", defaultW: 200, defaultH: 80, color: "#7c2d12" },
    stage: { label: "Sahne", icon: "SAHNE", defaultW: 250, defaultH: 100, color: "#581c87" },
    wall: { label: "Duvar", icon: "━", defaultW: 200, defaultH: 20, color: "#374151" },
    door: { label: "Kapı", icon: "▭", defaultW: 80, defaultH: 16, color: "#713f12" },
    window: { label: "Pencere", icon: "▬", defaultW: 120, defaultH: 12, color: "#0c4a6e" },
    corridor: { label: "Koridor", icon: "═", defaultW: 150, defaultH: 60, color: "#1e293b" },
    divider: { label: "Ayırıcı", icon: "─", defaultW: 100, defaultH: 8, color: "#475569" },
    textLabel: { label: "Etiket", icon: "🏷️", defaultW: 100, defaultH: 30, color: "#1e40af" },
};
