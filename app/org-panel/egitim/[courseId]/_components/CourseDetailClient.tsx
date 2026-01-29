"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Course, LearnerProgress, CONTENT_TYPE_ICONS, STATUS_LABELS, STATUS_COLORS } from "@/lib/training/types";

interface QuizQuestionClient {
    id: string;
    type: "SINGLE_CHOICE" | "MULTI_CHOICE" | "TRUE_FALSE";
    prompt: string;
    options: { id: string; label: string }[];
}

interface QuizResult {
    score: number;
    passed: boolean;
    totalQuestions: number;
    correctCount: number;
}

export default function CourseDetailClient() {
    const params = useParams();
    const router = useRouter();
    const courseId = params.courseId as string;

    // Data state
    const [course, setCourse] = useState<Course | null>(null);
    const [progress, setProgress] = useState<LearnerProgress | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Quiz state
    const [quizMode, setQuizMode] = useState(false);
    const [questions, setQuestions] = useState<QuizQuestionClient[]>([]);
    const [answers, setAnswers] = useState<Record<string, string[]>>({});
    const [quizLoading, setQuizLoading] = useState(false);
    const [quizResult, setQuizResult] = useState<QuizResult | null>(null);

    // Load course data
    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const [coursesRes, progressRes] = await Promise.all([
                fetch("/api/training/courses?status=PUBLISHED"),
                fetch("/api/training/progress"),
            ]);

            const coursesData = await coursesRes.json();
            const progressData = await progressRes.json();

            if (coursesData.ok) {
                const foundCourse = coursesData.courses.find((c: Course) => c.id === courseId);
                setCourse(foundCourse || null);
            }

            if (progressData.ok) {
                const foundProgress = progressData.progress.find((p: LearnerProgress) => p.courseId === courseId);
                setProgress(foundProgress || null);
            }
        } catch {
            setError("Veri yüklenemedi");
        } finally {
            setLoading(false);
        }
    }, [courseId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Start quiz
    const handleStartQuiz = async () => {
        setQuizLoading(true);
        try {
            const res = await fetch(`/api/training/quiz?courseId=${courseId}`);
            const data = await res.json();

            if (data.ok) {
                setQuestions(data.questions);
                setAnswers({});
                setQuizResult(null);
                setQuizMode(true);
            }
        } catch {
            setError("Quiz yüklenemedi");
        } finally {
            setQuizLoading(false);
        }
    };

    // Toggle answer
    const toggleAnswer = (questionId: string, optionId: string, type: QuizQuestionClient["type"]) => {
        setAnswers((prev) => {
            const current = prev[questionId] || [];
            if (type === "MULTI_CHOICE") {
                return {
                    ...prev,
                    [questionId]: current.includes(optionId)
                        ? current.filter((id) => id !== optionId)
                        : [...current, optionId],
                };
            } else {
                return {
                    ...prev,
                    [questionId]: [optionId],
                };
            }
        });
    };

    // Submit quiz
    const handleSubmitQuiz = async () => {
        setQuizLoading(true);
        try {
            const res = await fetch(`/api/training/quiz?courseId=${courseId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    answers: Object.entries(answers).map(([questionId, selectedOptionIds]) => ({
                        questionId,
                        selectedOptionIds,
                    })),
                }),
            });

            const data = await res.json();
            if (data.ok) {
                setQuizResult(data.result);
                loadData();
            }
        } catch {
            setError("Quiz gönderilemedi");
        } finally {
            setQuizLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-full p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-slate-200 rounded w-1/3" />
                    <div className="h-4 bg-slate-100 rounded w-1/2" />
                    <div className="h-64 bg-slate-100 rounded-xl" />
                </div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="min-h-full p-6 flex items-center justify-center">
                <div className="text-center">
                    <span className="text-4xl block mb-3">❌</span>
                    <h2 className="text-lg font-semibold text-slate-700 mb-2">Eğitim bulunamadı</h2>
                    <Link href="/org-panel/egitim">
                        <button className="px-4 py-2 rounded-lg bg-blue-500 text-white font-medium">
                            ← Eğitimlere Dön
                        </button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-full flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 px-6 py-4">
                <div className="flex items-center gap-4 mb-2">
                    <Link href="/org-panel/egitim" className="text-slate-400 hover:text-slate-600">
                        ← Geri
                    </Link>
                </div>
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-2xl">{CONTENT_TYPE_ICONS[course.contentType]}</span>
                            <h1 className="text-xl font-bold text-slate-800">{course.title}</h1>
                        </div>
                        {course.description && (
                            <p className="text-slate-600 max-w-2xl">{course.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-3">
                            {course.isMandatory && (
                                <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-700 text-xs font-medium">Zorunlu</span>
                            )}
                            {course.hasQuiz && (
                                <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-xs font-medium">📝 Sınav var (Geçme: %{course.passingScore})</span>
                            )}
                            <span className="text-sm text-slate-500">⏱️ {course.estimatedMinutes} dk</span>
                            {progress && (
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[progress.status]}`}>
                                    {STATUS_LABELS[progress.status]}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Content */}
            <div className="flex-1 p-6">
                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">
                        ⚠️ {error}
                    </div>
                )}

                {!quizMode ? (
                    <div className="grid lg:grid-cols-3 gap-6">
                        {/* Main content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Content player/link */}
                            <div className="bg-white rounded-xl border border-slate-200 p-6">
                                <h3 className="font-semibold text-slate-800 mb-4">İçerik</h3>
                                {course.contentUrl ? (
                                    <a
                                        href={course.contentUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition"
                                    >
                                        <span className="text-2xl">{CONTENT_TYPE_ICONS[course.contentType]}</span>
                                        <div>
                                            <p className="font-medium text-blue-600">İçeriği Görüntüle</p>
                                            <p className="text-sm text-slate-500 truncate max-w-md">{course.contentUrl}</p>
                                        </div>
                                    </a>
                                ) : (
                                    <p className="text-slate-500">İçerik URL'si belirtilmemiş</p>
                                )}
                            </div>

                            {/* Progress */}
                            {progress && progress.status !== "COMPLETED" && (
                                <div className="bg-white rounded-xl border border-slate-200 p-6">
                                    <h3 className="font-semibold text-slate-800 mb-4">İlerleme</h3>
                                    <div className="flex items-center gap-4">
                                        <div className="flex-1">
                                            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
                                                    style={{ width: `${progress.progressPct}%` }}
                                                />
                                            </div>
                                        </div>
                                        <span className="text-sm font-medium text-slate-600">{progress.progressPct}%</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Quiz card */}
                            {course.hasQuiz && (
                                <div className="bg-white rounded-xl border border-slate-200 p-6">
                                    <h3 className="font-semibold text-slate-800 mb-4">📝 Sınav</h3>
                                    {progress?.status === "COMPLETED" ? (
                                        <div className="text-center py-4">
                                            <span className="text-4xl block mb-2">🎉</span>
                                            <p className="text-green-600 font-semibold">Tamamlandı!</p>
                                            <p className="text-slate-600">Puan: {progress.lastQuizScore}</p>
                                        </div>
                                    ) : (
                                        <>
                                            <p className="text-sm text-slate-600 mb-4">
                                                Geçme notu: <strong>%{course.passingScore}</strong>
                                            </p>
                                            {progress?.quizAttemptCount && progress.quizAttemptCount > 0 && (
                                                <p className="text-sm text-slate-500 mb-4">
                                                    Son puan: {progress.lastQuizScore} ({progress.quizAttemptCount} deneme)
                                                </p>
                                            )}
                                            <button
                                                onClick={handleStartQuiz}
                                                disabled={quizLoading}
                                                className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition disabled:opacity-50"
                                            >
                                                {quizLoading ? "Yükleniyor..." : "Sınava Başla"}
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}

                            {/* Tags */}
                            {course.tags.length > 0 && (
                                <div className="bg-white rounded-xl border border-slate-200 p-6">
                                    <h3 className="font-semibold text-slate-800 mb-3">Etiketler</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {course.tags.map((tag) => (
                                            <span key={tag} className="px-2 py-1 rounded bg-slate-100 text-slate-600 text-sm">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    /* Quiz Mode */
                    <div className="max-w-2xl mx-auto">
                        {quizResult ? (
                            /* Results */
                            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
                                <span className="text-6xl block mb-4">{quizResult.passed ? "🎉" : "😔"}</span>
                                <h2 className={`text-2xl font-bold mb-2 ${quizResult.passed ? "text-green-600" : "text-red-600"}`}>
                                    {quizResult.passed ? "Tebrikler!" : "Tekrar Deneyin"}
                                </h2>
                                <p className="text-4xl font-bold text-slate-800 mb-4">%{quizResult.score}</p>
                                <p className="text-slate-600 mb-6">
                                    {quizResult.correctCount} / {quizResult.totalQuestions} doğru
                                </p>
                                <div className="flex justify-center gap-4">
                                    <button
                                        onClick={() => {
                                            setQuizMode(false);
                                            setQuizResult(null);
                                        }}
                                        className="px-6 py-2 rounded-xl bg-slate-100 text-slate-700 font-medium hover:bg-slate-200"
                                    >
                                        Eğitime Dön
                                    </button>
                                    {!quizResult.passed && (
                                        <button
                                            onClick={handleStartQuiz}
                                            className="px-6 py-2 rounded-xl bg-blue-500 text-white font-medium hover:bg-blue-600"
                                        >
                                            Tekrar Dene
                                        </button>
                                    )}
                                </div>
                            </div>
                        ) : (
                            /* Questions */
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-semibold text-slate-800">Sınav Soruları</h2>
                                    <span className="text-sm text-slate-500">{questions.length} soru</span>
                                </div>

                                {questions.map((q, idx) => (
                                    <div key={q.id} className="bg-white rounded-xl border border-slate-200 p-6">
                                        <p className="font-medium text-slate-800 mb-4">
                                            {idx + 1}. {q.prompt}
                                        </p>
                                        <div className="space-y-2">
                                            {q.options.map((opt) => {
                                                const isSelected = (answers[q.id] || []).includes(opt.id);
                                                return (
                                                    <button
                                                        key={opt.id}
                                                        onClick={() => toggleAnswer(q.id, opt.id, q.type)}
                                                        className={`w-full p-3 rounded-lg text-left transition ${isSelected
                                                            ? "bg-blue-500 text-white"
                                                            : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                                                            }`}
                                                    >
                                                        {q.type === "MULTI_CHOICE" && (
                                                            <span className="mr-2">{isSelected ? "☑" : "☐"}</span>
                                                        )}
                                                        {opt.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}

                                <div className="flex justify-between">
                                    <button
                                        onClick={() => setQuizMode(false)}
                                        className="px-6 py-3 rounded-xl text-slate-600 hover:bg-slate-100"
                                    >
                                        İptal
                                    </button>
                                    <button
                                        onClick={handleSubmitQuiz}
                                        disabled={quizLoading || Object.keys(answers).length !== questions.length}
                                        className="px-8 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold shadow-lg shadow-green-500/20 disabled:opacity-50 transition"
                                    >
                                        {quizLoading ? "Gönderiliyor..." : "Sınavı Bitir"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
