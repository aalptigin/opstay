// Vehicle Detail API Routes
import { NextRequest, NextResponse } from "next/server";
import {
    getVehicleById,
    updateVehicle,
    getVehicleAssignments,
    getMaintenanceTickets,
    createAuditLog,
} from "@/lib/org/db";
import { verifySession, getClientIp } from "@/lib/org/session";
import { canAccessUnit } from "@/lib/org/rbac";
import { VehicleStatus } from "@/lib/org/types";

export const runtime = "edge";

// GET /api/org/vehicles/[id] - Get vehicle detail
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const token = request.cookies.get("org_session")?.value;
        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const ip = getClientIp(request.headers);
        const result = verifySession(token, ip);
        if (!result.valid || !result.user) {
            return NextResponse.json({ error: result.error }, { status: 401 });
        }

        const vehicle = getVehicleById(id);
        if (!vehicle) {
            return NextResponse.json({ error: "Araç bulunamadı" }, { status: 404 });
        }

        // Check access
        const user = result.user;
        if (user.role !== "PRESIDENT" && vehicle.unitId && !canAccessUnit(user, vehicle.unitId)) {
            return NextResponse.json({ error: "Bu araca erişim yetkiniz yok" }, { status: 403 });
        }

        // Get related data
        const assignments = getVehicleAssignments().filter((a) => a.vehicleId === id);
        const tickets = getMaintenanceTickets().filter((t) => t.vehicleId === id);

        return NextResponse.json({
            vehicle,
            assignments,
            tickets,
        });
    } catch (error) {
        console.error("Vehicle GET error:", error);
        return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
    }
}

// PUT /api/org/vehicles/[id] - Update vehicle
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const token = request.cookies.get("org_session")?.value;
        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const ip = getClientIp(request.headers);
        const result = verifySession(token, ip);
        if (!result.valid || !result.user) {
            return NextResponse.json({ error: result.error }, { status: 401 });
        }

        const user = result.user;

        // Only PRESIDENT and UNIT_MANAGER can update
        if (user.role === "STAFF") {
            return NextResponse.json(
                { error: "Bu işlem için yetkiniz yok" },
                { status: 403 }
            );
        }

        const vehicle = getVehicleById(id);
        if (!vehicle) {
            return NextResponse.json({ error: "Araç bulunamadı" }, { status: 404 });
        }

        // Check access
        if (user.role !== "PRESIDENT" && vehicle.unitId && !canAccessUnit(user, vehicle.unitId)) {
            return NextResponse.json({ error: "Bu aracı düzenleme yetkiniz yok" }, { status: 403 });
        }

        const body = await request.json();
        const { plate, model, km, status, insuranceExpiry, inspectionExpiry, unitId } = body;

        const updatedVehicle = updateVehicle(id, {
            plate: plate?.toUpperCase() || vehicle.plate,
            model: model || vehicle.model,
            km: km !== undefined ? Number(km) : vehicle.km,
            status: (status as VehicleStatus) || vehicle.status,
            insuranceExpiry: insuranceExpiry ?? vehicle.insuranceExpiry,
            inspectionExpiry: inspectionExpiry ?? vehicle.inspectionExpiry,
            unitId: user.role === "PRESIDENT" ? unitId : vehicle.unitId,
        });

        if (!updatedVehicle) {
            return NextResponse.json({ error: "Güncelleme başarısız" }, { status: 500 });
        }

        // Audit log
        createAuditLog({
            actorId: user.id,
            action: "UPDATE",
            module: "vehicles",
            entityType: "vehicle",
            entityId: id,
            unitId: vehicle.unitId,
            ip,
            metadata: { changes: body },
        });

        console.log("✅ [Vehicles API] Updated vehicle:", updatedVehicle.plate);
        return NextResponse.json({ success: true, vehicle: updatedVehicle });
    } catch (error) {
        console.error("Vehicle PUT error:", error);
        return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
    }
}
