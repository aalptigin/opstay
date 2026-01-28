// KPI Card Component with Loading State

import Link from "next/link";

interface KpiCardProps {
    title: string;
    value: number;
    icon: string;
    color: string;
    href?: string;
    loading?: boolean;
    critical?: boolean;
    borderColor?: string;
}

export function KpiCard({ title, value, icon, color, href, loading, critical, borderColor }: KpiCardProps) {
    const content = (
        <div className={`bg-white rounded-xl p-5 border border-slate-200 border-l-4 shadow-sm transition-all ${href ? 'cursor-pointer hover:shadow-md' : ''}`}
            style={{ borderLeftColor: borderColor || color }}
        >
            {loading ? (
                <div className="animate-pulse">
                    <div className="h-4 bg-slate-200 rounded w-32 mb-2"></div>
                    <div className="h-8 bg-slate-300 rounded w-16"></div>
                </div>
            ) : (
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-slate-500">{title}</p>
                        <p className={`text-2xl font-bold mt-1 ${critical ? 'text-red-600' : 'text-slate-800'}`}>
                            {value}
                        </p>
                    </div>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                        style={{ backgroundColor: `${color}20` }}
                    >
                        {icon}
                    </div>
                </div>
            )}
        </div>
    );

    if (href && !loading) {
        return <Link href={href}>{content}</Link>;
    }

    return content;
}

// Loading skeleton version
export function KpiCardSkeleton() {
    return (
        <div className="bg-white rounded-xl p-5 border border-slate-200 border-l-4 border-l-slate-300 shadow-sm animate-pulse">
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <div className="h-4 bg-slate-200 rounded w-32 mb-2"></div>
                    <div className="h-8 bg-slate-300 rounded w-16"></div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-slate-200"></div>
            </div>
        </div>
    );
}
