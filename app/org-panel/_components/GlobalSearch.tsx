// Global Search Component with Keyboard Navigation

"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { getVehicles, getInventoryItems, getUsers } from "@/lib/org/db";

interface SearchResult {
    id: string;
    type: "vehicle" | "inventory" | "user";
    title: string;
    subtitle: string;
    href: string;
    icon: string;
}

interface GlobalSearchProps {
    placeholder?: string;
}

export function GlobalSearch({ placeholder = "Ara..." }: GlobalSearchProps) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Search logic (client-side for now)
    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            setIsOpen(false);
            return;
        }

        const lowerQuery = query.toLowerCase();
        const searchResults: SearchResult[] = [];

        // Search vehicles
        const vehicles = getVehicles();
        vehicles
            .filter((v) => v.plate.toLowerCase().includes(lowerQuery) || v.model.toLowerCase().includes(lowerQuery))
            .slice(0, 3)
            .forEach((v) => {
                searchResults.push({
                    id: v.id,
                    type: "vehicle",
                    title: v.plate,
                    subtitle: v.model,
                    href: `/org-panel/araclar?id=${v.id}`,
                    icon: "🚗",
                });
            });

        // Search inventory
        const inventory = getInventoryItems();
        inventory
            .filter((i) => i.name.toLowerCase().includes(lowerQuery))
            .slice(0, 3)
            .forEach((i) => {
                searchResults.push({
                    id: i.id,
                    type: "inventory",
                    title: i.name,
                    subtitle: `${i.currentLevel} ${i.unit}`,
                    href: `/org-panel/depo?item=${i.id}`,
                    icon: "📦",
                });
            });

        // Search users
        const users = getUsers();
        users
            .filter((u) => u.name.toLowerCase().includes(lowerQuery) || u.email.toLowerCase().includes(lowerQuery))
            .slice(0, 3)
            .forEach((u) => {
                searchResults.push({
                    id: u.id,
                    type: "user",
                    title: u.name,
                    subtitle: u.email,
                    href: `/org-panel/users/${u.id}`,
                    icon: "👤",
                });
            });

        setResults(searchResults);
        setIsOpen(searchResults.length > 0);
        setSelectedIndex(0);
    }, [query]);

    // Keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen || results.length === 0) {
            if (e.key === "Escape") {
                setQuery("");
                setIsOpen(false);
            }
            return;
        }

        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                setSelectedIndex((prev) => (prev + 1) % results.length);
                break;
            case "ArrowUp":
                e.preventDefault();
                setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
                break;
            case "Enter":
                e.preventDefault();
                if (results[selectedIndex]) {
                    window.location.href = results[selectedIndex].href;
                }
                break;
            case "Escape":
                setQuery("");
                setIsOpen(false);
                inputRef.current?.blur();
                break;
        }
    };

    return (
        <div ref={dropdownRef} className="relative">
            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    placeholder={placeholder}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => query && setIsOpen(true)}
                    onKeyDown={handleKeyDown}
                    className="w-64 px-4 py-2 pl-10 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
                <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                </svg>
            </div>

            {/* Dropdown Results */}
            {isOpen && results.length > 0 && (
                <div className="absolute top-full mt-2 w-96 bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden z-50">
                    <div className="max-h-96 overflow-y-auto">
                        {results.map((result, index) => (
                            <Link key={result.id} href={result.href}>
                                <div
                                    className={`flex items-center gap-3 px-4 py-3 border-b border-slate-100 transition ${index === selectedIndex ? "bg-emerald-50" : "hover:bg-slate-50"
                                        }`}
                                    onMouseEnter={() => setSelectedIndex(index)}
                                >
                                    <span className="text-2xl">{result.icon}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-800 truncate">{result.title}</p>
                                        <p className="text-xs text-slate-500 truncate">{result.subtitle}</p>
                                    </div>
                                    <span className="text-xs text-slate-400 uppercase">{result.type}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                    {query && results.length === 0 && (
                        <div className="px-4 py-8 text-center text-slate-400">
                            <p className="text-sm">Sonuç bulunamadı</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
