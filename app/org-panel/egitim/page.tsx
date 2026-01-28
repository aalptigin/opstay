"use client";

import { useState, useEffect, useCallback } from "react";
import { TrainingOverviewPayload, Course } from "@/lib/training/types";
import { TrainingKpiCards } from "./_components/TrainingKpiCards";
import { MyAssignmentsList } from "./_components/MyAssignmentsList";
import { CourseCatalog } from "./_components/CourseCatalog";
import { CourseCreateModal } from "./_components/CourseCreateModal";
import { AssignCourseModal } from "./_components/AssignCourseModal";

export default function EgitimPage() {
    // Data state
    const [data, setData] = useState<TrainingOverviewPayload | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filter state
    const [kpiFilter, setKpiFilter] = useState<string | null>(null);

    // Modal state
    const [createCourseOpen, setCreateCourseOpen] = useState(false);
    const [assignCourse, setAssignCourse] = useState<Course | null>(null);

    // Load data
    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            console.log("📚 [Training] Loading overview...");
            const startTime = Date.now();

            const res = await fetch("/api/training/overview");
            const result = await res.json();

            console.log(`📚 [Training] Overview loaded in ${Date.now() - startTime}ms`);

            if (result.ok) {
                setData(result);
            } else {
                setError(result.error || "Veriler yüklenemedi");
            }
        } catch {
            setError("Bağlantı hatası");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Filter assignments based on KPI selection
    const getFilteredAssignments = () => {
        if (!data?.myAssignments) return [];
        let assignments = data.myAssignments;

        if (kpiFilter === "mandatory") {
            assignments = assignments.filter((a) => a.isMandatory && a.status !== "COMPLETED");
        } else if (kpiFilter === "pending") {
            assignments = assignments.filter((a) => a.status === "ASSIGNED" || a.status === "IN_PROGRESS");
        } else if (kpiFilter === "risky") {
            assignments = assignments.filter((a) => a.status === "FAILED" || a.status === "EXPIRED");
        }

        return assignments;
    };

    // Start course
    const handleStartCourse = async (courseId: string) => {
        try {
            await fetch(`/api/training/progress?action=start&courseId=${courseId}`, {
                method: "POST",
            });
            loadData();
        } catch (err) {
            console.error("Start course error:", err);
        }
    };

    return (
        <div className="flex flex-col min-h-full">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 px-6 py-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">📚 Eğitim</h2>
                        <p className="text-sm text-slate-500">Eğitim ve gelişim takibi</p>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Search */}
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Eğitim ara..."
                                className="pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none w-48"
                            />
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                        </div>

                        {/* Actions */}
                        {data?.permissions?.canCreateCourse && (
                            <button
                                onClick={() => setCreateCourseOpen(true)}
                                className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition"
                            >
                                + Yeni Eğitim
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {/* Content */}
            <div className="flex-1 p-6 overflow-auto">
                {/* Error */}
                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-center justify-between">
                        <span className="text-red-700">⚠️ {error}</span>
                        <button
                            onClick={loadData}
                            className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200"
                        >
                            Yeniden Dene
                        </button>
                    </div>
                )}

                {/* KPI Cards */}
                <TrainingKpiCards
                    kpi={data?.kpi || { mandatoryActive: 0, pending: 0, completionRate: 0, risky: 0 }}
                    loading={loading && !data}
                    activeFilter={kpiFilter}
                    onFilterChange={setKpiFilter}
                />

                {/* Two column layout */}
                <div className="grid lg:grid-cols-2 gap-6">
                    {/* My Assignments */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-slate-800">Benim Eğitimlerim</h3>
                            <span className="text-sm text-slate-500">
                                {getFilteredAssignments().length} eğitim
                            </span>
                        </div>
                        <MyAssignmentsList
                            assignments={getFilteredAssignments()}
                            loading={loading && !data}
                            onStartCourse={handleStartCourse}
                        />
                    </div>

                    {/* Course Catalog */}
                    <div>
                        <CourseCatalog
                            courses={data?.catalog || []}
                            loading={loading && !data}
                            canEdit={data?.permissions?.canAssign}
                            onCreateCourse={() => setCreateCourseOpen(true)}
                            onAssign={(course) => setAssignCourse(course)}
                        />
                    </div>
                </div>
            </div>

            {/* Modals */}
            <CourseCreateModal
                isOpen={createCourseOpen}
                onClose={() => setCreateCourseOpen(false)}
                onSuccess={loadData}
            />

            <AssignCourseModal
                isOpen={!!assignCourse}
                course={assignCourse}
                onClose={() => setAssignCourse(null)}
                onSuccess={loadData}
            />
        </div>
    );
}
