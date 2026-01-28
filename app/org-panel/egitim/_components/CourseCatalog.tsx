"use client";

import { Course, CONTENT_TYPE_LABELS, CONTENT_TYPE_ICONS, COURSE_STATUS_LABELS } from "@/lib/training/types";

interface CourseCatalogProps {
    courses: Course[];
    loading?: boolean;
    canEdit?: boolean;
    onCreateCourse?: () => void;
    onAssign?: (course: Course) => void;
}

export function CourseCatalog({ courses, loading, canEdit, onCreateCourse, onAssign }: CourseCatalogProps) {
    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="p-5 space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-16 bg-slate-100 rounded animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-semibold text-slate-800">Eğitim Kataloğu</h3>
                {canEdit && onCreateCourse && (
                    <button
                        onClick={onCreateCourse}
                        className="px-3 py-1.5 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition"
                    >
                        + Yeni Eğitim
                    </button>
                )}
            </div>

            {courses.length === 0 ? (
                <div className="p-8 text-center">
                    <span className="text-3xl block mb-2">📚</span>
                    <p className="text-slate-500 mb-4">Henüz eğitim içeriği yok</p>
                    {canEdit && onCreateCourse && (
                        <button
                            onClick={onCreateCourse}
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold shadow-lg shadow-blue-500/20"
                        >
                            + Yeni Eğitim Oluştur
                        </button>
                    )}
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Eğitim</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Tür</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Süre</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Sınav</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Durum</th>
                                {canEdit && <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">İşlem</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {courses.map((course) => (
                                <tr key={course.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <span className="text-xl">{CONTENT_TYPE_ICONS[course.contentType]}</span>
                                            <div>
                                                <p className="font-medium text-slate-800">{course.title}</p>
                                                <div className="flex gap-1 mt-1">
                                                    {course.isMandatory && (
                                                        <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 text-xs">Zorunlu</span>
                                                    )}
                                                    {course.tags.slice(0, 2).map((tag) => (
                                                        <span key={tag} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-xs">{tag}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-600">
                                        {CONTENT_TYPE_LABELS[course.contentType]}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-600">
                                        {course.estimatedMinutes} dk
                                    </td>
                                    <td className="px-4 py-3">
                                        {course.hasQuiz ? (
                                            <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-xs font-medium">
                                                📝 %{course.passingScore}
                                            </span>
                                        ) : (
                                            <span className="text-slate-400 text-sm">—</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${course.status === "PUBLISHED" ? "bg-green-100 text-green-700" :
                                                course.status === "DRAFT" ? "bg-amber-100 text-amber-700" :
                                                    "bg-slate-100 text-slate-600"
                                            }`}>
                                            {COURSE_STATUS_LABELS[course.status]}
                                        </span>
                                    </td>
                                    {canEdit && (
                                        <td className="px-4 py-3 text-right">
                                            <button
                                                onClick={() => onAssign?.(course)}
                                                className="px-3 py-1.5 rounded-lg bg-indigo-100 text-indigo-700 text-sm font-medium hover:bg-indigo-200 transition"
                                            >
                                                Ata
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
