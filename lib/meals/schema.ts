// Meal Distribution Zod Schemas
import { z } from "zod";

// Enums
export const MealTypeSchema = z.enum(["BREAKFAST", "LUNCH", "DINNER", "SNACK"]);
export const DeliveryStatusSchema = z.enum(["PENDING", "DELIVERED", "CANCELLED", "ISSUE"]);
export const DietTagSchema = z.enum(["VEGAN", "VEGETARIAN", "GLUTEN_FREE", "LACTOSE_FREE", "HALAL", "OTHER"]);
export const AllergenTagSchema = z.enum(["GLUTEN", "NUTS", "DAIRY", "EGG", "SEAFOOD", "SOY", "SESAME", "OTHER"]);
export const IssueTypeSchema = z.enum(["PERSON_ABSENT", "WRONG_MEAL", "ALLERGEN_RISK", "NO_STOCK", "OTHER"]);

// Meal Plan Item
export const MealPlanItemSchema = z.object({
    mealType: MealTypeSchema,
    title: z.string().min(2, "Başlık en az 2 karakter"),
    description: z.string().optional(),
    allergens: z.array(AllergenTagSchema).default([]),
    diets: z.array(DietTagSchema).default([]),
    plannedPortions: z.number().min(1, "En az 1 porsiyon"),
});

// Create Plan Payload
export const CreateMealPlanSchema = z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Tarih YYYY-MM-DD formatında olmalı"),
    unitScope: z.string().min(1),
    items: z.array(MealPlanItemSchema).min(1, "En az 1 öğün gerekli"),
});

// Update Plan Payload
export const UpdateMealPlanSchema = z.object({
    items: z.array(MealPlanItemSchema).optional(),
    unitScope: z.string().optional(),
});

// Delivery Action
export const DeliveryActionSchema = z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    mealType: MealTypeSchema,
    personId: z.string().min(1),
    action: z.enum(["DELIVER", "CANCEL", "ISSUE"]),
    note: z.string().optional(),
    issueType: IssueTypeSchema.optional(),
}).refine((data) => {
    // If action is ISSUE, issueType is required
    if (data.action === "ISSUE" && !data.issueType) {
        return false;
    }
    return true;
}, { message: "Sorun bildirirken tür seçimi zorunludur" });

// Type exports
export type MealPlanItemInput = z.infer<typeof MealPlanItemSchema>;
export type CreateMealPlanInput = z.infer<typeof CreateMealPlanSchema>;
export type UpdateMealPlanInput = z.infer<typeof UpdateMealPlanSchema>;
export type DeliveryActionInput = z.infer<typeof DeliveryActionSchema>;
