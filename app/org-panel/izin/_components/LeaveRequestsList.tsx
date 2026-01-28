"use client";

import { LeaveRequest, LEAVE_STATUS_COLORS, LEAVE_STATUS_LABELS, LEAVE_TYPE_LABELS, LeaveStatus } from "@/lib/leave/types";
import { formatDate, formatTimeAgo } from "@/lib/audit/utils"; // Reuse utils

interface LeaveRequestsListProps {
    requests: LeaveRequest[];
    loading?: boolean;
    activeId?: string;
    onSelect: (req: LeaveRequest) => void;
}

export function LeaveRequestsList({ requests, loading, activeId, onSelect }: LeaveRequestsListProps) {
    if (loading) {
        return <div className="space-y-3 p-4"><div className="h-20 bg-slate-50 rounded animate-pulse" /><div className="h-20 bg-slate-50 rounded animate-pulse" /></div>;
    }

    if (requests.length === 0) {
        return <div className="p-8 text-center text-slate-500">Talep bulunamadı.</div>;
    }

    return (
        <div className="divide-y divide-slate-100">
            {requests.map(req => (
                <div
                    key={req.id}
                    onClick={() => onSelect(req)}
                    className={`p-4 cursor-pointer hover:bg-slate-50 transition border-l-4 ${activeId === req.id ? "bg-blue-50/50 border-blue-500" : "border-transparent"}`}
                >
                    <div className="flex justify-between items-start mb-1">
                        <span className="font-semibold text-slate-800 text-sm">{req.personName}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${LEAVE_STATUS_COLORS[req.status]}`}>
                            {LEAVE_STATUS_LABELS[req.status]}
                        </span>
                    </div>

                    <div className="text-sm text-slate-600 mb-1">
                        {LEAVE_TYPE_LABELS[req.type]} • {req.totalDays} Gün
                    </div>

                    <div className="flex justify-between items-end">
                        <span className="text-xs text-slate-500 font-mono">
                            {formatDate(req.startDate)} - {formatDate(req.endDate)}
                        </span>
                        <span className="text-[10px] text-slate-400">
                            {formatTimeAgo(req.createdAt)}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
}
