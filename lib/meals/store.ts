// Meal Store - In-memory storage with sample data
import {
    MealPlan,
    MealPlanItem,
    MealDelivery,
    MealType,
    DeliveryStatus,
    PersonSummary,
    MealKpi,
    MealOverviewPayload,
    MealPermissions,
    UserRef,
    IssueType,
} from "./types";

// Generate unique ID
function generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Get today's date in YYYY-MM-DD
export function getTodayDate(): string {
    return new Date().toISOString().split("T")[0];
}

// Sample people
const SAMPLE_PEOPLE: PersonSummary[] = [
    { id: "p1", fullName: "Ahmet Yılmaz", unitId: "unit_1", unitName: "Yönetim", shiftLabel: "Gündüz", dietTags: [], allergenTags: [] },
    { id: "p2", fullName: "Mehmet Kaya", unitId: "unit_1", unitName: "Yönetim", shiftLabel: "Gündüz", dietTags: ["VEGETARIAN"], allergenTags: ["NUTS"] },
    { id: "p3", fullName: "Ayşe Demir", unitId: "unit_1", unitName: "Yönetim", shiftLabel: "Gündüz", dietTags: ["VEGAN"], allergenTags: [] },
    { id: "p4", fullName: "Fatma Şahin", unitId: "unit_2", unitName: "Operasyon", shiftLabel: "Gece", dietTags: [], allergenTags: ["GLUTEN", "DAIRY"] },
    { id: "p5", fullName: "Ali Öztürk", unitId: "unit_2", unitName: "Operasyon", shiftLabel: "Gündüz", dietTags: ["HALAL"], allergenTags: [] },
    { id: "p6", fullName: "Zeynep Arslan", unitId: "unit_2", unitName: "Operasyon", shiftLabel: "Gündüz", dietTags: [], allergenTags: ["EGG"], isOnLeave: true },
    { id: "p7", fullName: "Mustafa Çelik", unitId: "unit_1", unitName: "Yönetim", shiftLabel: "Gündüz", dietTags: ["GLUTEN_FREE"], allergenTags: ["GLUTEN"] },
    { id: "p8", fullName: "Elif Koç", unitId: "unit_2", unitName: "Operasyon", shiftLabel: "Gece", dietTags: [], allergenTags: [] },
];

// Sample meal plans
const today = getTodayDate();
const SAMPLE_PLANS: MealPlan[] = [
    {
        id: "plan_1",
        date: today,
        unitScope: "ALL",
        items: [
            { mealType: "BREAKFAST", title: "Kahvaltı Tabağı", description: "Peynir, zeytin, domates, salatalık, bal, tereyağı, ekmek", allergens: ["GLUTEN", "DAIRY"], diets: [], plannedPortions: 8 },
            { mealType: "LUNCH", title: "Mercimek Çorbası + Tavuk Sote + Pilav", description: "Ana yemek menüsü", allergens: ["GLUTEN"], diets: ["HALAL"], plannedPortions: 8 },
            { mealType: "DINNER", title: "Karnıyarık + Bulgur Pilavı + Salata", description: "Akşam menüsü", allergens: [], diets: ["HALAL"], plannedPortions: 4 },
        ],
        createdBy: { id: "usr_1", name: "Sistem" },
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
];

// Sample deliveries for today
const SAMPLE_DELIVERIES: MealDelivery[] = [
    { id: "del_1", date: today, mealType: "BREAKFAST", personId: "p1", status: "DELIVERED", deliveredAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), deliveredBy: { id: "usr_1", name: "Ahmet" }, createdAt: today, updatedAt: today },
    { id: "del_2", date: today, mealType: "BREAKFAST", personId: "p2", status: "DELIVERED", deliveredAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), deliveredBy: { id: "usr_1", name: "Ahmet" }, createdAt: today, updatedAt: today },
    { id: "del_3", date: today, mealType: "BREAKFAST", personId: "p3", status: "PENDING", createdAt: today, updatedAt: today },
    { id: "del_4", date: today, mealType: "BREAKFAST", personId: "p4", status: "PENDING", createdAt: today, updatedAt: today },
    { id: "del_5", date: today, mealType: "BREAKFAST", personId: "p5", status: "ISSUE", issueType: "PERSON_ABSENT", issueNote: "Personel bugün gelmedi", createdAt: today, updatedAt: today },
    { id: "del_6", date: today, mealType: "LUNCH", personId: "p1", status: "PENDING", createdAt: today, updatedAt: today },
    { id: "del_7", date: today, mealType: "LUNCH", personId: "p2", status: "PENDING", createdAt: today, updatedAt: today },
    { id: "del_8", date: today, mealType: "LUNCH", personId: "p3", status: "PENDING", createdAt: today, updatedAt: today },
    { id: "del_9", date: today, mealType: "LUNCH", personId: "p4", status: "PENDING", createdAt: today, updatedAt: today },
    { id: "del_10", date: today, mealType: "LUNCH", personId: "p5", status: "PENDING", createdAt: today, updatedAt: today },
];

// In-memory store
interface MealStore {
    plans: MealPlan[];
    deliveries: MealDelivery[];
    people: PersonSummary[];
}

declare global {
    // biome-ignore lint/style/noVar: required for global augmentation
    var __mealStore: MealStore | undefined;
}

function getStore(): MealStore {
    if (!globalThis.__mealStore) {
        globalThis.__mealStore = {
            plans: [...SAMPLE_PLANS],
            deliveries: [...SAMPLE_DELIVERIES],
            people: [...SAMPLE_PEOPLE],
        };
    }
    return globalThis.__mealStore;
}

// === PLAN FUNCTIONS ===

export function getMealPlanByDate(date: string): MealPlan | null {
    return getStore().plans.find((p) => p.date === date) || null;
}

export function createMealPlan(data: { date: string; unitScope: string; items: MealPlanItem[] }, createdBy: UserRef): MealPlan {
    const store = getStore();
    const now = new Date().toISOString();

    // Remove existing plan for this date
    store.plans = store.plans.filter((p) => p.date !== data.date);

    const plan: MealPlan = {
        id: generateId("plan"),
        date: data.date,
        unitScope: data.unitScope,
        items: data.items,
        createdBy,
        createdAt: now,
        updatedAt: now,
    };

    store.plans.push(plan);

    // Generate pending deliveries for all people
    generateDeliveriesForPlan(plan);

    return plan;
}

export function updateMealPlan(id: string, updates: Partial<MealPlan>): MealPlan | null {
    const store = getStore();
    const index = store.plans.findIndex((p) => p.id === id);
    if (index === -1) return null;

    store.plans[index] = {
        ...store.plans[index],
        ...updates,
        updatedAt: new Date().toISOString(),
    };

    return store.plans[index];
}

function generateDeliveriesForPlan(plan: MealPlan): void {
    const store = getStore();
    const now = new Date().toISOString();

    // Remove existing deliveries for this date
    store.deliveries = store.deliveries.filter((d) => d.date !== plan.date);

    // Generate deliveries for each person and meal
    for (const person of store.people) {
        if (plan.unitScope !== "ALL" && person.unitId !== plan.unitScope) continue;

        for (const item of plan.items) {
            const delivery: MealDelivery = {
                id: generateId("del"),
                date: plan.date,
                mealType: item.mealType,
                personId: person.id,
                status: "PENDING",
                createdAt: now,
                updatedAt: now,
            };
            store.deliveries.push(delivery);
        }
    }
}

// === DELIVERY FUNCTIONS ===

export function getDeliveriesByDate(date: string, mealType?: MealType): MealDelivery[] {
    let deliveries = getStore().deliveries.filter((d) => d.date === date);
    if (mealType) {
        deliveries = deliveries.filter((d) => d.mealType === mealType);
    }

    // Attach person info
    const people = getStore().people;
    return deliveries.map((d) => ({
        ...d,
        person: people.find((p) => p.id === d.personId),
    }));
}

export function updateDeliveryStatus(
    id: string,
    status: DeliveryStatus,
    deliveredBy?: UserRef,
    issueType?: IssueType,
    issueNote?: string,
    cancelReason?: string
): MealDelivery | null {
    const store = getStore();
    const index = store.deliveries.findIndex((d) => d.id === id);
    if (index === -1) return null;

    const now = new Date().toISOString();
    store.deliveries[index] = {
        ...store.deliveries[index],
        status,
        deliveredAt: status === "DELIVERED" ? now : null,
        deliveredBy: status === "DELIVERED" ? deliveredBy : null,
        issueType: status === "ISSUE" ? issueType : null,
        issueNote: status === "ISSUE" ? issueNote : null,
        cancelReason: status === "CANCELLED" ? cancelReason : null,
        updatedAt: now,
    };

    return store.deliveries[index];
}

export function getDeliveryById(id: string): MealDelivery | null {
    return getStore().deliveries.find((d) => d.id === id) || null;
}

export function findDelivery(date: string, mealType: MealType, personId: string): MealDelivery | null {
    return getStore().deliveries.find(
        (d) => d.date === date && d.mealType === mealType && d.personId === personId
    ) || null;
}

// === KPI ===

export function getMealKpi(date: string): MealKpi {
    const deliveries = getStore().deliveries.filter((d) => d.date === date);
    return {
        planned: deliveries.length,
        delivered: deliveries.filter((d) => d.status === "DELIVERED").length,
        pending: deliveries.filter((d) => d.status === "PENDING").length,
        issues: deliveries.filter((d) => d.status === "ISSUE" || d.status === "CANCELLED").length,
    };
}

// === PEOPLE ===

export function getAllPeople(): PersonSummary[] {
    return [...getStore().people];
}

export function getPersonById(id: string): PersonSummary | null {
    return getStore().people.find((p) => p.id === id) || null;
}

// === OVERVIEW ===

export function getMealOverview(date: string, userRole: string): MealOverviewPayload {
    const plan = getMealPlanByDate(date);
    const deliveries = getDeliveriesByDate(date);
    const kpi = getMealKpi(date);

    const permissions: MealPermissions = {
        canPlan: userRole === "PRESIDENT" || userRole === "UNIT_MANAGER",
        canDeliver: true,
        canOverride: userRole === "PRESIDENT",
        canViewAllUnits: userRole === "PRESIDENT",
    };

    return {
        date,
        kpi,
        plan,
        deliveries,
        permissions,
    };
}
