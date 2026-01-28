// Incident Store - In-memory storage with sample data
import {
    Incident,
    WorkOrder,
    IncidentComment,
    IncidentType,
    IncidentStatus,
    IncidentSeverity,
    UserRef,
    IncidentStats,
    IncidentFilters,
} from "./types";

// Generate unique ID
function generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Generate ref number
function generateRefNo(type: IncidentType): string {
    const prefix = type === "INCIDENT" ? "INC" : "MNT";
    const year = new Date().getFullYear();
    const num = String(Math.floor(Math.random() * 99999) + 1).padStart(5, "0");
    return `${prefix}-${year}-${num}`;
}

// Sample users for demo
const SAMPLE_USERS: UserRef[] = [
    { id: "usr_1", name: "Ahmet Yılmaz", email: "ahmet@opstay.com" },
    { id: "usr_2", name: "Mehmet Kaya", email: "mehmet@opstay.com" },
    { id: "usr_3", name: "Ayşe Demir", email: "ayse@opstay.com" },
];

// Sample incidents
const SAMPLE_INCIDENTS: Incident[] = [
    {
        id: "inc_1",
        refNo: "INC-2026-00001",
        unitId: "unit_1",
        type: "INCIDENT",
        title: "Klima arızası - A Blok 3. Kat",
        description: "A Blok 3. kattaki merkezi klima düzgün soğutma yapmıyor. Sıcaklık 28 dereceyi buluyor.",
        status: "OPEN",
        severity: "HIGH",
        vehicleId: null,
        vehiclePlate: null,
        dueAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        slaMinutes: 480,
        createdBy: SAMPLE_USERS[0],
        assignedTo: SAMPLE_USERS[1],
        resolutionNote: null,
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: "inc_2",
        refNo: "INC-2026-00002",
        unitId: "unit_1",
        type: "INCIDENT",
        title: "Su kaçağı - Bodrum kat",
        description: "Bodrum katta su sızıntısı tespit edildi. Acil müdahale gerekiyor.",
        status: "IN_PROGRESS",
        severity: "HIGH",
        vehicleId: null,
        vehiclePlate: null,
        dueAt: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
        slaMinutes: 240,
        createdBy: SAMPLE_USERS[2],
        assignedTo: SAMPLE_USERS[0],
        resolutionNote: null,
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    },
    {
        id: "inc_3",
        refNo: "MNT-2026-00001",
        unitId: "unit_1",
        type: "MAINTENANCE",
        title: "Aylık jeneratör bakımı",
        description: "Planlı aylık jeneratör kontrolü ve bakımı. Yağ, filtre ve akü kontrolü yapılacak.",
        status: "OPEN",
        severity: "MED",
        vehicleId: null,
        vehiclePlate: null,
        dueAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        slaMinutes: null,
        createdBy: SAMPLE_USERS[1],
        assignedTo: null,
        resolutionNote: null,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: "inc_4",
        refNo: "INC-2026-00003",
        unitId: "unit_1",
        type: "INCIDENT",
        title: "Asansör arızası",
        description: "B Blok asansörü 2. katta kaldı. Yetkili servis bekleniyor.",
        status: "RESOLVED",
        severity: "HIGH",
        vehicleId: null,
        vehiclePlate: null,
        dueAt: null,
        slaMinutes: 120,
        createdBy: SAMPLE_USERS[0],
        assignedTo: SAMPLE_USERS[2],
        resolutionNote: "Hidrolik sistem arızası giderildi. Asansör teste alındı ve normal çalışıyor.",
        createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: "inc_5",
        refNo: "MNT-2026-00002",
        unitId: "unit_1",
        type: "MAINTENANCE",
        title: "Yangın söndürme sistemi kontrolü",
        description: "6 aylık periyodik yangın söndürme sistemi kontrolü ve test.",
        status: "IN_PROGRESS",
        severity: "MED",
        vehicleId: null,
        vehiclePlate: null,
        dueAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        slaMinutes: null,
        createdBy: SAMPLE_USERS[1],
        assignedTo: SAMPLE_USERS[1],
        resolutionNote: null,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
];

// Sample work orders
const SAMPLE_WORK_ORDERS: WorkOrder[] = [
    {
        id: "wo_1",
        incidentId: "inc_2",
        title: "Sızıntı kaynağını tespit et",
        status: "DONE",
        assignedTo: SAMPLE_USERS[0],
        plannedAt: null,
        completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        notes: "Boru birleşim noktasından sızıntı tespit edildi.",
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: "wo_2",
        incidentId: "inc_2",
        title: "Boru tamiri",
        status: "IN_PROGRESS",
        assignedTo: SAMPLE_USERS[0],
        plannedAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        completedAt: null,
        notes: "Tesisatçı ekip çağrıldı.",
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    },
];

// Sample comments
const SAMPLE_COMMENTS: IncidentComment[] = [
    {
        id: "cmt_1",
        incidentId: "inc_1",
        body: "Teknik ekip bilgilendirildi, yarın sabah kontrol yapılacak.",
        createdBy: SAMPLE_USERS[1],
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        kind: "COMMENT",
    },
    {
        id: "cmt_2",
        incidentId: "inc_2",
        body: "Durum 'Devam Ediyor' olarak güncellendi",
        createdBy: SAMPLE_USERS[0],
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        kind: "STATUS_CHANGE",
    },
    {
        id: "cmt_3",
        incidentId: "inc_2",
        body: "Ahmet Yılmaz atandı",
        createdBy: SAMPLE_USERS[2],
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        kind: "ASSIGNMENT",
    },
];

// In-memory store
interface IncidentStore {
    incidents: Incident[];
    workOrders: WorkOrder[];
    comments: IncidentComment[];
}

// Use globalThis for persistence across hot reloads
declare global {
    // biome-ignore lint/style/noVar: required for global augmentation
    var __incidentStore: IncidentStore | undefined;
}

function getStore(): IncidentStore {
    if (!globalThis.__incidentStore) {
        globalThis.__incidentStore = {
            incidents: [...SAMPLE_INCIDENTS],
            workOrders: [...SAMPLE_WORK_ORDERS],
            comments: [...SAMPLE_COMMENTS],
        };
    }
    return globalThis.__incidentStore;
}

// === INCIDENT FUNCTIONS ===

export function getIncidents(filters?: IncidentFilters): Incident[] {
    let items = getStore().incidents;

    if (filters) {
        if (filters.unitId) {
            items = items.filter((i) => i.unitId === filters.unitId);
        }
        if (filters.type) {
            items = items.filter((i) => i.type === filters.type);
        }
        if (filters.status) {
            items = items.filter((i) => i.status === filters.status);
        }
        if (filters.severity) {
            items = items.filter((i) => i.severity === filters.severity);
        }
        if (filters.vehicleId) {
            items = items.filter((i) => i.vehicleId === filters.vehicleId);
        }
        if (filters.q) {
            const q = filters.q.toLowerCase();
            items = items.filter(
                (i) =>
                    i.title.toLowerCase().includes(q) ||
                    i.description.toLowerCase().includes(q) ||
                    i.refNo.toLowerCase().includes(q)
            );
        }
        if (filters.from) {
            items = items.filter((i) => i.createdAt >= filters.from!);
        }
        if (filters.to) {
            items = items.filter((i) => i.createdAt <= filters.to!);
        }
        if (filters.slaBreached) {
            const now = new Date().toISOString();
            items = items.filter((i) => i.dueAt && i.dueAt < now && i.status !== "RESOLVED");
        }
    }

    // Sort by createdAt desc
    return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getIncidentById(id: string): Incident | undefined {
    return getStore().incidents.find((i) => i.id === id);
}

export function createIncident(
    data: {
        type: IncidentType;
        title: string;
        description: string;
        severity: IncidentSeverity;
        vehicleId?: string | null;
        dueAt?: string | null;
    },
    createdBy: UserRef,
    unitId: string
): Incident {
    const store = getStore();
    const now = new Date().toISOString();

    const incident: Incident = {
        id: generateId("inc"),
        refNo: generateRefNo(data.type),
        unitId,
        type: data.type,
        title: data.title,
        description: data.description,
        status: "OPEN",
        severity: data.severity,
        vehicleId: data.vehicleId || null,
        vehiclePlate: null,
        dueAt: data.dueAt || null,
        slaMinutes: data.severity === "HIGH" ? 240 : data.severity === "MED" ? 480 : null,
        createdBy,
        assignedTo: null,
        resolutionNote: null,
        createdAt: now,
        updatedAt: now,
    };

    store.incidents.push(incident);
    return incident;
}

export function updateIncident(id: string, updates: Partial<Incident>): Incident | undefined {
    const store = getStore();
    const index = store.incidents.findIndex((i) => i.id === id);
    if (index === -1) return undefined;

    store.incidents[index] = {
        ...store.incidents[index],
        ...updates,
        updatedAt: new Date().toISOString(),
    };

    return store.incidents[index];
}

// === WORK ORDER FUNCTIONS ===

export function getWorkOrdersByIncident(incidentId: string): WorkOrder[] {
    return getStore().workOrders.filter((wo) => wo.incidentId === incidentId);
}

export function createWorkOrder(
    data: {
        incidentId: string;
        title: string;
        assignedTo?: UserRef | null;
        plannedAt?: string | null;
        notes?: string | null;
    }
): WorkOrder {
    const store = getStore();
    const now = new Date().toISOString();

    const workOrder: WorkOrder = {
        id: generateId("wo"),
        incidentId: data.incidentId,
        title: data.title,
        status: "OPEN",
        assignedTo: data.assignedTo || null,
        plannedAt: data.plannedAt || null,
        completedAt: null,
        notes: data.notes || null,
        createdAt: now,
        updatedAt: now,
    };

    store.workOrders.push(workOrder);
    return workOrder;
}

export function updateWorkOrder(id: string, updates: Partial<WorkOrder>): WorkOrder | undefined {
    const store = getStore();
    const index = store.workOrders.findIndex((wo) => wo.id === id);
    if (index === -1) return undefined;

    store.workOrders[index] = {
        ...store.workOrders[index],
        ...updates,
        updatedAt: new Date().toISOString(),
    };

    return store.workOrders[index];
}

// === COMMENT FUNCTIONS ===

export function getCommentsByIncident(incidentId: string): IncidentComment[] {
    return getStore()
        .comments.filter((c) => c.incidentId === incidentId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function createComment(
    incidentId: string,
    body: string,
    createdBy: UserRef,
    kind: IncidentComment["kind"] = "COMMENT"
): IncidentComment {
    const store = getStore();

    const comment: IncidentComment = {
        id: generateId("cmt"),
        incidentId,
        body,
        createdBy,
        createdAt: new Date().toISOString(),
        kind,
    };

    store.comments.push(comment);
    return comment;
}

// === STATS ===

export function getIncidentStats(unitId?: string): IncidentStats {
    let items = getStore().incidents;
    if (unitId) {
        items = items.filter((i) => i.unitId === unitId);
    }

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();

    return {
        open: items.filter((i) => i.status === "OPEN").length,
        inProgress: items.filter((i) => i.status === "IN_PROGRESS").length,
        maintenance: items.filter((i) => i.type === "MAINTENANCE" && i.status !== "RESOLVED").length,
        criticalToday: items.filter(
            (i) =>
                (i.severity === "HIGH" && i.status !== "RESOLVED") ||
                (i.dueAt && i.dueAt >= todayStart && i.dueAt < todayEnd && i.status !== "RESOLVED")
        ).length,
    };
}

// === USERS (for assignment) ===

export function getAvailableUsers(): UserRef[] {
    return [...SAMPLE_USERS];
}

export function getUserById(id: string): UserRef | undefined {
    return SAMPLE_USERS.find((u) => u.id === id);
}
