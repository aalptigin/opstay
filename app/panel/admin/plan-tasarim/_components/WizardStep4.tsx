"use client";

import { useState, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    PlanBuilderData,
    FloorDef,
    TableDef,
    DecorationDef,
    ChairDef,
    ShapeType,
    DecorationType,
    ChairShape,
    RowLayout,
    CANVAS_WIDTH,
    CANVAS_HEIGHT,
    GRID_SIZE,
    DEFAULT_TABLE_W,
    DEFAULT_TABLE_H,
    DEFAULT_CHAIR_W,
    DEFAULT_CHAIR_H,
    DEFAULT_ROW_LAYOUT,
    SHAPE_LABELS,
    CHAIR_SHAPE_LABELS,
    DECORATION_CONFIG,
} from "../../../../../lib/planBuilderTypes";
import { applyRowLayout, generateDecorationId, generateChairId } from "../../../../../lib/planBuilderStorage";

interface Props {
    initialData: PlanBuilderData;
    onSave: (data: PlanBuilderData) => void;
    onBack: () => void;
}

type Tool = "select" | "delete" | "addDecor" | "addChair";
type SelectedItem = { type: "table" | "decoration" | "chair"; id: string } | null;

export default function WizardStep4({ initialData, onSave, onBack }: Props) {
    const [data, setData] = useState<PlanBuilderData>(initialData);
    const [selectedFloorId, setSelectedFloorId] = useState(data.floors[0]?.id || "");
    const [selectedItem, setSelectedItem] = useState<SelectedItem>(null);
    const [tool, setTool] = useState<Tool>("select");
    const [showGrid, setShowGrid] = useState(true);
    const [zoom, setZoom] = useState(1.0);
    const [panX, setPanX] = useState(0);
    const [panY, setPanY] = useState(0);
    const [showSettings, setShowSettings] = useState(false);
    const [decorToAdd, setDecorToAdd] = useState<DecorationType | null>(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [isPanning, setIsPanning] = useState(false);
    const [panStart, setPanStart] = useState({ x: 0, y: 0 });

    const canvasRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const currentFloor = data.floors.find((f) => f.id === selectedFloorId);

    const selectedTable = useMemo(() => {
        if (!selectedItem || selectedItem.type !== "table") return null;
        return currentFloor?.tables.find((t) => t.id === selectedItem.id) || null;
    }, [selectedItem, currentFloor]);

    const selectedDecoration = useMemo(() => {
        if (!selectedItem || selectedItem.type !== "decoration") return null;
        return currentFloor?.decorations.find((d) => d.id === selectedItem.id) || null;
    }, [selectedItem, currentFloor]);

    const selectedChair = useMemo(() => {
        if (!selectedItem || selectedItem.type !== "chair") return null;
        return currentFloor?.chairs.find((c) => c.id === selectedItem.id) || null;
    }, [selectedItem, currentFloor]);

    const updateFloor = useCallback((floorId: string, updater: (f: FloorDef) => FloorDef) => {
        setData((prev) => ({
            ...prev,
            floors: prev.floors.map((f) => (f.id === floorId ? updater(f) : f)),
        }));
    }, []);

    const updateTable = useCallback((tableId: string, updates: Partial<TableDef>) => {
        updateFloor(selectedFloorId, (f) => ({
            ...f,
            tables: f.tables.map((t) => (t.id === tableId ? { ...t, ...updates } : t)),
        }));
    }, [selectedFloorId, updateFloor]);

    const updateDecoration = useCallback((decorId: string, updates: Partial<DecorationDef>) => {
        updateFloor(selectedFloorId, (f) => ({
            ...f,
            decorations: f.decorations.map((d) => (d.id === decorId ? { ...d, ...updates } : d)),
        }));
    }, [selectedFloorId, updateFloor]);

    const updateChair = useCallback((chairId: string, updates: Partial<ChairDef>) => {
        updateFloor(selectedFloorId, (f) => ({
            ...f,
            chairs: f.chairs.map((c) => (c.id === chairId ? { ...c, ...updates } : c)),
        }));
    }, [selectedFloorId, updateFloor]);

    const deleteItem = useCallback((item: SelectedItem) => {
        if (!item) return;
        updateFloor(selectedFloorId, (f) => ({
            ...f,
            tables: item.type === "table" ? f.tables.filter((t) => t.id !== item.id) : f.tables,
            decorations: item.type === "decoration" ? f.decorations.filter((d) => d.id !== item.id) : f.decorations,
            chairs: item.type === "chair" ? f.chairs.filter((c) => c.id !== item.id) : f.chairs,
        }));
        setSelectedItem(null);
    }, [selectedFloorId, updateFloor]);

    const addDecoration = useCallback((type: DecorationType, x: number, y: number) => {
        const config = DECORATION_CONFIG[type];
        const existingIds = currentFloor?.decorations.map((d) => d.id) || [];
        const newDecor: DecorationDef = {
            id: generateDecorationId(existingIds),
            type,
            x,
            y,
            w: config.defaultW,
            h: config.defaultH,
            rotation: 0,
        };
        updateFloor(selectedFloorId, (f) => ({
            ...f,
            decorations: [...f.decorations, newDecor],
        }));
        setSelectedItem({ type: "decoration", id: newDecor.id });
        setDecorToAdd(null);
        setTool("select");
    }, [selectedFloorId, currentFloor, updateFloor]);

    const addChair = useCallback((x: number, y: number) => {
        const existingIds = currentFloor?.chairs.map((c) => c.id) || [];
        const newChair: ChairDef = {
            id: generateChairId(existingIds),
            x,
            y,
            w: DEFAULT_CHAIR_W,
            h: DEFAULT_CHAIR_H,
            rotation: 0,
            shape: "rounded",
        };
        updateFloor(selectedFloorId, (f) => ({
            ...f,
            chairs: [...f.chairs, newChair],
        }));
        setSelectedItem({ type: "chair", id: newChair.id });
        setTool("select");
    }, [selectedFloorId, currentFloor, updateFloor]);

    const updateRowLayout = useCallback((updates: Partial<RowLayout>) => {
        updateFloor(selectedFloorId, (f) => ({
            ...f,
            rowLayout: { ...f.rowLayout, ...updates },
        }));
    }, [selectedFloorId, updateFloor]);

    const handleApplyRowLayout = useCallback(() => {
        if (!currentFloor) return;
        const newTables = applyRowLayout(currentFloor.tables, currentFloor.rowLayout, CANVAS_WIDTH);
        updateFloor(selectedFloorId, (f) => ({ ...f, tables: newTables, layoutMode: "row" }));
    }, [currentFloor, selectedFloorId, updateFloor]);

    const checkCollision = useCallback((a: { x: number; y: number; w: number; h: number }, others: Array<{ x: number; y: number; w: number; h: number; id: string }>, excludeId?: string): boolean => {
        for (const b of others) {
            if (b.id === excludeId) continue;
            if (a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y) return true;
        }
        return false;
    }, []);

    const handleItemMouseDown = (e: React.MouseEvent, item: SelectedItem, itemData: { x: number; y: number }) => {
        e.stopPropagation();
        if (tool === "delete") {
            deleteItem(item);
            return;
        }
        setSelectedItem(item);
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;
        const mouseX = (e.clientX - rect.left) / zoom - panX;
        const mouseY = (e.clientY - rect.top) / zoom - panY;
        setDragOffset({ x: mouseX - itemData.x, y: mouseY - itemData.y });
        setIsDragging(true);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isPanning) {
            const dx = e.clientX - panStart.x;
            const dy = e.clientY - panStart.y;
            setPanX((prev) => prev + dx / zoom);
            setPanY((prev) => prev + dy / zoom);
            setPanStart({ x: e.clientX, y: e.clientY });
            return;
        }

        if (!isDragging || !selectedItem) return;
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;
        const mouseX = (e.clientX - rect.left) / zoom - panX;
        const mouseY = (e.clientY - rect.top) / zoom - panY;
        let newX = mouseX - dragOffset.x;
        let newY = mouseY - dragOffset.y;
        if (showGrid) {
            newX = Math.round(newX / GRID_SIZE) * GRID_SIZE;
            newY = Math.round(newY / GRID_SIZE) * GRID_SIZE;
        }
        if (selectedItem.type === "table") {
            updateTable(selectedItem.id, { x: newX, y: newY });
        } else if (selectedItem.type === "decoration") {
            updateDecoration(selectedItem.id, { x: newX, y: newY });
        } else {
            updateChair(selectedItem.id, { x: newX, y: newY });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        setIsPanning(false);
    };

    const handleCanvasClick = (e: React.MouseEvent) => {
        if (e.button === 1 || (e.button === 0 && e.shiftKey)) return;

        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;
        const x = (e.clientX - rect.left) / zoom - panX;
        const y = (e.clientY - rect.top) / zoom - panY;

        if (tool === "addDecor" && decorToAdd) {
            addDecoration(decorToAdd, x, y);
        } else if (tool === "addChair") {
            addChair(x, y);
        } else {
            setSelectedItem(null);
        }
    };

    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        setZoom((z) => Math.max(0.1, Math.min(3, z * delta)));
    };

    const handleMiddleMouseDown = (e: React.MouseEvent) => {
        if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
            e.preventDefault();
            setIsPanning(true);
            setPanStart({ x: e.clientX, y: e.clientY });
        }
    };

    const renderTableShape = (table: TableDef, isSelected: boolean, hasCollision: boolean) => {
        const baseProps = {
            fill: hasCollision ? "#7f1d1d" : "#1e293b",
            stroke: isSelected ? "#3b82f6" : hasCollision ? "#ef4444" : "#374151",
            strokeWidth: isSelected ? 3 : 2,
        };

        const cx = table.x + table.w / 2;
        const cy = table.y + table.h / 2;

        switch (table.shapeType) {
            case "circle":
                return <ellipse cx={cx} cy={cy} rx={table.w / 2} ry={table.h / 2} {...baseProps} />;
            case "ellipse":
                return <ellipse cx={cx} cy={cy} rx={table.w / 2} ry={table.h / 3} {...baseProps} />;
            case "hex":
                const hr = Math.min(table.w, table.h) / 2;
                const hexPoints = Array.from({ length: 6 }, (_, i) => {
                    const angle = (Math.PI / 3) * i - Math.PI / 2;
                    return `${cx + hr * Math.cos(angle)},${cy + hr * Math.sin(angle)}`;
                }).join(" ");
                return <polygon points={hexPoints} {...baseProps} />;
            case "capsule":
                return <rect x={table.x} y={table.y} width={table.w} height={table.h} rx={table.h / 2} {...baseProps} />;
            case "roundRect":
                return <rect x={table.x} y={table.y} width={table.w} height={table.h} rx={table.cornerRadius || 12} {...baseProps} />;
            default:
                return <rect x={table.x} y={table.y} width={table.w} height={table.h} rx={4} {...baseProps} />;
        }
    };

    const renderDecoration = (decor: DecorationDef, isSelected: boolean) => {
        const config = DECORATION_CONFIG[decor.type];
        const cx = decor.x + decor.w / 2;
        const cy = decor.y + decor.h / 2;

        return (
            <g transform={`rotate(${decor.rotation} ${cx} ${cy})`}>
                {/* Background shape */}
                {decor.type === "plant" ? (
                    <>
                        <circle cx={cx} cy={cy} r={decor.w / 2} fill="#166534" stroke={isSelected ? "#3b82f6" : "#22c55e"} strokeWidth={isSelected ? 3 : 2} opacity={0.9} />
                        <circle cx={cx} cy={cy - decor.h / 4} r={decor.w / 3} fill="#15803d" opacity={0.7} />
                        <circle cx={cx - decor.w / 4} cy={cy + decor.h / 6} r={decor.w / 4} fill="#15803d" opacity={0.7} />
                        <circle cx={cx + decor.w / 4} cy={cy + decor.h / 6} r={decor.w / 4} fill="#15803d" opacity={0.7} />
                    </>
                ) : decor.type === "column" ? (
                    <>
                        <rect x={decor.x} y={decor.y} width={decor.w} height={decor.h} rx={8} fill="#44403c" stroke={isSelected ? "#3b82f6" : "#78716c"} strokeWidth={isSelected ? 3 : 2} opacity={0.95} />
                        <rect x={decor.x + 4} y={decor.y + 4} width={decor.w - 8} height={decor.h - 8} rx={4} fill="#57534e" opacity={0.5} />
                    </>
                ) : decor.type === "bar" ? (
                    <>
                        <rect x={decor.x} y={decor.y} width={decor.w} height={decor.h} rx={6} fill="#7c2d12" stroke={isSelected ? "#3b82f6" : "#ea580c"} strokeWidth={isSelected ? 3 : 2} opacity={0.9} />
                        <rect x={decor.x} y={decor.y} width={decor.w} height={decor.h / 3} rx={6} fill="#9a3412" opacity={0.6} />
                        <text x={cx} y={cy + 6} textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">BAR</text>
                    </>
                ) : decor.type === "stage" ? (
                    <>
                        <rect x={decor.x} y={decor.y} width={decor.w} height={decor.h} rx={8} fill="#581c87" stroke={isSelected ? "#3b82f6" : "#a855f7"} strokeWidth={isSelected ? 3 : 2} opacity={0.9} />
                        <path d={`M ${decor.x + decor.w / 2 - 15} ${decor.y + decor.h / 2 - 10} L ${decor.x + decor.w / 2} ${decor.y + decor.h / 2 + 10} L ${decor.x + decor.w / 2 + 15} ${decor.y + decor.h / 2 - 10} Z`} fill="#7c3aed" opacity={0.7} />
                        <text x={cx} y={cy + decor.h / 3} textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">SAHNE</text>
                    </>
                ) : decor.type === "wall" ? (
                    <>
                        <rect x={decor.x} y={decor.y} width={decor.w} height={decor.h} fill="#374151" stroke={isSelected ? "#3b82f6" : "#6b7280"} strokeWidth={isSelected ? 3 : 2} opacity={0.95} />
                        <pattern id={`brickPattern-${decor.id}`} x="0" y="0" width="20" height="10" patternUnits="userSpaceOnUse">
                            <rect width="20" height="10" fill="#4b5563" />
                            <rect width="9" height="4" fill="#374151" />
                            <rect x="11" y="0" width="9" height="4" fill="#374151" />
                            <rect x="5" y="6" width="9" height="4" fill="#374151" />
                        </pattern>
                        <rect x={decor.x} y={decor.y} width={decor.w} height={decor.h} fill={`url(#brickPattern-${decor.id})`} opacity={0.5} />
                    </>
                ) : decor.type === "door" ? (
                    <>
                        <rect x={decor.x} y={decor.y} width={decor.w} height={decor.h} rx={4} fill="#713f12" stroke={isSelected ? "#3b82f6" : "#a16207"} strokeWidth={isSelected ? 3 : 2} opacity={0.9} />
                        <rect x={decor.x + decor.w / 2 - 2} y={decor.y + decor.h / 2 - 3} width="4" height="6" rx="2" fill="#fbbf24" />
                    </>
                ) : decor.type === "window" ? (
                    <>
                        <rect x={decor.x} y={decor.y} width={decor.w} height={decor.h} rx={2} fill="#0c4a6e" stroke={isSelected ? "#3b82f6" : "#0ea5e9"} strokeWidth={isSelected ? 3 : 2} opacity={0.7} />
                        <line x1={decor.x + decor.w / 2} y1={decor.y} x2={decor.x + decor.w / 2} y2={decor.y + decor.h} stroke="#075985" strokeWidth="2" />
                        <line x1={decor.x} y1={decor.y + decor.h / 2} x2={decor.x + decor.w} y2={decor.y + decor.h / 2} stroke="#075985" strokeWidth="2" />
                    </>
                ) : decor.type === "corridor" ? (
                    <>
                        <rect x={decor.x} y={decor.y} width={decor.w} height={decor.h} rx={4} fill="#1e293b" stroke={isSelected ? "#3b82f6" : "#475569"} strokeWidth={isSelected ? 3 : 2} strokeDasharray="8 4" opacity={0.6} />
                        <path d={`M ${decor.x + 10} ${cy} L ${decor.x + decor.w - 10} ${cy}`} stroke="#64748b" strokeWidth="2" markerEnd={`url(#arrowhead-${decor.id})`} />
                        <defs>
                            <marker id={`arrowhead-${decor.id}`} markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                                <polygon points="0 0, 10 3, 0 6" fill="#64748b" />
                            </marker>
                        </defs>
                    </>
                ) : decor.type === "divider" ? (
                    <rect x={decor.x} y={decor.y} width={decor.w} height={decor.h} rx={2} fill="#475569" stroke={isSelected ? "#3b82f6" : "#64748b"} strokeWidth={isSelected ? 3 : 1} opacity={0.8} />
                ) : (
                    <>
                        <rect x={decor.x} y={decor.y} width={decor.w} height={decor.h} rx={4} fill="#1e40af" stroke={isSelected ? "#3b82f6" : "#3b82f6"} strokeWidth={isSelected ? 3 : 2} opacity={0.8} />
                        <text x={cx} y={cy + 4} textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">LABEL</text>
                    </>
                )}
            </g>
        );
    };

    const renderChair = (chair: ChairDef, isSelected: boolean) => {
        const cx = chair.x + chair.w / 2;
        const cy = chair.y + chair.h / 2;

        return (
            <g transform={`rotate(${chair.rotation} ${cx} ${cy})`}>
                {chair.shape === "circle" ? (
                    <circle cx={cx} cy={cy} r={chair.w / 2} fill="#422006" stroke={isSelected ? "#3b82f6" : "#78350f"} strokeWidth={isSelected ? 2 : 1} />
                ) : chair.shape === "rounded" ? (
                    <rect x={chair.x} y={chair.y} width={chair.w} height={chair.h} rx={6} fill="#422006" stroke={isSelected ? "#3b82f6" : "#78350f"} strokeWidth={isSelected ? 2 : 1} />
                ) : (
                    <rect x={chair.x} y={chair.y} width={chair.w} height={chair.h} fill="#422006" stroke={isSelected ? "#3b82f6" : "#78350f"} strokeWidth={isSelected ? 2 : 1} />
                )}
            </g>
        );
    };

    return (
        <div className="flex gap-4 h-[calc(100vh-280px)] min-h-[550px]">
            {/* Left Toolbar */}
            <div className="w-14 flex flex-col gap-2 p-2 rounded-xl border border-white/10 bg-white/5 shrink-0 overflow-y-auto max-h-full">
                <button onClick={() => { setTool("select"); setDecorToAdd(null); }} className={`w-full aspect-square rounded-lg flex items-center justify-center text-lg ${tool === "select" ? "bg-blue-600 text-white" : "bg-white/5 text-white/70 hover:bg-white/10"}`} title="Seç">↖</button>
                <button onClick={() => setTool("delete")} className={`w-full aspect-square rounded-lg flex items-center justify-center text-lg ${tool === "delete" ? "bg-red-600 text-white" : "bg-white/5 text-white/70 hover:bg-white/10"}`} title="Sil">🗑</button>
                <button onClick={() => setTool("addChair")} className={`w-full aspect-square rounded-lg flex items-center justify-center text-base ${tool === "addChair" ? "bg-amber-600 text-white" : "bg-white/5 text-white/70 hover:bg-white/10"}`} title="Sandalye Ekle">🪑</button>
                <div className="h-px bg-white/10 my-1" />
                <button onClick={() => setShowGrid(!showGrid)} className={`w-full aspect-square rounded-lg flex items-center justify-center text-sm font-bold ${showGrid ? "bg-white/20 text-white" : "bg-white/5 text-white/50"}`} title="Grid">#</button>
                <button onClick={() => setZoom((z) => Math.min(3, z + 0.1))} className="w-full aspect-square rounded-lg bg-white/5 text-white/70 hover:bg-white/10 flex items-center justify-center text-lg">+</button>
                <button onClick={() => setZoom((z) => Math.max(0.1, z - 0.1))} className="w-full aspect-square rounded-lg bg-white/5 text-white/70 hover:bg-white/10 flex items-center justify-center text-lg">−</button>
                <div className="h-px bg-white/10 my-1" />
                {(["plant", "bar", "wall", "column", "stage", "door"] as DecorationType[]).map((type) => (
                    <button key={type} onClick={() => { setTool("addDecor"); setDecorToAdd(type); }} className={`w-full aspect-square rounded-lg flex items-center justify-center text-xs ${tool === "addDecor" && decorToAdd === type ? "bg-emerald-600 text-white" : "bg-white/5 text-white/70 hover:bg-white/10"}`} title={DECORATION_CONFIG[type].label}>
                        {DECORATION_CONFIG[type].icon}
                    </button>
                ))}
            </div>

            {/* Canvas Area */}
            <div className="flex-1 flex flex-col rounded-xl border border-white/10 bg-[#0a0e18] overflow-hidden">
                <div className="flex items-center justify-between gap-3 p-3 border-b border-white/10 bg-white/5">
                    <div className="flex gap-2 overflow-x-auto">
                        {data.floors.map((floor) => (
                            <button key={floor.id} onClick={() => { setSelectedFloorId(floor.id); setSelectedItem(null); }} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${selectedFloorId === floor.id ? "bg-blue-600 text-white" : "bg-white/5 text-white/70 hover:bg-white/10"}`}>
                                {floor.label}
                            </button>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setShowSettings(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 text-white/80 hover:bg-white/20 text-xs font-medium">
                            ⚙️ AYARLA
                        </button>
                        <button onClick={() => onSave(data)} className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 text-xs font-bold">
                            💾 KAYDET
                        </button>
                    </div>
                </div>

                <div ref={containerRef} className="flex-1 overflow-hidden relative bg-[#050810]" onWheel={handleWheel}>
                    <svg
                        ref={canvasRef}
                        width="100%"
                        height="100%"
                        viewBox={`${-panX} ${-panY} ${CANVAS_WIDTH / zoom} ${CANVAS_HEIGHT / zoom}`}
                        className="cursor-move"
                        onMouseDown={handleMiddleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        onClick={handleCanvasClick}
                    >
                        {showGrid && (
                            <g opacity="0.08">
                                {Array.from({ length: Math.ceil(CANVAS_WIDTH / GRID_SIZE) + 1 }, (_, i) => (
                                    <line key={`v-${i}`} x1={i * GRID_SIZE} y1={0} x2={i * GRID_SIZE} y2={CANVAS_HEIGHT} stroke="white" strokeWidth={1 / zoom} />
                                ))}
                                {Array.from({ length: Math.ceil(CANVAS_HEIGHT / GRID_SIZE) + 1 }, (_, i) => (
                                    <line key={`h-${i}`} x1={0} y1={i * GRID_SIZE} x2={CANVAS_WIDTH} y2={i * GRID_SIZE} stroke="white" strokeWidth={1 / zoom} />
                                ))}
                            </g>
                        )}

                        {currentFloor?.decorations.map((decor) => (
                            <g key={decor.id} onMouseDown={(e) => handleItemMouseDown(e, { type: "decoration", id: decor.id }, decor)} style={{ cursor: tool === "delete" ? "pointer" : "move" }}>
                                {renderDecoration(decor, selectedItem?.id === decor.id)}
                            </g>
                        ))}

                        {currentFloor?.chairs.map((chair) => (
                            <g key={chair.id} onMouseDown={(e) => handleItemMouseDown(e, { type: "chair", id: chair.id }, chair)} style={{ cursor: tool === "delete" ? "pointer" : "move" }}>
                                {renderChair(chair, selectedItem?.id === chair.id)}
                            </g>
                        ))}

                        {currentFloor?.tables.map((table) => {
                            const isSelected = selectedItem?.id === table.id;
                            const hasCollision = checkCollision(table, currentFloor.tables, table.id);
                            return (
                                <g key={table.id} onMouseDown={(e) => handleItemMouseDown(e, { type: "table", id: table.id }, table)} style={{ cursor: tool === "delete" ? "pointer" : "move" }}>
                                    {renderTableShape(table, isSelected, hasCollision)}
                                    <text x={table.x + table.w / 2} y={table.y + table.h / 2 - 2} textAnchor="middle" fill="white" fontSize={11 / zoom} fontWeight="bold">{table.id}</text>
                                    <text x={table.x + table.w / 2} y={table.y + table.h / 2 + 10} textAnchor="middle" fill="#94a3b8" fontSize={9 / zoom}>{table.seats}💺</text>
                                </g>
                            );
                        })}
                    </svg>
                </div>

                <div className="flex items-center justify-between px-3 py-2 border-t border-white/10 bg-white/5 text-xs">
                    <span className="text-white/50">Zoom: {Math.round(zoom * 100)}% | Shift+Drag veya Orta Tık: Pan</span>
                    <div className="flex gap-4">
                        <span className="text-white/50">Masa: <span className="text-white font-medium">{currentFloor?.tables.length || 0}</span></span>
                        <span className="text-white/50">Sandalye: <span className="text-amber-400 font-medium">{currentFloor?.chairs.length || 0}</span></span>
                        <span className="text-white/50">Dekor: <span className="text-white/70">{currentFloor?.decorations.length || 0}</span></span>
                    </div>
                </div>
            </div>

            {/* Right Panel - Always visible */}
            <div className="w-64 flex flex-col gap-3 p-3 rounded-xl border border-white/10 bg-white/5 shrink-0 overflow-y-auto">
                <h3 className="text-xs font-bold text-white/80 uppercase tracking-wider">Detaylar</h3>

                {selectedTable ? (
                    <div className="space-y-3">
                        <div className="text-lg font-bold text-white">{selectedTable.id}</div>
                        <div>
                            <label className="text-[10px] text-white/50 uppercase">Şekil</label>
                            <select value={selectedTable.shapeType} onChange={(e) => updateTable(selectedTable.id, { shapeType: e.target.value as ShapeType })} className="w-full mt-1 rounded-lg border border-white/10 bg-black/20 px-2 py-1.5 text-xs text-white outline-none">
                                {Object.entries(SHAPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] text-white/50 uppercase">Sandalye</label>
                            <input type="number" min={1} max={20} value={selectedTable.seats} onChange={(e) => updateTable(selectedTable.id, { seats: parseInt(e.target.value) || 1 })} className="w-full mt-1 rounded-lg border border-white/10 bg-black/20 px-2 py-1.5 text-xs text-white outline-none" />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-[10px] text-white/50 uppercase">Genişlik</label>
                                <input type="number" value={selectedTable.w} onChange={(e) => updateTable(selectedTable.id, { w: parseInt(e.target.value) || 60 })} className="w-full mt-1 rounded-lg border border-white/10 bg-black/20 px-2 py-1.5 text-xs text-white outline-none" />
                            </div>
                            <div>
                                <label className="text-[10px] text-white/50 uppercase">Yükseklik</label>
                                <input type="number" value={selectedTable.h} onChange={(e) => updateTable(selectedTable.id, { h: parseInt(e.target.value) || 60 })} className="w-full mt-1 rounded-lg border border-white/10 bg-black/20 px-2 py-1.5 text-xs text-white outline-none" />
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] text-white/50 uppercase">Döndürme (°)</label>
                            <input type="range" min={0} max={360} value={selectedTable.rotation} onChange={(e) => updateTable(selectedTable.id, { rotation: parseInt(e.target.value) })} className="w-full mt-1" />
                            <div className="text-xs text-white/70 text-center">{selectedTable.rotation}°</div>
                        </div>
                        {selectedTable.shapeType === "roundRect" && (
                            <div>
                                <label className="text-[10px] text-white/50 uppercase">Köşe Yarıçapı</label>
                                <input type="range" min={0} max={30} value={selectedTable.cornerRadius || 8} onChange={(e) => updateTable(selectedTable.id, { cornerRadius: parseInt(e.target.value) })} className="w-full mt-1" />
                            </div>
                        )}
                        <button onClick={() => deleteItem(selectedItem)} className="w-full rounded-lg bg-red-600/20 border border-red-600/30 py-1.5 text-xs font-medium text-red-400 hover:bg-red-600/30">🗑 Sil</button>
                    </div>
                ) : selectedDecoration ? (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <span className="text-xl">{DECORATION_CONFIG[selectedDecoration.type].icon}</span>
                            <span className="text-sm font-bold text-white">{DECORATION_CONFIG[selectedDecoration.type].label}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-[10px] text-white/50 uppercase">Genişlik</label>
                                <input type="number" value={selectedDecoration.w} onChange={(e) => updateDecoration(selectedDecoration.id, { w: parseInt(e.target.value) || 30 })} className="w-full mt-1 rounded-lg border border-white/10 bg-black/20 px-2 py-1.5 text-xs text-white outline-none" />
                            </div>
                            <div>
                                <label className="text-[10px] text-white/50 uppercase">Yükseklik</label>
                                <input type="number" value={selectedDecoration.h} onChange={(e) => updateDecoration(selectedDecoration.id, { h: parseInt(e.target.value) || 30 })} className="w-full mt-1 rounded-lg border border-white/10 bg-black/20 px-2 py-1.5 text-xs text-white outline-none" />
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] text-white/50 uppercase">Döndürme (°)</label>
                            <input type="range" min={0} max={360} value={selectedDecoration.rotation} onChange={(e) => updateDecoration(selectedDecoration.id, { rotation: parseInt(e.target.value) })} className="w-full mt-1" />
                            <div className="text-xs text-white/70 text-center">{selectedDecoration.rotation}°</div>
                        </div>
                        <button onClick={() => deleteItem(selectedItem)} className="w-full rounded-lg bg-red-600/20 border border-red-600/30 py-1.5 text-xs font-medium text-red-400 hover:bg-red-600/30">🗑 Sil</button>
                    </div>
                ) : selectedChair ? (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <span className="text-xl">🪑</span>
                            <span className="text-sm font-bold text-white">Sandalye</span>
                        </div>
                        <div>
                            <label className="text-[10px] text-white/50 uppercase">Şekil</label>
                            <select value={selectedChair.shape} onChange={(e) => updateChair(selectedChair.id, { shape: e.target.value as ChairShape })} className="w-full mt-1 rounded-lg border border-white/10 bg-black/20 px-2 py-1.5 text-xs text-white outline-none">
                                {Object.entries(CHAIR_SHAPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-[10px] text-white/50 uppercase">Genişlik</label>
                                <input type="number" value={selectedChair.w} onChange={(e) => updateChair(selectedChair.id, { w: parseInt(e.target.value) || 20 })} className="w-full mt-1 rounded-lg border border-white/10 bg-black/20 px-2 py-1.5 text-xs text-white outline-none" />
                            </div>
                            <div>
                                <label className="text-[10px] text-white/50 uppercase">Yükseklik</label>
                                <input type="number" value={selectedChair.h} onChange={(e) => updateChair(selectedChair.id, { h: parseInt(e.target.value) || 20 })} className="w-full mt-1 rounded-lg border border-white/10 bg-black/20 px-2 py-1.5 text-xs text-white outline-none" />
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] text-white/50 uppercase">Döndürme (°)</label>
                            <input type="range" min={0} max={360} value={selectedChair.rotation} onChange={(e) => updateChair(selectedChair.id, { rotation: parseInt(e.target.value) })} className="w-full mt-1" />
                            <div className="text-xs text-white/70 text-center">{selectedChair.rotation}°</div>
                        </div>
                        <button onClick={() => deleteItem(selectedItem)} className="w-full rounded-lg bg-red-600/20 border border-red-600/30 py-1.5 text-xs font-medium text-red-400 hover:bg-red-600/30">🗑 Sil</button>
                    </div>
                ) : (
                    <div className="text-xs text-white/40 py-4 text-center">Bir öğe seçin</div>
                )}

                <div className="mt-auto pt-3 border-t border-white/10">
                    <button onClick={onBack} className="w-full rounded-lg border border-white/10 bg-white/5 py-2 text-xs font-medium text-white/70 hover:bg-white/10">← Geri</button>
                </div>
            </div>

            {/* Settings Drawer */}
            <AnimatePresence>
                {showSettings && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowSettings(false)} />
                        <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25 }} className="fixed right-0 top-0 h-full w-80 bg-[#0f1420] border-l border-white/10 z-50 overflow-y-auto">
                            <div className="p-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-bold text-white">Ayarlar</h2>
                                    <button onClick={() => setShowSettings(false)} className="text-white/50 hover:text-white text-xl">×</button>
                                </div>

                                <div className="mb-6">
                                    <h3 className="text-xs font-bold text-white/60 uppercase mb-3">Sıra Düzeni</h3>
                                    <label className="flex items-center gap-2 mb-3">
                                        <input type="checkbox" checked={currentFloor?.rowLayout.enabled || false} onChange={(e) => updateRowLayout({ enabled: e.target.checked })} className="rounded" />
                                        <span className="text-sm text-white/80">Sıra modunu etkinleştir</span>
                                    </label>
                                    {currentFloor?.rowLayout.enabled && (
                                        <div className="space-y-3 pl-2">
                                            <div>
                                                <label className="text-[10px] text-white/50 uppercase">Sıra başı masa sayısı</label>
                                                <input type="text" placeholder="4,3,5" value={currentFloor.rowLayout.rows.join(",")} onChange={(e) => updateRowLayout({ rows: e.target.value.split(",").map((n) => parseInt(n.trim()) || 0).filter((n) => n > 0) })} className="w-full mt-1 rounded-lg border border-white/10 bg-black/20 px-2 py-1.5 text-xs text-white outline-none" />
                                                <p className="text-[9px] text-white/40 mt-1">Virgülle ayırın (ör: 4,3,5)</p>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <label className="text-[10px] text-white/50 uppercase">Sıra arası</label>
                                                    <input type="number" value={currentFloor.rowLayout.rowGap} onChange={(e) => updateRowLayout({ rowGap: parseInt(e.target.value) || 20 })} className="w-full mt-1 rounded-lg border border-white/10 bg-black/20 px-2 py-1.5 text-xs text-white outline-none" />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] text-white/50 uppercase">Masa arası</label>
                                                    <input type="number" value={currentFloor.rowLayout.colGap} onChange={(e) => updateRowLayout({ colGap: parseInt(e.target.value) || 15 })} className="w-full mt-1 rounded-lg border border-white/10 bg-black/20 px-2 py-1.5 text-xs text-white outline-none" />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-white/50 uppercase">Hizalama</label>
                                                <select value={currentFloor.rowLayout.align} onChange={(e) => updateRowLayout({ align: e.target.value as "left" | "center" | "right" })} className="w-full mt-1 rounded-lg border border-white/10 bg-black/20 px-2 py-1.5 text-xs text-white outline-none">
                                                    <option value="left">Sol</option>
                                                    <option value="center">Orta</option>
                                                    <option value="right">Sağ</option>
                                                </select>
                                            </div>
                                            <button onClick={handleApplyRowLayout} className="w-full rounded-lg bg-blue-600 py-2 text-xs font-bold text-white hover:bg-blue-500">Uygula</button>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <h3 className="text-xs font-bold text-white/60 uppercase mb-3">Dekorasyon Ekle</h3>
                                    <div className="grid grid-cols-3 gap-2">
                                        {(Object.entries(DECORATION_CONFIG) as [DecorationType, typeof DECORATION_CONFIG[DecorationType]][]).map(([type, config]) => (
                                            <button key={type} onClick={() => { setTool("addDecor"); setDecorToAdd(type); setShowSettings(false); }} className="flex flex-col items-center gap-1 p-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition">
                                                <span className="text-base">{config.icon}</span>
                                                <span className="text-[9px]">{config.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
