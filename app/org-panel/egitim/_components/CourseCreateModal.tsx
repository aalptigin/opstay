"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CourseContentType, CONTENT_TYPE_LABELS } from "@/lib/training/types";

interface CourseCreateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const CONTENT_TYPES: CourseContentType[] = ["VIDEO", "PDF", "LINK", "MIXED"];

export function CourseCreateModal({ isOpen, onClose, onSuccess }: CourseCreateModalProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [contentType, setContentType] = useState<CourseContentType>("VIDEO");
    const [contentUrl, setContentUrl] = useState("");
    const [estimatedMinutes, setEstimatedMinutes] = useState(30);
    const [hasQuiz, setHasQuiz] = useState(false);
    const [passingScore, setPassingScore] = useState(70);
    const [isMandatory, setIsMandatory] = useState(false);
    const [tags, setTags] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (title.length < 3) {
            setError("Başlık en az 3 karakter olmalı");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/training/courses", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    description: description || undefined,
                    contentType,
                    contentUrl: contentUrl || undefined,
                    estimatedMinutes,
                    hasQuiz,
                    passingScore: hasQuiz ? passingScore : 0,
                    isMandatory,
                    tags: tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                setError(data.error || "İşlem başarısız");
                return;
            }

            // Reset form
            setTitle("");
            setDescription("");
            setContentType("VIDEO");
            setContentUrl("");
            setEstimatedMinutes(30);
            setHasQuiz(false);
            setPassingScore(70);
            setIsMandatory(false);
            setTags("");

            onSuccess();
            onClose();
        } catch {
            setError("Bağlantı hatası");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto py-8">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    onClick={onClose}
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
                >
                    <div className="sticky top-0 px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50 z-10">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-slate-800">📚 Yeni Eğitim Oluştur</h2>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 rounded-lg bg-white shadow flex items-center justify-center text-slate-400 hover:text-slate-600"
                            >
                                ✕
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        {/* Title */}
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Başlık *</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Eğitim başlığı"
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Açıklama</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Eğitim açıklaması..."
                                rows={3}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none resize-none"
                            />
                        </div>

                        {/* Content Type */}
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-2">İçerik Türü</label>
                            <div className="grid grid-cols-4 gap-2">
                                {CONTENT_TYPES.map((type) => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => setContentType(type)}
                                        className={`px-3 py-2 rounded-lg text-sm font-medium transition ${contentType === type
                                                ? "bg-blue-500 text-white"
                                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                            }`}
                                    >
                                        {CONTENT_TYPE_LABELS[type]}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Content URL */}
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">İçerik URL</label>
                            <input
                                type="url"
                                value={contentUrl}
                                onChange={(e) => setContentUrl(e.target.value)}
                                placeholder="https://..."
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                            />
                        </div>

                        {/* Duration & Quiz */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Tahmini Süre (dk)</label>
                                <input
                                    type="number"
                                    value={estimatedMinutes}
                                    onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                                    min={1}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Sınav</label>
                                <div className="flex items-center gap-3 py-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={hasQuiz}
                                            onChange={(e) => setHasQuiz(e.target.checked)}
                                            className="w-4 h-4 rounded text-blue-500"
                                        />
                                        <span className="text-sm text-slate-600">Sınav var</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Passing Score (if quiz) */}
                        {hasQuiz && (
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Geçme Notu (%)</label>
                                <input
                                    type="number"
                                    value={passingScore}
                                    onChange={(e) => setPassingScore(Number(e.target.value))}
                                    min={0}
                                    max={100}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 outline-none"
                                />
                            </div>
                        )}

                        {/* Mandatory */}
                        <div>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={isMandatory}
                                    onChange={(e) => setIsMandatory(e.target.checked)}
                                    className="w-4 h-4 rounded text-purple-500"
                                />
                                <span className="text-sm text-slate-600">Varsayılan olarak zorunlu</span>
                            </label>
                        </div>

                        {/* Tags */}
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Etiketler (virgülle ayırın)</label>
                            <input
                                type="text"
                                value={tags}
                                onChange={(e) => setTags(e.target.value)}
                                placeholder="güvenlik, zorunlu, temel"
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                            />
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm">
                                ⚠️ {error}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 transition"
                            >
                                İptal
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold shadow-lg shadow-blue-500/20 disabled:opacity-50 transition"
                            >
                                {loading ? "Kaydediliyor..." : "Oluştur"}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
