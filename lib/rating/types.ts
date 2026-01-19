/**
 * Rating System Types
 * Shared types for the post-checkout rating system
 */

export type RatingScore = 1 | 2 | 3 | 4 | 5;

export type RatingStatus = "pending" | "completed" | "expired";

export type CallbackStatus = "pending" | "in_progress" | "completed" | "cancelled";

export type CallbackPriority = "high" | "medium" | "low";

export interface RatingEntry {
    rating_id: string;
    reservation_no: string;
    restaurant: string;
    customer_phone: string;
    customer_name?: string;
    rating?: RatingScore;
    feedback?: string;
    status: RatingStatus;
    token: string;
    created_at: string;
    rated_at?: string;
}

export interface CallbackEntry {
    callback_id: string;
    rating_id: string;
    customer_phone: string;
    customer_name?: string;
    restaurant: string;
    rating: RatingScore;
    feedback?: string;
    priority: CallbackPriority;
    status: CallbackStatus;
    assigned_to?: string;
    notes?: string;
    created_at: string;
    completed_at?: string;
}

/**
 * Determine callback priority based on rating score
 */
export function getCallbackPriority(rating: RatingScore): CallbackPriority {
    if (rating <= 2) return "high";
    if (rating === 3) return "medium";
    return "low";
}

/**
 * Check if rating should trigger callback (negative)
 */
export function isNegativeRating(rating: RatingScore): boolean {
    return rating <= 3;
}

/**
 * Check if rating should trigger thank-you flow (positive)
 */
export function isPositiveRating(rating: RatingScore): boolean {
    return rating >= 4;
}
