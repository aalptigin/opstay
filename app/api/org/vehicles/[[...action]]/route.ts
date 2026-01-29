// Consolidated Vehicles API Route
import { NextRequest, NextResponse } from "next/server";
import { getVehicles, createVehicle, getVehicleById, updateVehicle, getVehicleAssignments, createVehicleAssignment, createAuditLog, getMaintenanceTickets } from "@/lib/org/db";
import { verifySession, getClientIp } from "@/lib/org/session";
import { canAccessUnit } from "@/lib/org/rbac";
import { VehicleStatus } from "@/lib/org/types";

export const runtime = "edge";

// --- Helpers ---
const unauthorized = (msg = "Unauthorized") => NextResponse.json({ error: msg }, { status: 401 });
const forbidden = (msg = "Forbidden") => NextResponse.json({ error: msg }, { status: 403 });
const serverError = (err: any) => {
    console.error("Vehicles API Error:", err);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
};

async function getSession(req: NextRequest) {
    const token = req.cookies.get("org_session")?.value;
    if (!token) return null;
    const ip = getClientIp(req.headers);
    const session = verifySession(token, ip);
    if (!session.valid || !session.user) return null;
    return { ...session, ip };
}

// --- Handlers ---

// GET /vehicles (Root)
async function handleVehiclesGet(req: NextRequest, session: any) {
    const user = session.user;
    let vehicles = getVehicles();

    if (user.role !== "PRESIDENT") {
        vehicles = vehicles.filter(v => !v.unitId || canAccessUnit(user, v.unitId));
    }
    return NextResponse.json({ vehicles });
}

// POST /vehicles (Root)
async function handleVehiclesPost(req: NextRequest, session: any) {
    if (session.user.role === "STAFF") return forbidden("Yetkiniz yok");

    const body = await req.json();
    const { plate, model, km, status, insuranceExpiry, inspectionExpiry, unitId } = body;
    if (!plate || !model) return NextResponse.json({ error: "Eksik bilgi" }, { status: 400 });

    const finalUnitId = session.user.role === "UNIT_MANAGER" ? session.user.unitId : unitId;

    const newVehicle = createVehicle({
        plate: plate.toUpperCase(), model, km: Number(km) || 0,
        status: status as VehicleStatus || "available",
        insuranceExpiry, inspectionExpiry, unitId: finalUnitId
    });

    createAuditLog({
        actorId: session.user.id, action: "CREATE", module: "vehicles", entityType: "vehicle",
        entityId: newVehicle.id, unitId: finalUnitId, ip: session.ip, metadata: { plate: newVehicle.plate }
    });

    return NextResponse.json({ success: true, vehicle: newVehicle }, { status: 201 });
}

// GET /vehicles/[id]
async function handleVehicleDetailGet(req: NextRequest, session: any, id: string) {
    const vehicle = getVehicleById(id);
    if (!vehicle) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
    if (session.user.role !== "PRESIDENT" && vehicle.unitId && !canAccessUnit(session.user, vehicle.unitId)) return forbidden();

    const assignments = getVehicleAssignments().filter(a => a.vehicleId === id);
    const tickets = getMaintenanceTickets().filter(t => t.vehicleId === id);
    return NextResponse.json({ vehicle, assignments, tickets });
}

// PUT /vehicles/[id]
async function handleVehicleDetailPut(req: NextRequest, session: any, id: string) {
    if (session.user.role === "STAFF") return forbidden();
    const vehicle = getVehicleById(id);
    if (!vehicle) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
    if (session.user.role !== "PRESIDENT" && vehicle.unitId && !canAccessUnit(session.user, vehicle.unitId)) return forbidden();

    const body = await req.json();
    const updated = updateVehicle(id, { ...body, plate: body.plate?.toUpperCase() });
    if (!updated) return serverError("Update failed");

    createAuditLog({
        actorId: session.user.id, action: "UPDATE", module: "vehicles", entityType: "vehicle",
        entityId: id, unitId: vehicle.unitId, ip: session.ip, metadata: { changes: body }
    });

    return NextResponse.json({ success: true, vehicle: updated });
}

// GET /vehicles/requests
async function handleRequestsGet(req: NextRequest, session: any) {
    const { searchParams } = new URL(req.url);
    const vehicleId = searchParams.get("vehicleId");
    const status = searchParams.get("status");

    let requests = getVehicleAssignments();
    if (vehicleId) requests = requests.filter(r => r.vehicleId === vehicleId);
    if (status) requests = requests.filter(r => r.status === status);

    if (session.user.role !== "PRESIDENT") {
        requests = requests.filter(r => {
            if (r.requesterId === session.user.id) return true;
            if (session.user.role === "UNIT_MANAGER") {
                const vehicle = getVehicleById(r.vehicleId);
                return vehicle && vehicle.unitId && canAccessUnit(session.user, vehicle.unitId);
            }
            return false;
        });
    }
    return NextResponse.json({ requests });
}

// POST /vehicles/requests
async function handleRequestsPost(req: NextRequest, session: any) {
    const body = await req.json();
    const { vehicleId, purpose, startTime, endTime } = body;
    if (!vehicleId || !purpose) return NextResponse.json({ error: "Eksik bilgi" }, { status: 400 });

    const vehicle = getVehicleById(vehicleId);
    if (!vehicle) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
    if (vehicle.status !== "available") return NextResponse.json({ error: "Araç uygun değil" }, { status: 400 });

    const request = createVehicleAssignment({
        vehicleId, requesterId: session.user.id, status: "pending", purpose, startTime, endTime
    });

    createAuditLog({
        actorId: session.user.id, action: "CREATE", module: "vehicles", entityType: "vehicle_request",
        entityId: request.id, unitId: vehicle.unitId, ip: session.ip, metadata: { vehicleId }
    });

    return NextResponse.json({ success: true, request }, { status: 201 });
}

// --- Dispatcher ---

export async function GET(req: NextRequest, { params }: { params: Promise<{ action?: string[] }> }) {
    try {
        const session = await getSession(req);
        if (!session) return unauthorized();

        const { action } = await params;

        // GET /api/org/vehicles (Root)
        if (!action || action.length === 0) {
            return handleVehiclesGet(req, session);
        }

        const route = action[0];

        // GET /api/org/vehicles/requests
        if (route === "requests") {
            return handleRequestsGet(req, session);
        }

        // GET /api/org/vehicles/[id]
        if (action.length === 1) {
            return handleVehicleDetailGet(req, session, route);
        }

        return NextResponse.json({ error: "Not found" }, { status: 404 });
    } catch (e) { return serverError(e); }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ action?: string[] }> }) {
    try {
        const session = await getSession(req);
        if (!session) return unauthorized();

        const { action } = await params;

        // POST /api/org/vehicles (Root)
        if (!action || action.length === 0) {
            return handleVehiclesPost(req, session);
        }

        const route = action[0];

        // POST /api/org/vehicles/requests
        if (route === "requests") {
            return handleRequestsPost(req, session);
        }

        return NextResponse.json({ error: "Not found" }, { status: 404 });
    } catch (e) { return serverError(e); }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ action?: string[] }> }) {
    try {
        const session = await getSession(req);
        if (!session) return unauthorized();

        const { action } = await params;
        if (!action || action.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });

        const route = action[0];

        // PUT /api/org/vehicles/[id]
        if (action.length === 1 && route !== "requests") {
            return handleVehicleDetailPut(req, session, route);
        }

        return NextResponse.json({ error: "Not found" }, { status: 404 });
    } catch (e) { return serverError(e); }
}
