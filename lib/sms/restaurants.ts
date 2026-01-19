/**
 * SMS Restaurant Configuration
 * Centralized configuration for SMS sending per restaurant
 */

export type RestaurantKey = "happy_moons" | "roof";

export type SmsConfig = {
  senderId: string;
  mapsUrl: string;
  signature: string;
};

export const RESTAURANT_SMS_CONFIG: Record<RestaurantKey, SmsConfig> = {
  happy_moons: {
    senderId: "HAPPYMOONS",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Mimarsinan%2C+Bozant%C4%B1+Cd.+No%3A184%2C+38020+Kocasinan%2FKayseri",
    signature:
      "Happy Moons olarak sizi agirlamaktan memnuniyet duyariz. Saygilarimizla.",
  },
  roof: {
    senderId: "ROOFKAYSERI",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Mimarsinan%2C+Bozant%C4%B1+Cd.+No%3A184%2C+38020+Kocasinan%2FKayseri",
    signature:
      "Roof ekibi olarak keyifli bir aksam dileriz. Saygilarimizla.",
  },
};

/**
 * Maps display name (from Sheets/UI) to config key
 */
const DISPLAY_NAME_MAP: Record<string, RestaurantKey> = {
  "Happy Moons": "happy_moons",
  "happy moons": "happy_moons",
  "HAPPY MOONS": "happy_moons",
  Roof: "roof",
  roof: "roof",
  ROOF: "roof",
};

/**
 * Get SMS config by restaurant display name
 * Returns null if restaurant not found
 */
export function getSmsConfigByName(displayName: string): SmsConfig | null {
  const trimmed = (displayName || "").trim();
  const key = DISPLAY_NAME_MAP[trimmed];
  if (!key) return null;
  return RESTAURANT_SMS_CONFIG[key];
}

/**
 * Check if a restaurant has SMS config
 */
export function hasSmsConfig(displayName: string): boolean {
  return getSmsConfigByName(displayName) !== null;
}

/**
 * Build SMS text for reservation confirmation
 */
export function buildReservationSmsText(params: {
  date: string;
  time: string;
  totalGuests: string;
  mapsUrl: string;
  signature: string;
}): string {
  return `
Rezervasyonunuz olusturuldu.
Tarih: ${params.date} Saat: ${params.time} Kisi: ${params.totalGuests}
Konum: ${params.mapsUrl}
${params.signature}
`.trim();
}
