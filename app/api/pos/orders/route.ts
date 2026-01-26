import { NextResponse } from "next/server";

export const runtime = "edge";

/**
 * POS Adisyon/Sipariş Verileri
 * 
 * Query Params:
 * - restaurant: "Roof" | "Happy Moons"
 * - start_date: YYYY-MM-DD
 * - end_date: YYYY-MM-DD
 * 
 * Response: Adisyon detayları, ürün bazlı özet, gelir istatistikleri
 * 
 * ŞU AN STUB MOD: Mock data döndürüyor. Gerçek POS entegrasyonu yapılınca güncellenecek.
 */

// Mock ürün kategorileri
const PRODUCT_CATEGORIES = {
    icecek: ["Latte", "Cappuccino", "Espresso", "Çay", "Meyve Suyu", "Su"],
    anaYemek: ["Caesar Salad", "Burger", "Pizza", "Makarna", "Steak"],
    tatli: ["Cheesecake", "Tiramisu", "Sufle", "Dondurma"],
    aperatif: ["Patates Kızartması", "Chicken Wings", "Soğan Halkası"],
};

function getRandomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomProduct(category: keyof typeof PRODUCT_CATEGORIES) {
    const products = PRODUCT_CATEGORIES[category];
    return products[getRandomInt(0, products.length - 1)];
}

function generateMockOrdersForDate(restaurant: string, date: string) {
    const orderCount = getRandomInt(8, 20); // Günde 8-20 adisyon
    const orders = [];

    for (let i = 0; i < orderCount; i++) {
        const tableNo = restaurant === "Roof"
            ? `T${getRandomInt(1, 30)}`
            : `M${getRandomInt(1, 25)}`;

        const itemCount = getRandomInt(2, 6); // Adisyon başına 2-6 ürün
        const items = [];

        for (let j = 0; j < itemCount; j++) {
            const categories = Object.keys(PRODUCT_CATEGORIES) as Array<keyof typeof PRODUCT_CATEGORIES>;
            const category = categories[getRandomInt(0, categories.length - 1)];
            const product = getRandomProduct(category);
            const quantity = getRandomInt(1, 3);
            const unitPrice = getRandomInt(30, 200);
            const total = quantity * unitPrice;

            items.push({
                product,
                category: category === "icecek" ? "İçecek" : category === "anaYemek" ? "Ana Yemek" : category === "tatli" ? "Tatlı" : "Aperatif",
                quantity,
                unit_price: unitPrice,
                total,
            });
        }

        const totalAmount = items.reduce((sum, item) => sum + item.total, 0);

        orders.push({
            order_id: `ORD-${date.replace(/-/g, "")}-${String(i + 1).padStart(3, "0")}`,
            date,
            table_no: tableNo,
            items,
            total_amount: totalAmount,
        });
    }

    return orders;
}

function calculateSummary(orders: any[]) {
    const productMap = new Map<string, { quantity: number; revenue: number }>();
    const categoryMap = new Map<string, number>();

    let totalRevenue = 0;

    for (const order of orders) {
        totalRevenue += order.total_amount;

        for (const item of order.items) {
            // Ürün bazlı
            const existing = productMap.get(item.product) || { quantity: 0, revenue: 0 };
            productMap.set(item.product, {
                quantity: existing.quantity + item.quantity,
                revenue: existing.revenue + item.total,
            });

            // Kategori bazlı
            const catRevenue = categoryMap.get(item.category) || 0;
            categoryMap.set(item.category, catRevenue + item.total);
        }
    }

    // Top products sorted by revenue
    const products = Array.from(productMap.entries())
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.revenue - a.revenue);

    // Categories sorted by revenue
    const categories = Array.from(categoryMap.entries())
        .map(([name, revenue]) => ({ name, revenue }))
        .sort((a, b) => b.revenue - a.revenue);

    return {
        total_orders: orders.length,
        total_revenue: totalRevenue,
        average_order: orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0,
        products,
        categories,
    };
}

function getDaysBetween(start: string, end: string): string[] {
    const dates = [];
    const current = new Date(start);
    const endDate = new Date(end);

    while (current <= endDate) {
        const yyyy = String(current.getFullYear());
        const mm = String(current.getMonth() + 1).padStart(2, "0");
        const dd = String(current.getDate()).padStart(2, "0");
        dates.push(`${yyyy}-${mm}-${dd}`);
        current.setDate(current.getDate() + 1);
    }

    return dates;
}

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const restaurant = String(url.searchParams.get("restaurant") || "").trim();
        const start_date = String(url.searchParams.get("start_date") || "").trim();
        const end_date = String(url.searchParams.get("end_date") || "").trim();

        // Validation
        if (!restaurant) {
            return NextResponse.json(
                { ok: false, error: "restaurant parametresi zorunludur." },
                { status: 400 }
            );
        }

        if (!start_date || !end_date) {
            return NextResponse.json(
                { ok: false, error: "start_date ve end_date parametreleri zorunludur." },
                { status: 400 }
            );
        }

        if (restaurant !== "Roof" && restaurant !== "Happy Moons") {
            return NextResponse.json(
                { ok: false, error: 'restaurant "Roof" veya "Happy Moons" olmalıdır.' },
                { status: 400 }
            );
        }

        // Generate mock orders for each day in range
        const dates = getDaysBetween(start_date, end_date);
        const allOrders = [];

        for (const date of dates) {
            const dayOrders = generateMockOrdersForDate(restaurant, date);
            allOrders.push(...dayOrders);
        }

        const summary = calculateSummary(allOrders);

        return NextResponse.json(
            {
                ok: true,
                restaurant,
                period: { start: start_date, end: end_date },
                orders: allOrders,
                summary,
                mode: "stub",
                updated_at: new Date().toISOString(),
            },
            { headers: { "Cache-Control": "no-store" } }
        );
    } catch (e: any) {
        return NextResponse.json(
            { ok: false, error: e?.message || "error" },
            { status: 500 }
        );
    }
}
