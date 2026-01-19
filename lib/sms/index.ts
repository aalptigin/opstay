/**
 * SMS Library - Main Index
 * Re-exports all SMS utilities from a single entry point
 */

export {
    type RestaurantKey,
    type SmsConfig,
    RESTAURANT_SMS_CONFIG,
    getSmsConfigByName,
    hasSmsConfig,
    buildReservationSmsText,
} from "./restaurants";

export { type SendSmsPayload, type SendSmsResult, sendSms } from "./sendSms";
