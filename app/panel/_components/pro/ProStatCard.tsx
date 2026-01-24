"use client";

import Link from "next/link";

type ProStatCardProps = {
    title: string;
    value: string | number;
    subValue: string;
    linkText?: string;
    href?: string;
    className?: string;
};

export default function ProStatCard({ title, value, subValue, linkText, href, className }: ProStatCardProps) {
    return (
        <div className={`rounded-xl border border-slate-200 bg-white p-5 flex flex-col justify-between hover:shadow-md transition-shadow ${className} shadow-sm`}>
            <div>
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">{title}</h3>
                <div className="text-3xl font-extrabold text-slate-800 tracking-tight">{value}</div>
                <div className="text-xs text-slate-500 mt-2 font-medium">{subValue}</div>
            </div>

            {linkText && href && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                    <Link href={href} className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1 group">
                        {linkText} <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                    </Link>
                </div>
            )}
        </div>
    );
}
