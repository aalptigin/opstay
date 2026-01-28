"use client";

import { useState } from "react";
import { LeaveRequest, LeaveStatus } from "@/lib/leave/types";
import { getMonthDays, isDateInRange, MONTH_NAMES, DAY_NAMES, isSameDay } from "@/lib/leave/dateUtils";

interface LeaveCalendarProps {
    requests: LeaveRequest[];
    onSelectDate?: (date: Date) => void;
}

export function LeaveCalendar({ requests, onSelectDate }: LeaveCalendarProps) {
    const [viewDate, setViewDate] = useState(new Date());

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const days = getMonthDays(year, month);

    const handlePrev = () => setViewDate(new Date(year, month - 1, 1));
    const handleNext = () => setViewDate(new Date(year, month + 1, 1));
    const handleToday = () => setViewDate(new Date());

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <h2 className="text-lg font-bold text-slate-800 w-40">
                        {MONTH_NAMES[month]} {year}
                    </h2>
                    <div className="flex bg-slate-100 rounded-lg p-1 gap-1">
                        <button onClick={handlePrev} className="px-2 py-1 hover:bg-white rounded text-slate-600 text-sm">◀</button>
                        <button onClick={handleToday} className="px-3 py-1 hover:bg-white rounded text-slate-700 text-xs font-semibold">Bugün</button>
                        <button onClick={handleNext} className="px-2 py-1 hover:bg-white rounded text-slate-600 text-sm">▶</button>
                    </div>
                </div>

                {/* Legend */}
                <div className="flex gap-3 text-xs">
                    <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> Onaylı</div>
                    <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400"></span> Bekliyor</div>
                </div>
            </div>

            {/* Grid Header */}
            <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 shrink-0">
                {DAY_NAMES.map(d => (
                    <div key={d} className="py-2 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        {d}
                    </div>
                ))}
            </div>

            {/* Grid Body */}
            <div className="flex-1 grid grid-cols-7 auto-rows-fr overflow-hidden">
                {days.map((dayObj, idx) => {
                    // Find requests for this day
                    const dayRequests = requests.filter(r =>
                        (r.status === LeaveStatus.APPROVED || r.status === LeaveStatus.PENDING) &&
                        isDateInRange(dayObj.date, r.startDate, r.endDate)
                    );

                    const isToday = isSameDay(dayObj.date, new Date());

                    return (
                        <div
                            key={idx}
                            className={`min-h-[100px] border-b border-r border-slate-100 p-1 flex flex-col gap-1 transition-colors
                                ${!dayObj.isCurrentMonth ? "bg-slate-50/50 text-slate-400" : "bg-white"}
                                ${isToday ? "bg-blue-50/30" : ""}
                            `}
                        >
                            <div className="flex justify-between items-start px-1">
                                <span className={`text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full ${isToday ? "bg-blue-600 text-white" : ""}`}>
                                    {dayObj.date.getDate()}
                                </span>
                            </div>

                            <div className="flex-1 flex flex-col gap-1 overflow-y-auto custom-scrollbar">
                                {dayRequests.map(req => {
                                    const isStart = isSameDay(dayObj.date, req.startDate);
                                    const isEnd = isSameDay(dayObj.date, req.endDate);

                                    return (
                                        <div
                                            key={req.id}
                                            className={`
                                                text-[10px] px-1.5 py-0.5 roundedtruncate cursor-pointer hover:opacity-80
                                                ${req.status === LeaveStatus.APPROVED ? "bg-green-100 text-green-800 border border-green-200" : "bg-amber-50 text-amber-700 border border-amber-100"}
                                                ${isStart ? "rounded-l-md ml-0.5" : ""}
                                                ${isEnd ? "rounded-r-md mr-0.5" : ""}
                                            `}
                                            title={`${req.personName} - ${req.type}`}
                                        >
                                            {req.personName.split(" ")[0]}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
