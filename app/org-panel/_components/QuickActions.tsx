// Quick Actions Grid Component

import { QuickActionConfig } from "@/lib/overview/types";
import Link from "next/link";

interface QuickActionsProps {
    actions: QuickActionConfig[];
    loading?: boolean;
}

export function QuickActions({ actions, loading }: QuickActionsProps) {
    if (loading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="p-4 rounded-xl bg-white border border-slate-200 animate-pulse">
                        <div className="w-12 h-12 bg-slate-200 rounded mx-auto mb-2"></div>
                        <div className="h-4 bg-slate-200 rounded w-24 mx-auto"></div>
                    </div>
                ))}
            </div>
        );
    }

    // Filter visible actions
    const visibleActions = actions.filter((a) => a.visible);

    if (visibleActions.length === 0) {
        return null;
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {visibleActions.map((action) => (
                <Link key={action.id} href={action.href}>
                    <div
                        className={`p-4 rounded-xl bg-white border border-slate-200 hover:border-${action.color}-300 hover:shadow-md transition-all text-center group cursor-pointer`}
                    >
                        <span className="text-3xl block mb-2 group-hover:scale-110 transition-transform">
                            {action.icon}
                        </span>
                        <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">
                            {action.label}
                        </span>
                    </div>
                </Link>
            ))}
        </div>
    );
}
