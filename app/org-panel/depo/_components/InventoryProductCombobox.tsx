"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { DepotType } from "@/lib/org/types";
import { ProductOption, fetchN8NProducts, mergeProductOptions } from "@/lib/integrations/n8nProducts";

interface InventoryProductComboboxProps {
    depotType: DepotType;
    localProducts: ProductOption[];
    value: ProductOption | null;
    onChange: (product: ProductOption | null) => void;
    placeholder?: string;
}

const UNIT_OPTIONS = [
    { value: "adet", label: "Adet" },
    { value: "kg", label: "Kilogram (kg)" },
    { value: "litre", label: "Litre" },
    { value: "paket", label: "Paket" },
    { value: "kutu", label: "Kutu" },
    { value: "koli", label: "Koli" },
];

export function InventoryProductCombobox({
    depotType,
    localProducts,
    value,
    onChange,
    placeholder = "Ürün ara veya yaz...",
}: InventoryProductComboboxProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [options, setOptions] = useState<ProductOption[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Inline create form state
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    const [createError, setCreateError] = useState<string | null>(null);
    const [newProductUnit, setNewProductUnit] = useState("adet");
    const [newProductMinQty, setNewProductMinQty] = useState("5");

    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Check if query matches any existing product
    const queryMatchesExisting = options.some(
        (o) => o.name.toLowerCase() === query.toLowerCase()
    );

    // Fetch and merge products
    const fetchProducts = useCallback(async (searchQuery?: string) => {
        setLoading(true);
        setError(null);

        try {
            const externalProducts = await fetchN8NProducts(depotType, searchQuery);
            const merged = mergeProductOptions(externalProducts, localProducts, searchQuery);
            setOptions(merged);
        } catch (err) {
            console.error("Product fetch error:", err);
            setError("Ürünler alınamadı");
            setOptions(localProducts.filter((p) =>
                !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase())
            ));
        } finally {
            setLoading(false);
        }
    }, [depotType, localProducts]);

    // Initial load when dropdown opens
    useEffect(() => {
        if (isOpen && options.length === 0) {
            fetchProducts();
        }
    }, [isOpen, options.length, fetchProducts]);

    // Re-fetch when depot type changes
    useEffect(() => {
        if (isOpen) {
            fetchProducts(query);
        }
        // Reset create form when depot changes
        setShowCreateForm(false);
    }, [depotType]);

    // Debounced search
    useEffect(() => {
        if (!isOpen) return;

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
            fetchProducts(query);
        }, 300);

        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, [query, isOpen, fetchProducts]);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
                setShowCreateForm(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Handle selection
    const handleSelect = (product: ProductOption) => {
        onChange(product);
        setQuery("");
        setIsOpen(false);
        setShowCreateForm(false);
    };

    // Handle keyboard
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && query.trim() && !queryMatchesExisting) {
            e.preventDefault();
            setShowCreateForm(true);
        }
    };

    // Show create form when clicking "+ oluştur" option
    const handleShowCreateForm = () => {
        if (query.trim().length < 2) {
            setCreateError("Ürün adı en az 2 karakter olmalıdır");
            return;
        }
        setCreateError(null);
        setShowCreateForm(true);
    };

    // Create new product
    const handleCreateProduct = async () => {
        const name = query.trim();

        if (name.length < 2) {
            setCreateError("Ürün adı en az 2 karakter olmalıdır");
            return;
        }

        // Check for duplicate in current depot
        const duplicate = localProducts.find(
            (p) => p.name.toLowerCase() === name.toLowerCase() && p.depotType === depotType
        );
        if (duplicate) {
            setCreateError("Bu depoda bu isimle ürün zaten var. Mevcut ürünü seçin.");
            return;
        }

        setCreateLoading(true);
        setCreateError(null);

        try {
            const res = await fetch("/api/org/inventory", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    depotType,
                    name,
                    unit: newProductUnit,
                    minLevel: Number(newProductMinQty) || 0,
                    currentLevel: 0,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setCreateError(data.error || "Ürün oluşturulamadı");
                setCreateLoading(false);
                return;
            }

            // Create product option from response
            const newProduct: ProductOption = {
                id: data.item.id,
                name: data.item.name,
                unitLabel: data.item.unit,
                depotType: data.item.depotType,
                source: "internal",
                currentLevel: 0,
                minLevel: data.item.minLevel,
            };

            // Add to options and select it
            setOptions((prev) => [newProduct, ...prev]);
            onChange(newProduct);

            // Reset
            setQuery("");
            setIsOpen(false);
            setShowCreateForm(false);
            setNewProductUnit("adet");
            setNewProductMinQty("5");
        } catch {
            setCreateError("Bağlantı hatası");
        } finally {
            setCreateLoading(false);
        }
    };

    // Cancel create form
    const handleCancelCreate = () => {
        setShowCreateForm(false);
        setCreateError(null);
        inputRef.current?.focus();
    };

    // Retry fetch
    const handleRetry = () => {
        fetchProducts(query);
    };

    return (
        <div ref={containerRef} className="relative">
            {/* Input */}
            <div
                className={`flex items-center border rounded-xl transition ${isOpen ? "border-emerald-500 ring-2 ring-emerald-500/20" : "border-slate-200"
                    }`}
            >
                <input
                    ref={inputRef}
                    type="text"
                    value={isOpen ? query : (value?.name || "")}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setShowCreateForm(false);
                        if (!isOpen) setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="flex-1 px-4 py-2.5 bg-transparent outline-none rounded-xl"
                />
                {value && !isOpen && (
                    <button
                        type="button"
                        onClick={() => {
                            onChange(null);
                            inputRef.current?.focus();
                        }}
                        className="px-2 text-slate-400 hover:text-slate-600"
                    >
                        ✕
                    </button>
                )}
                <button
                    type="button"
                    onClick={() => {
                        setIsOpen(!isOpen);
                        setShowCreateForm(false);
                    }}
                    className="px-3 text-slate-400 hover:text-slate-600"
                >
                    {isOpen ? "▲" : "▼"}
                </button>
            </div>

            {/* Selected indicator */}
            {value && !isOpen && (
                <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                    <span className={`px-1.5 py-0.5 rounded ${value.source === "internal" ? "bg-emerald-100 text-emerald-700" :
                        value.source === "external" ? "bg-blue-100 text-blue-700" :
                            "bg-amber-100 text-amber-700"
                        }`}>
                        {value.source === "internal" ? "Kayıtlı" :
                            value.source === "external" ? "Terminal" : "Yeni"}
                    </span>
                    <span>{value.unitLabel}</span>
                    {value.currentLevel !== undefined && (
                        <span className="text-slate-400">Stok: {value.currentLevel}</span>
                    )}
                </div>
            )}

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white rounded-xl border border-slate-200 shadow-xl max-h-80 overflow-auto">

                    {/* Inline Create Form */}
                    {showCreateForm && (
                        <div className="p-4 border-b border-slate-200 bg-emerald-50">
                            <h4 className="text-sm font-semibold text-slate-700 mb-3">
                                ✨ Yeni Ürün Oluştur
                            </h4>

                            {/* Product Name (readonly) */}
                            <div className="mb-3">
                                <label className="block text-xs font-medium text-slate-600 mb-1">
                                    Ürün Adı
                                </label>
                                <input
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm"
                                    placeholder="Ürün adı..."
                                />
                            </div>

                            {/* Unit Selection */}
                            <div className="mb-3">
                                <label className="block text-xs font-medium text-slate-600 mb-1">
                                    Birim *
                                </label>
                                <select
                                    value={newProductUnit}
                                    onChange={(e) => setNewProductUnit(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm"
                                >
                                    {UNIT_OPTIONS.map((unit) => (
                                        <option key={unit.value} value={unit.value}>
                                            {unit.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Min Quantity */}
                            <div className="mb-3">
                                <label className="block text-xs font-medium text-slate-600 mb-1">
                                    Minimum Stok Seviyesi
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={newProductMinQty}
                                    onChange={(e) => setNewProductMinQty(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm"
                                    placeholder="5"
                                />
                            </div>

                            {/* Error */}
                            {createError && (
                                <div className="mb-3 p-2 rounded-lg bg-red-50 border border-red-100 text-red-600 text-xs">
                                    ⚠️ {createError}
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={handleCancelCreate}
                                    disabled={createLoading}
                                    className="flex-1 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100 text-sm transition"
                                >
                                    İptal
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCreateProduct}
                                    disabled={createLoading}
                                    className="flex-1 px-3 py-2 rounded-lg bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 disabled:opacity-50 transition flex items-center justify-center gap-2"
                                >
                                    {createLoading ? (
                                        <>
                                            <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Kaydediliyor...
                                        </>
                                    ) : (
                                        "Oluştur ve Seç"
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Create New Option - Always show if query doesn't match existing */}
                    {!showCreateForm && query.trim() && !queryMatchesExisting && (
                        <button
                            type="button"
                            onClick={handleShowCreateForm}
                            className="w-full px-4 py-3 text-left hover:bg-emerald-50 flex items-center gap-2 border-b border-slate-100"
                        >
                            <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm font-bold">
                                +
                            </span>
                            <span className="text-slate-700">
                                "<strong>{query}</strong>" ürününü oluştur
                            </span>
                        </button>
                    )}

                    {/* Loading */}
                    {loading && !showCreateForm && (
                        <div className="px-4 py-3 flex items-center gap-2 text-slate-500">
                            <span className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                            Yükleniyor...
                        </div>
                    )}

                    {/* Error */}
                    {error && !loading && !showCreateForm && (
                        <div className="px-4 py-3 flex items-center justify-between">
                            <span className="text-red-500 text-sm">⚠️ {error}</span>
                            <button
                                type="button"
                                onClick={handleRetry}
                                className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                            >
                                Tekrar Dene
                            </button>
                        </div>
                    )}

                    {/* Options List */}
                    {!loading && !error && !showCreateForm && options.length > 0 && (
                        <ul className="py-1">
                            {options.map((product) => (
                                <li key={product.id}>
                                    <button
                                        type="button"
                                        onClick={() => handleSelect(product)}
                                        className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center justify-between"
                                    >
                                        <div>
                                            <span className="font-medium text-slate-800">{product.name}</span>
                                            {product.currentLevel !== undefined && (
                                                <span className="ml-2 text-xs text-slate-500">
                                                    (Stok: {product.currentLevel})
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-slate-400">{product.unitLabel}</span>
                                            <span className={`px-1.5 py-0.5 rounded text-xs ${product.source === "internal" ? "bg-emerald-100 text-emerald-700" :
                                                "bg-blue-100 text-blue-700"
                                                }`}>
                                                {product.source === "internal" ? "Kayıtlı" : "Terminal"}
                                            </span>
                                        </div>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}

                    {/* Empty state */}
                    {!loading && !error && !showCreateForm && options.length === 0 && !query.trim() && (
                        <div className="px-4 py-6 text-center text-slate-500 text-sm">
                            Ürün aramak için yazmaya başlayın
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
