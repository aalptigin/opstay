// Meal Distribution Types

// Enums
export type MealType = "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK";
export type DeliveryStatus = "PENDING" | "DELIVERED" | "CANCELLED" | "ISSUE";
export type DietTag = "VEGAN" | "VEGETARIAN" | "GLUTEN_FREE" | "LACTOSE_FREE" | "HALAL" | "OTHER";
export type AllergenTag = "GLUTEN" | "NUTS" | "DAIRY" | "EGG" | "SEAFOOD" | "SOY" | "SESAME" | "OTHER";
export type IssueType = "PERSON_ABSENT" | "WRONG_MEAL" | "ALLERGEN_RISK" | "NO_STOCK" | "OTHER";

// Labels for display
export const MEAL_TYPE_LABELS: Record<MealType, string> = {
    BREAKFAST: "Kahvaltı",
    LUNCH: "Öğle Yemeği",
    DINNER: "Akşam Yemeği",
    SNACK: "Ara Öğün",
};

export const STATUS_LABELS: Record<DeliveryStatus, string> = {
    PENDING: "Bekliyor",
    DELIVERED: "Teslim Edildi",
    CANCELLED: "İptal",
    ISSUE: "Sorunlu",
};

export const DIET_LABELS: Record<DietTag, string> = {
    VEGAN: "Vegan",
    VEGETARIAN: "Vejetaryen",
    GLUTEN_FREE: "Glutensiz",
    LACTOSE_FREE: "Laktozsuz",
    HALAL: "Helal",
    OTHER: "Diğer",
};

export const ALLERGEN_LABELS: Record<AllergenTag, string> = {
    GLUTEN: "Gluten",
    NUTS: "Kuruyemiş",
    DAIRY: "Süt Ürünleri",
    EGG: "Yumurta",
    SEAFOOD: "Deniz Ürünleri",
    SOY: "Soya",
    SESAME: "Susam",
    OTHER: "Diğer",
};

export const ISSUE_TYPE_LABELS: Record<IssueType, string> = {
    PERSON_ABSENT: "Kişi Yok",
    WRONG_MEAL: "Yanlış Öğün",
    ALLERGEN_RISK: "Alerjen Riski",
    NO_STOCK: "Stok Yok",
    OTHER: "Diğer",
};

// User reference
export interface UserRef {
    id: string;
    name: string;
}

// Meal Plan Item (single meal in a plan)
export interface MealPlanItem {
    mealType: MealType;
    title: string;
    description?: string;
    allergens: AllergenTag[];
    diets: DietTag[];
    plannedPortions: number;
}

// Meal Plan (daily plan)
export interface MealPlan {
    id: string;
    date: string; // YYYY-MM-DD
    unitScope: "ALL" | string; // ALL or specific unitId
    items: MealPlanItem[];
    createdBy: UserRef;
    createdAt: string;
    updatedAt: string;
}

// Person summary for delivery list
export interface PersonSummary {
    id: string;
    fullName: string;
    unitId: string;
    unitName: string;
    shiftLabel?: string;
    dietTags: DietTag[];
    allergenTags: AllergenTag[];
    isOnLeave?: boolean;
    notes?: string;
}

// Meal Delivery record
export interface MealDelivery {
    id: string;
    date: string;
    mealType: MealType;
    personId: string;
    person?: PersonSummary;
    status: DeliveryStatus;
    deliveredAt?: string | null;
    deliveredBy?: UserRef | null;
    cancelReason?: string | null;
    issueType?: IssueType | null;
    issueNote?: string | null;
    createdAt: string;
    updatedAt: string;
}

// KPI stats
export interface MealKpi {
    planned: number;
    delivered: number;
    pending: number;
    issues: number;
}

// Permissions for current user
export interface MealPermissions {
    canPlan: boolean;
    canDeliver: boolean;
    canOverride: boolean;
    canViewAllUnits: boolean;
}

// Overview payload (main API response)
export interface MealOverviewPayload {
    date: string;
    kpi: MealKpi;
    plan: MealPlan | null;
    deliveries: MealDelivery[];
    permissions: MealPermissions;
}

// API Payloads
export interface CreateMealPlanPayload {
    date: string;
    unitScope: "ALL" | string;
    items: MealPlanItem[];
}

export interface UpdateMealPlanPayload {
    items?: MealPlanItem[];
    unitScope?: "ALL" | string;
}

export interface DeliveryActionPayload {
    date: string;
    mealType: MealType;
    personId: string;
    action: "DELIVER" | "CANCEL" | "ISSUE";
    note?: string;
    issueType?: IssueType;
}
