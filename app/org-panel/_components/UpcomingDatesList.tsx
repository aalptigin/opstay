// Upcoming Dates List Component

"use client";

import Link from "next/link";
import { UpcomingDateItem } from "@/lib/overview/types";
import { formatDate } from "@/lib/overview/timeUtils";

interface UpcomingDatesListProps {
    dates: UpcomingDateItem[];
    loading?: boolean;
}

export function UpcomingDatesList({ dates, loading }: UpcomingDatesListProps) {
    if (loading) {
        return <UpcomingDatesSkeleton />;
    }

    if (dates.length === 0) {
        return (
            <div className="p-8 text-center text-slate-400">
                <span className="text-4xl block mb-2">📅</span>
                <p className="text-sm">Yaklaşan tarihiniz yok</p>
            </div>
        );
    }

    return (
        <div className="p-4 space-y-3">
            {dates.map((item) => {
                const content = (
                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition group">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            <span className="text-2xl flex-shrink-0">{item.icon}</span>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-slate-700 truncate group-hover:text-slate-900">
                                    {item.title}
                                </p>
                                {item.subtitle && (
                                    <p className="text-xs text-slate-500 truncate">{item.subtitle}</p>
                                )}
                                <p className="text-xs text-slate-400">{formatDate(item.date)}</p>
                            </div>
                        </div>
                        <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0 ml-3 ${item.urgencyLevel === "critical"
                                    ? "bg-red-100 text-red-600"
                                    : item.urgencyLevel === "warning"
                                        ? "bg-amber-100 text-amber-600"
                                        : "bg-slate-100 text-slate-600"
                                }`}
                        >
                            {item.daysRemaining} gün
                        </span>
                    </div>
                );

                if (item.entityRef) {
                    return (
                        <Link key={item.id} href={item.entityRef}>
                            {content}
                        </Link>
                    );
                }

                return <div key={item.id}>{content}</div>;
            })}
        </div>
    );
}

function UpcomingDatesSkeleton() {
    return (
        <div className="p-4 space-y-3">
            {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 animate-pulse">
                    <div className="flex items-center gap-3 flex-1">
                        <div className="w-8 h-8 rounded bg-slate-200"></div>
                        <div className="flex-1">
                            <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                        </div>
                    </div>
                    <div className="w-16 h-6 bg-slate-200 rounded-full"></div>
                </div>
            ))}
        </div>
    );
}
