// N8N Products Integration Types and Helpers
import { DepotType } from "@/lib/org/types";

// External product from N8N/Terminal API
export interface ExternalProduct {
    externalId: string;
    name: string;
    unitLabel?: string;
    depotType?: DepotType;
    barcode?: string;
    category?: string;
    updatedAt?: string;
}

// Unified product option for dropdown
export interface ProductOption {
    id: string;           // itemId if internal, externalId if external
    name: string;
    unitLabel: string;
    depotType: DepotType;
    source: "internal" | "external" | "manual";
    externalId?: string;
    currentLevel?: number;
    minLevel?: number;
}

// API Response
export interface N8NProductsResponse {
    products: ExternalProduct[];
    cached?: boolean;
    timestamp?: string;
}

// Cache for products
const productCache: Map<string, { data: ProductOption[]; timestamp: number }> = new Map();
const CACHE_TTL = 60 * 1000; // 60 seconds

// Normalize product name for deduplication
export function normalizeProductName(name: string): string {
    return name.toLowerCase().trim().replace(/\s+/g, " ");
}

// Fetch products from N8N proxy
export async function fetchN8NProducts(
    depotType: DepotType,
    query?: string
): Promise<ProductOption[]> {
    const cacheKey = `${depotType}-${query || "all"}`;
    const cached = productCache.get(cacheKey);

    // Return cached if fresh
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        console.log("📦 [N8N] Using cached products for", cacheKey);
        return cached.data;
    }

    try {
        const params = new URLSearchParams({ depotType });
        if (query) params.append("q", query);

        const res = await fetch(`/api/integrations/n8n/products?${params}`, {
            signal: AbortSignal.timeout(8000), // 8s timeout
        });

        if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
        }

        const data: N8NProductsResponse = await res.json();

        const options: ProductOption[] = data.products.map((p) => ({
            id: p.externalId,
            name: p.name,
            unitLabel: p.unitLabel || "adet",
            depotType: p.depotType || depotType,
            source: "external" as const,
            externalId: p.externalId,
        }));

        // Update cache
        productCache.set(cacheKey, { data: options, timestamp: Date.now() });

        return options;
    } catch (error) {
        console.error("📦 [N8N] Fetch error:", error);
        // Return cached even if stale on error
        if (cached) {
            console.log("📦 [N8N] Using stale cache due to error");
            return cached.data;
        }
        return [];
    }
}

// Merge products from multiple sources
export function mergeProductOptions(
    externalProducts: ProductOption[],
    localProducts: ProductOption[],
    query?: string
): ProductOption[] {
    const seen = new Map<string, ProductOption>();

    // Add local products first (they have itemId)
    for (const p of localProducts) {
        const key = normalizeProductName(p.name);
        seen.set(key, p);
    }

    // Add external products (prefer local if exists)
    for (const p of externalProducts) {
        const key = normalizeProductName(p.name);
        if (!seen.has(key)) {
            seen.set(key, p);
        } else {
            // Merge externalId into existing local product
            const existing = seen.get(key)!;
            if (!existing.externalId && p.externalId) {
                existing.externalId = p.externalId;
            }
        }
    }

    let result = Array.from(seen.values());

    // Filter by query if provided
    if (query) {
        const q = query.toLowerCase();
        result = result.filter((p) => p.name.toLowerCase().includes(q));
    }

    // Sort: internal first, then alphabetically
    result.sort((a, b) => {
        if (a.source === "internal" && b.source !== "internal") return -1;
        if (a.source !== "internal" && b.source === "internal") return 1;
        return a.name.localeCompare(b.name, "tr");
    });

    return result;
}

// Clear cache (useful for testing)
export function clearProductCache(): void {
    productCache.clear();
}
