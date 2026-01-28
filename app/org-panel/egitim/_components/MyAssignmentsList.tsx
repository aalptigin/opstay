"use client";

import Link from "next/link";
import { LearnerProgress, STATUS_LABELS, STATUS_COLORS, CONTENT_TYPE_ICONS } from "@/lib/training/types";

interface MyAssignmentsListProps {
    assignments: LearnerProgress[];
    loading?: boolean;
    onStartCourse?: (courseId: string) => void;
}

function getDaysRemaining(dueDate?: string): { text: string; urgent: boolean } | null {
    if (!dueDate) return null;
    const due = new Date(dueDate);
    const now = new Date();
    const diffMs = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { text: "Süresi doldu", urgent: true };
    if (diffDays === 0) return { text: "Bugün son gün", urgent: true };
    if (diffDays <= 3) return { text: `${diffDays} gün kaldı`, urgent: true };
    return { text: `${diffDays} gün kaldı`, urgent: false };
}

function AssignmentCard({ assignment, onStart }: { assignment: LearnerProgress; onStart?: () => void }) {
    const course = assignment.course;
    const daysInfo = getDaysRemaining(assignment.dueDate);
    const isCompleted = assignment.status === "COMPLETED";
    const isFailed = assignment.status === "FAILED" || assignment.status === "EXPIRED";

    const getCtaButton = () => {
        switch (assignment.status) {
            case "ASSIGNED":
                return (
                    <button
                        onClick={onStart}
                        className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-semibold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition"
                    >
                        Başla
                    </button>
                );
            case "IN_PROGRESS":
                return (
                    <Link href={`/org-panel/egitim/${assignment.courseId}`}>
                        <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 transition">
                            Devam Et
                        </button>
                    </Link>
                );
            case "FAILED":
            case "EXPIRED":
                return (
                    <button
                        onClick={onStart}
                        className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition"
                    >
                        Tekrar Dene
                    </button>
                );
            case "COMPLETED":
                return (
                    <Link href={`/org-panel/egitim/${assignment.courseId}`}>
                        <button className="px-4 py-2 rounded-lg bg-green-100 text-green-700 text-sm font-medium hover:bg-green-200 transition">
                            Görüntüle
                        </button>
                    </Link>
                );
            default:
                return null;
        }
    };

    return (
        <div className={`bg-white rounded-xl border p-5 transition hover:shadow-md ${isFailed ? "border-red-200" : "border-slate-200"}`}>
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">{course ? CONTENT_TYPE_ICONS[course.contentType] : "📚"}</span>
                        <h3 className="font-semibold text-slate-800 truncate">
                            {course?.title || "Bilinmeyen Eğitim"}
                        </h3>
                    </div>
                    {course?.description && (
                        <p className="text-sm text-slate-500 line-clamp-2 mb-2">{course.description}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[assignment.status]}`}>
                            {STATUS_LABELS[assignment.status]}
                        </span>
                        {assignment.isMandatory && (
                            <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-700 text-xs font-medium">
                                Zorunlu
                            </span>
                        )}
                        {daysInfo && (
                            <span className={`text-xs ${daysInfo.urgent ? "text-red-600 font-semibold" : "text-slate-500"}`}>
                                ⏰ {daysInfo.text}
                            </span>
                        )}
                        {course?.hasQuiz && (
                            <span className="text-xs text-slate-400">📝 Sınav var</span>
                        )}
                    </div>
                </div>
                <div className="flex-shrink-0">
                    {getCtaButton()}
                </div>
            </div>

            {/* Progress bar */}
            {!isCompleted && assignment.progressPct > 0 && (
                <div className="mt-4">
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                        <span>İlerleme</span>
                        <span>{assignment.progressPct}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all"
                            style={{ width: `${assignment.progressPct}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Quiz score for completed */}
            {isCompleted && assignment.lastQuizScore !== undefined && (
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2 text-sm">
                    <span className="text-green-600">✅</span>
                    <span className="text-slate-600">Sınav Puanı: <strong>{assignment.lastQuizScore}</strong></span>
                </div>
            )}
        </div>
    );
}

export function MyAssignmentsList({ assignments, loading, onStartCourse }: MyAssignmentsListProps) {
    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse">
                        <div className="h-5 bg-slate-200 rounded w-2/3 mb-3" />
                        <div className="h-4 bg-slate-100 rounded w-1/2 mb-2" />
                        <div className="h-2 bg-slate-100 rounded w-full" />
                    </div>
                ))}
            </div>
        );
    }

    if (assignments.length === 0) {
        return (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
                <span className="text-4xl block mb-3">📚</span>
                <h3 className="font-semibold text-slate-700 mb-2">Atanan eğitim yok</h3>
                <p className="text-slate-500 text-sm">Size atanan eğitimler burada görünecek</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {assignments.map((assignment) => (
                <AssignmentCard
                    key={assignment.id}
                    assignment={assignment}
                    onStart={() => onStartCourse?.(assignment.courseId)}
                />
            ))}
        </div>
    );
}
