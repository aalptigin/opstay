// mobile/src/constants/config.ts
export const CONFIG = {
  // Lokal geliştirme için örnek:
  // Android emulator: http://10.0.2.2:3000
  // iOS simulator: http://localhost:3000
  // Gerçek cihaz: PC IP'niz (ör: http://192.168.1.20:3000)
  API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL || "http://10.0.2.2:3000",
};
