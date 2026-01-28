// N8N Products Proxy API
// Proxies requests to N8N/Terminal API for product data
import { NextRequest, NextResponse } from "next/server";
import { verifySession, getClientIp } from "@/lib/org/session";
import { DepotType } from "@/lib/org/types";

export const runtime = "edge";

// Environment variables
const N8N_PRODUCTS_URL = process.env.N8N_PRODUCTS_URL;
const N8N_API_KEY = process.env.N8N_API_KEY;
const REQUEST_TIMEOUT = 5000; // 5 seconds

// Sample products for development (when N8N is not configured)
const SAMPLE_PRODUCTS: Record<DepotType, Array<{ externalId: string; name: string; unitLabel: string }>> = {
    cleaning: [
        { externalId: "ext-c1", name: "Çamaşır Deterjanı", unitLabel: "litre" },
        { externalId: "ext-c2", name: "Bulaşık Deterjanı", unitLabel: "litre" },
        { externalId: "ext-c3", name: "Cam Temizleyici", unitLabel: "adet" },
        { externalId: "ext-c4", name: "Yüzey Temizleyici", unitLabel: "litre" },
        { externalId: "ext-c5", name: "Çöp Poşeti (Büyük)", unitLabel: "paket" },
        { externalId: "ext-c6", name: "Çöp Poşeti (Küçük)", unitLabel: "paket" },
        { externalId: "ext-c7", name: "Kağıt Havlu", unitLabel: "paket" },
        { externalId: "ext-c8", name: "Tuvalet Kağıdı", unitLabel: "paket" },
        { externalId: "ext-c9", name: "Dezenfektan", unitLabel: "litre" },
        { externalId: "ext-c10", name: "Eldiven (Latex)", unitLabel: "kutu" },
        { externalId: "ext-c11", name: "Paspas Takımı", unitLabel: "adet" },
        { externalId: "ext-c12", name: "Sünger (Bulaşık)", unitLabel: "adet" },
    ],
    food: [
        { externalId: "ext-f1", name: "Pirinç", unitLabel: "kg" },
        { externalId: "ext-f2", name: "Bulgur", unitLabel: "kg" },
        { externalId: "ext-f3", name: "Makarna", unitLabel: "kg" },
        { externalId: "ext-f4", name: "Un", unitLabel: "kg" },
        { externalId: "ext-f5", name: "Şeker", unitLabel: "kg" },
        { externalId: "ext-f6", name: "Tuz", unitLabel: "kg" },
        { externalId: "ext-f7", name: "Ayçiçek Yağı", unitLabel: "litre" },
        { externalId: "ext-f8", name: "Zeytinyağı", unitLabel: "litre" },
        { externalId: "ext-f9", name: "Domates Salçası", unitLabel: "kg" },
        { externalId: "ext-f10", name: "Biber Salçası", unitLabel: "kg" },
        { externalId: "ext-f11", name: "Kırmızı Mercimek", unitLabel: "kg" },
        { externalId: "ext-f12", name: "Yeşil Mercimek", unitLabel: "kg" },
        { externalId: "ext-f13", name: "Nohut", unitLabel: "kg" },
        { externalId: "ext-f14", name: "Fasulye", unitLabel: "kg" },
        { externalId: "ext-f15", name: "Çay", unitLabel: "kg" },
        { externalId: "ext-f16", name: "Kahve", unitLabel: "kg" },
    ],
};

export async function GET(request: NextRequest) {
    try {
        // Auth check
        const token = request.cookies.get("org_session")?.value;
        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const ip = getClientIp(request.headers);
        const session = verifySession(token, ip);
        if (!session.valid || !session.user) {
            return NextResponse.json({ error: session.error }, { status: 401 });
        }

        // Parse params
        const { searchParams } = new URL(request.url);
        const depotType = searchParams.get("depotType") as DepotType;
        const query = searchParams.get("q") || "";

        if (!depotType || !["cleaning", "food"].includes(depotType)) {
            return NextResponse.json(
                { error: "Invalid depotType. Must be 'cleaning' or 'food'" },
                { status: 400 }
            );
        }

        let products;

        // Try N8N if configured
        if (N8N_PRODUCTS_URL) {
            try {
                const n8nUrl = new URL(N8N_PRODUCTS_URL);
                n8nUrl.searchParams.set("depotType", depotType.toUpperCase());
                if (query) n8nUrl.searchParams.set("q", query);

                const headers: HeadersInit = {
                    "Content-Type": "application/json",
                };
                if (N8N_API_KEY) {
                    headers["Authorization"] = `Bearer ${N8N_API_KEY}`;
                }

                const res = await fetch(n8nUrl.toString(), {
                    headers,
                    signal: AbortSignal.timeout(REQUEST_TIMEOUT),
                });

                if (res.ok) {
                    const data = await res.json();
                    products = data.products || data;
                    console.log("📦 [N8N Proxy] Fetched", products.length, "products from N8N");
                } else {
                    console.warn("📦 [N8N Proxy] N8N returned", res.status, "- using sample data");
                }
            } catch (error) {
                console.error("📦 [N8N Proxy] N8N fetch failed:", error);
            }
        }

        // Fallback to sample data
        if (!products) {
            console.log("📦 [N8N Proxy] Using sample products for", depotType);
            products = SAMPLE_PRODUCTS[depotType] || [];

            // Filter by query
            if (query) {
                const q = query.toLowerCase();
                products = products.filter((p: { name: string }) =>
                    p.name.toLowerCase().includes(q)
                );
            }
        }

        return NextResponse.json({
            products,
            cached: false,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error("N8N Products Proxy error:", error);
        return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
    }
}
