"use client";

import { useState, useCallback, useRef, useEffect, RefObject } from "react";

interface Transform {
    x: number;
    y: number;
    scale: number;
}

interface BBox {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface UsePanZoomOptions {
    containerRef: RefObject<HTMLDivElement | null>;
    contentBBox: BBox;
    padding?: number;
}

interface UsePanZoomReturn {
    transform: Transform;
    fitScale: number;
    isReady: boolean;
    zoomIn: () => void;
    zoomOut: () => void;
    resetToFit: () => void;
    zoomToEntity: (bbox: BBox) => void;
    handlers: {
        onWheel: (e: React.WheelEvent) => void;
        onMouseDown: (e: React.MouseEvent) => void;
        onMouseMove: (e: React.MouseEvent) => void;
        onMouseUp: () => void;
        onMouseLeave: () => void;
    };
}

export function usePanZoom({
    containerRef,
    contentBBox,
    padding = 32,
}: UsePanZoomOptions): UsePanZoomReturn {
    const [transform, setTransform] = useState<Transform>({ x: 0, y: 0, scale: 1 });
    const [fitScale, setFitScale] = useState(1);
    const [isReady, setIsReady] = useState(false);
    const isPanning = useRef(false);
    const startPoint = useRef({ x: 0, y: 0 });
    const startTransform = useRef({ x: 0, y: 0 });

    // Fit transform hesaplama
    const calculateFitTransform = useCallback((): Transform | null => {
        const container = containerRef.current;
        if (!container) return null;

        const rect = container.getBoundingClientRect();
        const vw = rect.width;
        const vh = rect.height;

        if (vw === 0 || vh === 0) return null;

        const bw = contentBBox.width;
        const bh = contentBBox.height;

        if (bw === 0 || bh === 0) return null;

        // Fit scale: her iki eksende de sığacak en büyük scale
        const scaleX = (vw - padding * 2) / bw;
        const scaleY = (vh - padding * 2) / bh;
        const scale = Math.min(scaleX, scaleY);

        // Content'i merkeze getir
        const scaledWidth = bw * scale;
        const scaledHeight = bh * scale;
        const x = (vw - scaledWidth) / 2 - contentBBox.x * scale;
        const y = (vh - scaledHeight) / 2 - contentBBox.y * scale;

        return { x, y, scale };
    }, [containerRef, contentBBox, padding]);

    // İlk mount'ta ve resize'da fit uygula
    useEffect(() => {
        let mounted = true;

        const applyFit = () => {
            const fit = calculateFitTransform();
            if (fit && mounted) {
                setTransform(fit);
                setFitScale(fit.scale);
                setIsReady(true);
            }
        };

        // Container hazır olduğunda fit uygula
        const checkAndApply = () => {
            const container = containerRef.current;
            if (container && container.clientWidth > 0 && container.clientHeight > 0) {
                applyFit();
            } else {
                // Container henüz boyutlanmamış, tekrar dene
                requestAnimationFrame(checkAndApply);
            }
        };

        // İlk çalıştırma
        checkAndApply();

        // Resize handler
        const handleResize = () => {
            const fit = calculateFitTransform();
            if (fit && mounted) {
                setFitScale(fit.scale);
            }
        };

        window.addEventListener("resize", handleResize);
        return () => {
            mounted = false;
            window.removeEventListener("resize", handleResize);
        };
    }, [calculateFitTransform, containerRef]);

    // Dinamik zoom limitleri (fitScale'e göre)
    const minZoom = fitScale * 0.5;
    const maxZoom = fitScale * 10;

    // Wheel zoom (cursor'a doğru)
    const handleWheel = useCallback((e: React.WheelEvent) => {
        e.preventDefault();

        const container = containerRef.current;
        if (!container) return;

        const rect = container.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;

        setTransform((prev) => {
            const newScale = Math.min(Math.max(prev.scale * zoomFactor, minZoom), maxZoom);
            const scaleRatio = newScale / prev.scale;

            // Zoom toward cursor position
            const newX = mouseX - (mouseX - prev.x) * scaleRatio;
            const newY = mouseY - (mouseY - prev.y) * scaleRatio;

            return { x: newX, y: newY, scale: newScale };
        });
    }, [containerRef, minZoom, maxZoom]);

    // Pan handlers
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (e.button === 0) {
            isPanning.current = true;
            startPoint.current = { x: e.clientX, y: e.clientY };
            startTransform.current = { x: transform.x, y: transform.y };
        }
    }, [transform]);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (isPanning.current) {
            const dx = e.clientX - startPoint.current.x;
            const dy = e.clientY - startPoint.current.y;
            setTransform((prev) => ({
                ...prev,
                x: startTransform.current.x + dx,
                y: startTransform.current.y + dy,
            }));
        }
    }, []);

    const handleMouseUp = useCallback(() => {
        isPanning.current = false;
    }, []);

    // Zoom controls
    const zoomIn = useCallback(() => {
        const container = containerRef.current;
        if (!container) return;

        const rect = container.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        setTransform((prev) => {
            const newScale = Math.min(prev.scale * 1.3, maxZoom);
            const scaleRatio = newScale / prev.scale;
            return {
                scale: newScale,
                x: centerX - (centerX - prev.x) * scaleRatio,
                y: centerY - (centerY - prev.y) * scaleRatio,
            };
        });
    }, [containerRef, maxZoom]);

    const zoomOut = useCallback(() => {
        const container = containerRef.current;
        if (!container) return;

        const rect = container.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        setTransform((prev) => {
            const newScale = Math.max(prev.scale * 0.75, minZoom);
            const scaleRatio = newScale / prev.scale;
            return {
                scale: newScale,
                x: centerX - (centerX - prev.x) * scaleRatio,
                y: centerY - (centerY - prev.y) * scaleRatio,
            };
        });
    }, [containerRef, minZoom]);

    const resetToFit = useCallback(() => {
        const fit = calculateFitTransform();
        if (fit) {
            setTransform(fit);
        }
    }, [calculateFitTransform]);

    const zoomToEntity = useCallback((bbox: BBox) => {
        const container = containerRef.current;
        if (!container) return;

        const rect = container.getBoundingClientRect();
        const vw = rect.width;
        const vh = rect.height;

        const entityPadding = 80;
        const scaleX = (vw - entityPadding * 2) / bbox.width;
        const scaleY = (vh - entityPadding * 2) / bbox.height;
        const scale = Math.min(scaleX, scaleY, maxZoom);

        const x = vw / 2 - (bbox.x + bbox.width / 2) * scale;
        const y = vh / 2 - (bbox.y + bbox.height / 2) * scale;

        setTransform({ x, y, scale });
    }, [containerRef, maxZoom]);

    return {
        transform,
        fitScale,
        isReady,
        zoomIn,
        zoomOut,
        resetToFit,
        zoomToEntity,
        handlers: {
            onWheel: handleWheel,
            onMouseDown: handleMouseDown,
            onMouseMove: handleMouseMove,
            onMouseUp: handleMouseUp,
            onMouseLeave: handleMouseUp,
        },
    };
}
