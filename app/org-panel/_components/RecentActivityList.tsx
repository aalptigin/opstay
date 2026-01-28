// Recent Activity List Component

"use client";

import Link from "next/link";
import { ActivityItem } from "@/lib/overview/types";
import { formatTimeAgo } from "@/lib/overview/timeUtils";

interface RecentActivityListProps {
    activities: ActivityItem[];
    loading?: boolean;
}

export function RecentActivityList({ activities, loading }: RecentActivityListProps) {
    if (loading) {
        return <RecentActivitySkeleton />;
    }

    if (activities.length === 0) {
        return (
            <div className="p-8 text-center text-slate-400">
                <span className="text-4xl block mb-2">📭</span>
                <p className="text-sm">Henüz hareket yok</p>
            </div>
        );
    }

    return (
        <div className="p-4 space-y-3">
            {activities.map((item) => {
                const content = (
                    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition group">
                        <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: `${item.color}20` }}
                        >
                            <span className="text-lg">{item.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-slate-700 truncate group-hover:text-slate-900">
                                {item.title}
                            </p>
                            {item.subtitle && (
                                <p className="text-xs text-slate-500 truncate">{item.subtitle}</p>
                            )}
                            <p className="text-xs text-slate-400 mt-0.5">
                                {formatTimeAgo(item.createdAt)}
                            </p>
                        </div>
                        {item.severity === "critical" && (
                            <span className="px-2 py-1 rounded-full bg-red-100 text-red-600 text-xs font-semibold">
                                Kritik
                            </span>
                        )}
                        {item.severity === "warning" && (
                            <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-600 text-xs font-semibold">
                                Uyarı
                            </span>
                        )}
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

function RecentActivitySkeleton() {
    return (
        <div className="p-4 space-y-3">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
                    <div className="w-10 h-10 rounded-lg bg-slate-200"></div>
                    <div className="flex-1">
                        <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                    </div>
                </div>
            ))}
        </div>
    );
}
