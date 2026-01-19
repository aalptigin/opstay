"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";

type ToastProps = {
    message: string;
    type: "success" | "error" | "info";
    show: boolean;
    onClose: () => void;
    duration?: number;
};

export default function Toast({
    message,
    type,
    show,
    onClose,
    duration = 5000,
}: ToastProps) {
    useEffect(() => {
        if (show && duration > 0) {
            const timer = setTimeout(onClose, duration);
            return () => clearTimeout(timer);
        }
    }, [show, duration, onClose]);

    const bgColor = {
        success: "bg-green-500",
        error: "bg-red-500",
        info: "bg-blue-500",
    }[type];

    const icon = {
        success: "✓",
        error: "✕",
        info: "ℹ",
    }[type];

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0, y: -50, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -50, scale: 0.95 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="fixed top-6 right-6 z-[100] max-w-md"
                    role="alert"
                    aria-live="assertive"
                    aria-atomic="true"
                >
                    <div
                        className={`${bgColor} rounded-xl shadow-2xl shadow-black/30 p-4 flex items-center gap-3 text-white`}
                    >
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-lg">
                            {icon}
                        </div>
                        <p className="flex-1 text-sm font-medium leading-relaxed">
                            {message}
                        </p>
                        <button
                            onClick={onClose}
                            className="flex-shrink-0 h-6 w-6 rounded-full hover:bg-white/20 transition-colors flex items-center justify-center"
                            aria-label="Kapat"
                        >
                            ✕
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
