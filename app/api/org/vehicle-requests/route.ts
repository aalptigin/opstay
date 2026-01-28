// Vehicle Requests API Routes
import { NextRequest, NextResponse } from "next/server";
import {
    getVehicleAssignments,
    createVehicleAssignment,
    getVehicleById,
    createAuditLog,
} from "@/lib/org/db";
import { verifySession, getClientIp } from "@/lib/org/session";
import { canAccessUnit } from "@/lib/org/rbac";

export const runtime = "edge";

// GET /api/org/vehicle-requests - List vehicle requests
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
        const { searchParams } = new URL(request.url);
        const vehicleId = searchParams.get("vehicleId");
        const status = searchParams.get("status");

        let requests = getVehicleAssignments();

        // Filter by vehicleId if provided
        if (vehicleId) {
            requests = requests.filter((r) => r.vehicleId === vehicleId);
        }

        // Filter by status if provided
        if (status) {
            requests = requests.filter((r) => r.status === status);
        }

        // Role-based filtering - non-presidents see only their related requests
        if (user.role !== "PRESIDENT") {
            requests = requests.filter((r) => {
                // See own requests
                if (r.requesterId === user.id) return true;
                // UNIT_MANAGER sees requests for vehicles in their unit
                if (user.role === "UNIT_MANAGER") {
                    const vehicle = getVehicleById(r.vehicleId);
                    if (vehicle && vehicle.unitId && canAccessUnit(user, vehicle.unitId)) {
                        return true;
                    }
                }
                return false;
            });
        }

        return NextResponse.json({ requests });
    } catch (error) {
        console.error("Vehicle Requests GET error:", error);
        return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
    }
}

// POST /api/org/vehicle-requests - Create vehicle request
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
        const body = await request.json();
        const { vehicleId, purpose, startTime, endTime } = body;

        // Validation
        if (!vehicleId || !purpose) {
            return NextResponse.json(
                { error: "Araç ve kullanım amacı zorunludur" },
                { status: 400 }
            );
        }

        // Check vehicle exists and is available
        const vehicle = getVehicleById(vehicleId);
        if (!vehicle) {
            return NextResponse.json({ error: "Araç bulunamadı" }, { status: 404 });
        }

        if (vehicle.status !== "available") {
            return NextResponse.json(
                { error: "Bu araç şu an kullanılabilir değil" },
                { status: 400 }
            );
        }

        // Create request with PENDING status
        const newRequest = createVehicleAssignment({
            vehicleId,
            requesterId: user.id,
            status: "pending",
            purpose,
            startTime: startTime || undefined,
            endTime: endTime || undefined,
        });

        // Audit log
        createAuditLog({
            actorId: user.id,
            action: "CREATE",
            module: "vehicles",
            entityType: "vehicle_request",
            entityId: newRequest.id,
            unitId: vehicle.unitId,
            ip,
            metadata: { vehicleId, purpose },
        });

        console.log("✅ [Vehicle Requests API] Created request for vehicle:", vehicle.plate);
        return NextResponse.json({ success: true, request: newRequest }, { status: 201 });
    } catch (error) {
        console.error("Vehicle Requests POST error:", error);
        return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
    }
}
