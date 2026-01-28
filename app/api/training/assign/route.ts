// Training Assign API
import { NextRequest, NextResponse } from "next/server";
import { verifySession, getClientIp } from "@/lib/org/session";
import { hasPermission } from "@/lib/org/rbac";
import { createAuditLog } from "@/lib/org/db";
import { AssignCourseSchema } from "@/lib/training/schema";
import { createAssignment, getCourseById } from "@/lib/training/store";

// POST /api/training/assign
export async function POST(request: NextRequest) {
    try {
        const token = request.cookies.get("org_session")?.value;
        if (!token) {
            return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
        }

        const ip = getClientIp(request.headers);
        const session = verifySession(token, ip);
        if (!session.valid || !session.user) {
            return NextResponse.json({ ok: false, error: session.error }, { status: 401 });
        }

        // RBAC check
        if (!hasPermission(session.user, "training", "create")) {
            return NextResponse.json({ ok: false, error: "Atama yapma yetkiniz yok" }, { status: 403 });
        }

        const body = await request.json();
        const parsed = AssignCourseSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({
                ok: false,
                error: "Validasyon hatası",
                details: parsed.error.issues,
            }, { status: 400 });
        }

        // Verify course exists
        const course = getCourseById(parsed.data.courseId);
        if (!course) {
            return NextResponse.json({ ok: false, error: "Eğitim bulunamadı" }, { status: 404 });
        }

        const assignment = createAssignment(parsed.data, {
            id: session.user.id,
            name: session.user.name,
        });

        // Audit log
        createAuditLog({
            actorId: session.user.id,
            action: "CREATE",
            module: "training",
            entityType: "assignment",
            entityId: assignment.id,
            ip,
            metadata: {
                courseId: assignment.courseId,
                courseTitle: course.title,
                targetType: assignment.targetType,
                dueDate: assignment.dueDate,
            },
        });

        console.log(`📚 [Training] Assignment created: ${assignment.id}`);

        return NextResponse.json({ ok: true, assignment }, { status: 201 });
    } catch (error) {
        console.error("Assign course error:", error);
        return NextResponse.json({ ok: false, error: "Sunucu hatası" }, { status: 500 });
    }
}
