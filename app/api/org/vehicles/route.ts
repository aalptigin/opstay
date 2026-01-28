// Vehicle API Routes
import { NextRequest, NextResponse } from "next/server";
import {
    getVehicles,
    createVehicle,
    getVehicleById,
    createAuditLog,
} from "@/lib/org/db";
import { verifySession, getClientIp } from "@/lib/org/session";
import { canAccessUnit } from "@/lib/org/rbac";
import { VehicleStatus } from "@/lib/org/types";

// GET /api/org/vehicles - List all vehicles (role-filtered)
export async function GET(request: NextRequest) {
    try {
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
        let vehicles = getVehicles();

        // Role-based filtering
        if (user.role !== "PRESIDENT") {
            // UNIT_MANAGER and STAFF see only their unit's vehicles
            vehicles = vehicles.filter((v) => {
                if (!v.unitId) return true; // Unassigned vehicles visible to all
                return canAccessUnit(user, v.unitId);
            });
        }

        console.log("🚗 [Vehicles API] Returning", vehicles.length, "vehicles for", user.name);
        return NextResponse.json({ vehicles });
    } catch (error) {
        console.error("Vehicles GET error:", error);
        return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
    }
}

// POST /api/org/vehicles - Create new vehicle
export async function POST(request: NextRequest) {
    try {
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

        // Only PRESIDENT and UNIT_MANAGER can create vehicles
        if (user.role === "STAFF") {
            return NextResponse.json(
                { error: "Bu işlem için yetkiniz yok" },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { plate, model, km, status, insuranceExpiry, inspectionExpiry, unitId } = body;

        // Validation
        if (!plate || !model) {
            return NextResponse.json(
                { error: "Plaka ve model zorunludur" },
                { status: 400 }
            );
        }

        // Check for duplicate plate
        const existingVehicles = getVehicles();
        if (existingVehicles.some((v) => v.plate.toLowerCase() === plate.toLowerCase())) {
            return NextResponse.json(
                { error: "Bu plaka zaten kayıtlı" },
                { status: 409 }
            );
        }

        // For UNIT_MANAGER, force their own unit
        const finalUnitId = user.role === "UNIT_MANAGER" ? user.unitId : unitId;

        const newVehicle = createVehicle({
            plate: plate.toUpperCase(),
            model,
            km: Number(km) || 0,
            status: (status as VehicleStatus) || "available",
            insuranceExpiry: insuranceExpiry || undefined,
            inspectionExpiry: inspectionExpiry || undefined,
            unitId: finalUnitId,
        });

        // Audit log
        createAuditLog({
            actorId: user.id,
            action: "CREATE",
            module: "vehicles",
            entityType: "vehicle",
            entityId: newVehicle.id,
            unitId: finalUnitId,
            ip,
            metadata: { plate: newVehicle.plate, model: newVehicle.model },
        });

        console.log("✅ [Vehicles API] Created vehicle:", newVehicle.plate);
        return NextResponse.json({ success: true, vehicle: newVehicle }, { status: 201 });
    } catch (error) {
        console.error("Vehicles POST error:", error);
        return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
    }
}
