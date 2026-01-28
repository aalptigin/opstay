// Inventory API
import { NextRequest, NextResponse } from "next/server";
import { getInventoryItems, getInventoryTxns, createInventoryItem, createInventoryTxn } from "@/lib/org/db";
import { verifySession, getClientIp } from "@/lib/org/session";
import { hasPermission } from "@/lib/org/rbac";
import { audit } from "@/lib/org/audit";

export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get("org_session")?.value;
        if (!token) {
            return NextResponse.json({ error: "Oturum gerekli" }, { status: 401 });
        }

        const ip = getClientIp(request.headers);
        const session = verifySession(token, ip);
        if (!session.valid || !session.user) {
            return NextResponse.json({ error: session.error }, { status: 401 });
        }

        if (!hasPermission(session.user, "inventory", "read")) {
            return NextResponse.json({ error: "Yetki yok" }, { status: 403 });
        }

        const items = getInventoryItems();
        const txns = getInventoryTxns();

        return NextResponse.json({ items, txns });
    } catch (error) {
        console.error("Get inventory error:", error);
        return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const token = request.cookies.get("org_session")?.value;
        if (!token) {
            return NextResponse.json({ error: "Oturum gerekli" }, { status: 401 });
        }

        const ip = getClientIp(request.headers);
        const session = verifySession(token, ip);
        if (!session.valid || !session.user) {
            return NextResponse.json({ error: session.error }, { status: 401 });
        }

        if (!hasPermission(session.user, "inventory", "create")) {
            return NextResponse.json({ error: "Yetki yok" }, { status: 403 });
        }

        const body = await request.json();

        // Transaction or new item?
        if (body.itemId) {
            // Create transaction
            const { itemId, type, qty, notes, unitId } = body;

            const txn = createInventoryTxn({
                itemId,
                type,
                qty,
                requestedBy: session.user.id,
                unitId: unitId || session.user.unitId,
                notes,
            });

            audit({
                actor: { id: session.user.id, unitId: session.user.unitId },
                action: "CREATE",
                module: "inventory",
                entityType: "transaction",
                entityId: txn.id,
                ip,
                metadata: { itemId, type, qty },
            });

            return NextResponse.json({ txn });
        } else {
            // Create new item
            const { depotType, name, unit, minLevel, currentLevel } = body;

            if (!depotType || !name || !unit) {
                return NextResponse.json({ error: "Depo türü, isim ve birim gerekli" }, { status: 400 });
            }

            const item = createInventoryItem({
                depotType,
                name,
                unit,
                minLevel: minLevel || 0,
                currentLevel: currentLevel || 0,
            });

            audit({
                actor: { id: session.user.id, unitId: session.user.unitId },
                action: "CREATE",
                module: "inventory",
                entityType: "item",
                entityId: item.id,
                ip,
                metadata: { depotType, name },
            });

            return NextResponse.json({ item });
        }
    } catch (error) {
        console.error("Create inventory error:", error);
        return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
    }
}
