"use client";

type ProFilterBarProps = {
    restaurant: string;
    onRestaurantChange: (v: string) => void;
    restaurantOptions: string[];
    date: string;
    onDateChange: (v: string) => void;
    search: string;
    onSearchChange: (v: string) => void;
};

export default function ProFilterBar({
    restaurant,
    onRestaurantChange,
    restaurantOptions,
    date,
    onDateChange,
    search,
    onSearchChange,
}: ProFilterBarProps) {
    return (
        <div className="flex flex-col lg:flex-row items-end lg:items-center justify-between gap-4 mb-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Operasyon Kontrol Merkezi</h1>
                <p className="text-sm text-slate-500 mt-1">Seçili tarih ve restoran için rezervasyonlar, talepler ve uyarı listesi eşleşmeleri.</p>
            </div>

            <div className="w-full lg:w-auto flex flex-col sm:flex-row gap-3">
                {/* Restaurant Select */}
                <div className="relative group">
                    <label className="absolute -top-2 left-3 bg-[#F8F9FC] px-1 text-[10px] font-bold text-blue-600 uppercase tracking-widest pointer-events-none">
                        Restoran
                    </label>
                    <select
                        value={restaurant}
                        onChange={(e) => onRestaurantChange(e.target.value)}
                        className="w-full sm:w-48 appearance-none rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm transition-all"
                    >
                        {restaurantOptions.map((opt) => (
                            <option key={opt} value={opt}>
                                {opt === "all" ? "Tümü" : opt}
                            </option>
                        ))}
                    </select>
                    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">▼</div>
                </div>

                {/* Date Input */}
                <div className="relative group">
                    <label className="absolute -top-2 left-3 bg-[#F8F9FC] px-1 text-[10px] font-bold text-blue-600 uppercase tracking-widest pointer-events-none">
                        Tarih
                    </label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => onDateChange(e.target.value)}
                        className="w-full sm:w-40 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm transition-all"
                    />
                </div>

                {/* Quick Search */}
                <div className="relative group">
                    <label className="absolute -top-2 left-3 bg-[#F8F9FC] px-1 text-[10px] font-bold text-blue-600 uppercase tracking-widest pointer-events-none">
                        Hızlı Arama
                    </label>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Ara: isim, telefon, rez no..."
                        className="w-full sm:w-64 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm transition-all"
                    />
                </div>
            </div>
        </div>
    );
}
