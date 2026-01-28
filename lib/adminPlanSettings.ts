// ============================================================================
// ADMIN PLAN SETTINGS - localStorage ile admin ayarları yönetimi
// ============================================================================

const STORAGE_KEY = "opsstay_plan_admin_settings";

export interface AdminPlanSettings {
    floorCount: number;
}

/**
 * localStorage'dan admin ayarlarını oku
 */
export function getAdminPlanSettings(): AdminPlanSettings | null {
    if (typeof window === "undefined") return null;

    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        return JSON.parse(raw) as AdminPlanSettings;
    } catch {
        return null;
    }
}

/**
 * Admin ayarlarını localStorage'a kaydet
 */
export function saveAdminPlanSettings(settings: AdminPlanSettings): void {
    if (typeof window === "undefined") return;

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
        console.error("Admin plan settings kaydedilemedi.");
    }
}

/**
 * Kat sayısını al (ayarlar yoksa 1 döndür)
 */
export function getFloorCount(): number {
    const settings = getAdminPlanSettings();
    return settings?.floorCount ?? 1;
}
