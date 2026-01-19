type MessageLogInput = {
  reservationId: string;
  restaurant: string;
  toPhone: string;
  senderId: string;
  mode: "dry_run" | "live";
  providerMessageId: string;
};

export async function saveMessageLog(log: MessageLogInput) {
  console.log("📩 SMS LOG:", {
    ...log,
    createdAt: new Date().toISOString(),
  });

  // Şimdilik console.log
  // İleride: Google Sheet / DB
}
