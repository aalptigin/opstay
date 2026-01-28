// Simple in-memory + localStorage database for development
// Replace with Prisma/PostgreSQL in production

import { User, Unit, Session, AuditLog, Vehicle, VehicleAssignment, MaintenanceTicket, InventoryItem, InventoryTxn, MealTxn, LeaveRequest, TrainingLog } from "./types";

const STORAGE_KEY = "opsstay_org_db";

interface Database {
    users: User[];
    units: Unit[];
    sessions: Session[];
    auditLogs: AuditLog[];
    vehicles: Vehicle[];
    vehicleAssignments: VehicleAssignment[];
    maintenanceTickets: MaintenanceTicket[];
    inventoryItems: InventoryItem[];
    inventoryTxns: InventoryTxn[];
    mealTxns: MealTxn[];
    leaveRequests: LeaveRequest[];
    trainingLogs: TrainingLog[];
}

const defaultDb: Database = {
    users: [
        {
            id: "usr_president",
            email: "baskan@opstay.com",
            name: "Ahmet Başkan",
            passwordHash: "123456", // In production: use bcrypt
            role: "PRESIDENT",
            status: "active",
            createdAt: new Date().toISOString(),
        },
        {
            id: "usr_manager1",
            email: "birim1@opstay.com",
            name: "Mehmet Sorumlu",
            passwordHash: "123456",
            role: "UNIT_MANAGER",
            unitId: "unit_1",
            status: "active",
            createdAt: new Date().toISOString(),
        },
        {
            id: "usr_staff1",
            email: "personel1@opstay.com",
            name: "Ali Personel",
            passwordHash: "123456",
            role: "STAFF",
            unitId: "unit_1",
            status: "active",
            createdAt: new Date().toISOString(),
        },
    ],
    units: [
        { id: "unit_1", name: "Operasyon" },
        { id: "unit_2", name: "Mutfak" },
        { id: "unit_3", name: "Temizlik" },
    ],
    sessions: [],
    auditLogs: [],
    vehicles: [
        {
            id: "veh_1",
            plate: "34 ABC 123",
            model: "Ford Transit",
            status: "available",
            km: 45000,
            unitId: "unit_1",
            insuranceExpiry: "2026-06-15",
            inspectionExpiry: "2026-03-20",
            createdAt: new Date().toISOString(),
        },
        {
            id: "veh_2",
            plate: "34 XYZ 456",
            model: "Fiat Doblo",
            status: "in_use",
            km: 78000,
            unitId: "unit_2",
            insuranceExpiry: "2026-02-10",
            inspectionExpiry: "2026-04-05",
            createdAt: new Date().toISOString(),
        },
    ],
    vehicleAssignments: [
        {
            id: "asg_1",
            vehicleId: "veh_1",
            requesterId: "usr_staff1",
            status: "pending",
            purpose: "Malzeme taşıma",
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        },
        {
            id: "asg_2",
            vehicleId: "veh_2",
            requesterId: "usr_staff1",
            approverId: "usr_president",
            status: "in_progress",
            startTime: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
            startKm: 78000,
            purpose: "Yemek dağıtımı",
            createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        },
    ],
    maintenanceTickets: [
        {
            id: "tkt_1",
            vehicleId: "veh_1",
            type: "repair",
            priority: "high",
            status: "open",
            notes: "Motor arızası",
            createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
        },
    ],
    inventoryItems: [
        { id: "inv_1", depotType: "cleaning", name: "Deterjan (5L)", unit: "adet", minLevel: 10, currentLevel: 25 },
        { id: "inv_2", depotType: "cleaning", name: "Çöp Poşeti", unit: "paket", minLevel: 20, currentLevel: 8 },
        { id: "inv_3", depotType: "food", name: "Pirinç", unit: "kg", minLevel: 50, currentLevel: 120 },
        { id: "inv_4", depotType: "food", name: "Ayçiçek Yağı (5L)", unit: "adet", minLevel: 15, currentLevel: 30 },
    ],
    inventoryTxns: [
        {
            id: "itx_1",
            itemId: "inv_1",
            type: "out",
            qty: 5,
            requestedBy: "usr_staff1",
            approvedBy: "usr_manager1",
            unitId: "unit_1",
            notes: "Temizlik malzemesi çıkışı",
            createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 mins ago
        },
    ],
    mealTxns: [],
    leaveRequests: [
        {
            id: "lev_1",
            userId: "usr_staff1",
            startDate: "2026-02-05",
            endDate: "2026-02-10",
            days: 5,
            reason: "Yıllık izin",
            status: "pending",
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        },
        {
            id: "lev_2",
            userId: "usr_manager1",
            startDate: "2026-03-01",
            endDate: "2026-03-03",
            days: 2,
            reason: "Mazeret izni",
            status: "approved",
            approverId: "usr_president",
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
    ],
    trainingLogs: [],
};

// Use globalThis to persist data across hot reloads in dev
// This is the recommended pattern for Next.js in-memory stores
declare global {
    // eslint-disable-next-line no-var
    var __orgDb: Database | undefined;
}

function getDb(): Database {
    if (typeof window !== "undefined") {
        // Client-side: use localStorage
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch {
                return JSON.parse(JSON.stringify(defaultDb));
            }
        }
        return JSON.parse(JSON.stringify(defaultDb));
    } else {
        // Server-side: use globalThis to persist across hot reloads
        if (!globalThis.__orgDb) {
            console.log("🗄️ [DB] Initializing new database");
            globalThis.__orgDb = JSON.parse(JSON.stringify(defaultDb));
        }
        return globalThis.__orgDb!;
    }
}

function saveDb(db: Database): void {
    if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    } else {
        // Server-side: globalThis already references the same object
        globalThis.__orgDb = db;
    }
}

// Generic CRUD helpers
export function generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// Users
export function getUsers(): User[] {
    return getDb().users;
}

export function getUserById(id: string): User | undefined {
    return getDb().users.find((u) => u.id === id);
}

export function getUserByEmail(email: string): User | undefined {
    const users = getDb().users;
    console.log("🔍 [DB] Looking for email:", email);
    console.log("🔍 [DB] Total users in DB:", users.length);
    console.log("🔍 [DB] All emails:", users.map(u => u.email));
    const found = users.find((u) => u.email === email);
    console.log("🔍 [DB] Found user:", found ? found.name : "NOT FOUND");
    return found;
}

export function createUser(user: Omit<User, "id" | "createdAt">): User {
    const db = getDb();
    const newUser: User = {
        ...user,
        id: generateId("usr"),
        createdAt: new Date().toISOString(),
    };
    console.log("➕ [DB] Creating user:", newUser.email, newUser.name);
    console.log("➕ [DB] Users before:", db.users.length);
    db.users.push(newUser);
    console.log("➕ [DB] Users after:", db.users.length);
    saveDb(db);
    console.log("➕ [DB] User saved to DB");
    return newUser;
}

// Units
export function getUnits(): Unit[] {
    return getDb().units;
}

export function getUnitById(id: string): Unit | undefined {
    return getDb().units.find((u) => u.id === id);
}

// Sessions
export function getSessions(): Session[] {
    return getDb().sessions;
}

export function getSessionByToken(tokenHash: string): Session | undefined {
    return getDb().sessions.find((s) => s.tokenHash === tokenHash && !s.revokedAt);
}

export function getActiveSessionByUserId(userId: string): Session | undefined {
    return getDb().sessions.find((s) => s.userId === userId && !s.revokedAt);
}

export function createSession(session: Omit<Session, "id" | "createdAt" | "lastSeenAt">): Session {
    const db = getDb();
    const newSession: Session = {
        ...session,
        id: generateId("ses"),
        createdAt: new Date().toISOString(),
        lastSeenAt: new Date().toISOString(),
    };
    db.sessions.push(newSession);
    saveDb(db);
    return newSession;
}

export function updateSessionLastSeen(tokenHash: string): void {
    const db = getDb();
    const session = db.sessions.find((s) => s.tokenHash === tokenHash);
    if (session) {
        session.lastSeenAt = new Date().toISOString();
        saveDb(db);
    }
}

export function revokeSession(tokenHash: string): void {
    const db = getDb();
    const session = db.sessions.find((s) => s.tokenHash === tokenHash);
    if (session) {
        session.revokedAt = new Date().toISOString();
        saveDb(db);
    }
}

export function revokeUserSessions(userId: string): void {
    const db = getDb();
    db.sessions.forEach((s) => {
        if (s.userId === userId && !s.revokedAt) {
            s.revokedAt = new Date().toISOString();
        }
    });
    saveDb(db);
}

// Audit Logs
export function getAuditLogs(): AuditLog[] {
    return getDb().auditLogs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function createAuditLog(log: Omit<AuditLog, "id" | "createdAt">): AuditLog {
    const db = getDb();
    const newLog: AuditLog = {
        ...log,
        id: generateId("aud"),
        createdAt: new Date().toISOString(),
    };
    db.auditLogs.push(newLog);
    saveDb(db);
    return newLog;
}

// Vehicles
export function getVehicles(): Vehicle[] {
    return getDb().vehicles;
}

export function getVehicleById(id: string): Vehicle | undefined {
    return getDb().vehicles.find((v) => v.id === id);
}

export function createVehicle(vehicle: Omit<Vehicle, "id" | "createdAt">): Vehicle {
    const db = getDb();
    const newVehicle: Vehicle = {
        ...vehicle,
        id: generateId("veh"),
        createdAt: new Date().toISOString(),
    };
    db.vehicles.push(newVehicle);
    saveDb(db);
    return newVehicle;
}

export function updateVehicle(id: string, updates: Partial<Vehicle>): Vehicle | undefined {
    const db = getDb();
    const index = db.vehicles.findIndex((v) => v.id === id);
    if (index === -1) return undefined;
    db.vehicles[index] = { ...db.vehicles[index], ...updates };
    saveDb(db);
    return db.vehicles[index];
}

// Vehicle Assignments
export function getVehicleAssignments(): VehicleAssignment[] {
    return getDb().vehicleAssignments;
}

export function createVehicleAssignment(assignment: Omit<VehicleAssignment, "id" | "createdAt">): VehicleAssignment {
    const db = getDb();
    const newAssignment: VehicleAssignment = {
        ...assignment,
        id: generateId("asg"),
        createdAt: new Date().toISOString(),
    };
    db.vehicleAssignments.push(newAssignment);
    saveDb(db);
    return newAssignment;
}

export function updateVehicleAssignment(id: string, updates: Partial<VehicleAssignment>): VehicleAssignment | undefined {
    const db = getDb();
    const index = db.vehicleAssignments.findIndex((a) => a.id === id);
    if (index === -1) return undefined;
    db.vehicleAssignments[index] = { ...db.vehicleAssignments[index], ...updates };
    saveDb(db);
    return db.vehicleAssignments[index];
}

// Maintenance Tickets
export function getMaintenanceTickets(): MaintenanceTicket[] {
    return getDb().maintenanceTickets;
}

export function createMaintenanceTicket(ticket: Omit<MaintenanceTicket, "id" | "createdAt">): MaintenanceTicket {
    const db = getDb();
    const newTicket: MaintenanceTicket = {
        ...ticket,
        id: generateId("tkt"),
        createdAt: new Date().toISOString(),
    };
    db.maintenanceTickets.push(newTicket);
    saveDb(db);
    return newTicket;
}

export function updateMaintenanceTicket(id: string, updates: Partial<MaintenanceTicket>): MaintenanceTicket | undefined {
    const db = getDb();
    const index = db.maintenanceTickets.findIndex((t) => t.id === id);
    if (index === -1) return undefined;
    db.maintenanceTickets[index] = { ...db.maintenanceTickets[index], ...updates };
    saveDb(db);
    return db.maintenanceTickets[index];
}

// Inventory
export function getInventoryItems(): InventoryItem[] {
    return getDb().inventoryItems;
}

export function getInventoryItemById(id: string): InventoryItem | undefined {
    return getDb().inventoryItems.find((i) => i.id === id);
}

export function createInventoryItem(item: Omit<InventoryItem, "id">): InventoryItem {
    const db = getDb();
    const newItem: InventoryItem = {
        ...item,
        id: generateId("inv"),
    };
    db.inventoryItems.push(newItem);
    saveDb(db);
    return newItem;
}

export function updateInventoryItem(id: string, updates: Partial<InventoryItem>): InventoryItem | undefined {
    const db = getDb();
    const index = db.inventoryItems.findIndex((i) => i.id === id);
    if (index === -1) return undefined;
    db.inventoryItems[index] = { ...db.inventoryItems[index], ...updates };
    saveDb(db);
    return db.inventoryItems[index];
}

export function getInventoryTxns(): InventoryTxn[] {
    return getDb().inventoryTxns;
}

export function createInventoryTxn(txn: Omit<InventoryTxn, "id" | "createdAt">): InventoryTxn {
    const db = getDb();
    const newTxn: InventoryTxn = {
        ...txn,
        id: generateId("itx"),
        createdAt: new Date().toISOString(),
    };
    db.inventoryTxns.push(newTxn);

    // Update item level
    const item = db.inventoryItems.find((i) => i.id === txn.itemId);
    if (item) {
        item.currentLevel = txn.type === "in"
            ? item.currentLevel + txn.qty
            : Math.max(0, item.currentLevel - txn.qty);
    }

    saveDb(db);
    return newTxn;
}

// Meals
export function getMealTxns(): MealTxn[] {
    return getDb().mealTxns;
}

export function createMealTxn(txn: Omit<MealTxn, "id" | "createdAt">): MealTxn {
    const db = getDb();
    const newTxn: MealTxn = {
        ...txn,
        id: generateId("mtx"),
        createdAt: new Date().toISOString(),
    };
    db.mealTxns.push(newTxn);
    saveDb(db);
    return newTxn;
}

// Leave Requests
export function getLeaveRequests(): LeaveRequest[] {
    return getDb().leaveRequests;
}

export function createLeaveRequest(req: Omit<LeaveRequest, "id" | "createdAt">): LeaveRequest {
    const db = getDb();
    const newReq: LeaveRequest = {
        ...req,
        id: generateId("lev"),
        createdAt: new Date().toISOString(),
    };
    db.leaveRequests.push(newReq);
    saveDb(db);
    return newReq;
}

export function updateLeaveRequest(id: string, updates: Partial<LeaveRequest>): LeaveRequest | undefined {
    const db = getDb();
    const index = db.leaveRequests.findIndex((r) => r.id === id);
    if (index === -1) return undefined;
    db.leaveRequests[index] = { ...db.leaveRequests[index], ...updates };
    saveDb(db);
    return db.leaveRequests[index];
}

// Training
export function getTrainingLogs(): TrainingLog[] {
    return getDb().trainingLogs;
}

export function createTrainingLog(log: Omit<TrainingLog, "id" | "createdAt">): TrainingLog {
    const db = getDb();
    const newLog: TrainingLog = {
        ...log,
        id: generateId("trn"),
        createdAt: new Date().toISOString(),
    };
    db.trainingLogs.push(newLog);
    saveDb(db);
    return newLog;
}

export function updateTrainingLog(id: string, updates: Partial<TrainingLog>): TrainingLog | undefined {
    const db = getDb();
    const index = db.trainingLogs.findIndex((l) => l.id === id);
    if (index === -1) return undefined;
    db.trainingLogs[index] = { ...db.trainingLogs[index], ...updates };
    saveDb(db);
    return db.trainingLogs[index];
}
