"use client";

import Link from "next/link";

type ListItem = {
    id: string;
    title: string;
    subtitle: string;
    meta: string;
    statusColor?: "yellow" | "red" | "green" | "gray";
};

type ProListWidgetProps = {
    title: string;
    items: ListItem[];
    emptyMessage: string;
    seeAllLink?: string;
};

export default function ProListWidget({ title, items, emptyMessage, seeAllLink }: ProListWidgetProps) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white flex flex-col overflow-hidden h-full max-h-[400px] shadow-sm">
            <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
                <h3 className="text-sm font-bold text-slate-700">{title}</h3>
                {seeAllLink && (
                    <Link href={seeAllLink} className="text-[10px] font-bold uppercase text-slate-400 hover:text-blue-600 transition-colors">
                        Tümü →
                    </Link>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {items.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400 italic">
                        {emptyMessage}
                    </div>
                ) : (
                    items.map((item) => (
                        <div key={item.id} className="group flex items-start justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                            <div>
                                <div className="text-sm font-semibold text-slate-700 group-hover:text-blue-700 mb-0.5">{item.title}</div>
                                <div className="text-xs text-slate-500 line-clamp-1">{item.subtitle}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] font-mono text-slate-400">{item.meta}</div>
                                {item.statusColor && (
                                    <div className={`mt-1 h-1.5 w-1.5 rounded-full ml-auto ${item.statusColor === 'yellow' ? 'bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.5)]' :
                                            item.statusColor === 'red' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' :
                                                'bg-slate-300'
                                        }`} />
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
