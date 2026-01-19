/**
 * SMS Sending Utility
 * Supports DRY_RUN and LIVE modes
 */

export type SendSmsPayload = {
  toPhone: string;
  senderId: string;
  text: string;
};

export type SendSmsResult = {
  ok: boolean;
  mode: "dry_run" | "live";
  messageId: string;
  error?: string;
};

/**
 * Generate a unique message ID for SMS tracking
 */
function makeMessageId(): string {
  try {
    // Edge runtime may have crypto.randomUUID
    const anyCrypto = (globalThis as any).crypto;
    if (anyCrypto && typeof anyCrypto.randomUUID === "function") {
      return `SIM-${anyCrypto.randomUUID()}`;
    }
  } catch { }
  return `SIM-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`;
}

/**
 * Send SMS - DRY_RUN or LIVE based on NETGSM_MODE env
 */
export async function sendSms(payload: SendSmsPayload): Promise<SendSmsResult> {
  const mode = process.env.NETGSM_MODE;

  if (mode === "DRY_RUN") {
    // DRY_RUN: Log to console, don't actually send
    console.log("📩 DRY-RUN SMS", {
      to: payload.toPhone,
      senderId: payload.senderId,
      text: payload.text,
      mode: "dry_run",
    });

    return {
      ok: true,
      mode: "dry_run",
      messageId: makeMessageId(),
    };
  }

  if (mode === "LIVE") {
    // TODO: Implement Netgsm API integration
    // For now, throw error as LIVE is not implemented
    console.error("⚠️ LIVE SMS mode not implemented yet");
    return {
      ok: false,
      mode: "live",
      messageId: "",
      error: "LIVE mode not implemented yet",
    };
  }

  // No mode set - SMS disabled
  return {
    ok: false,
    mode: "dry_run",
    messageId: "",
    error: "NETGSM_MODE not set",
  };
}
