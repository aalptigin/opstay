// Training Courses API
import { NextRequest, NextResponse } from "next/server";
import { verifySession, getClientIp } from "@/lib/org/session";
import { hasPermission } from "@/lib/org/rbac";
import { createAuditLog } from "@/lib/org/db";
import { CreateCourseSchema } from "@/lib/training/schema";
import { getAllCourses, createCourse } from "@/lib/training/store";
import { CourseStatus } from "@/lib/training/types";

// GET /api/training/courses?status=PUBLISHED
export async function GET(request: NextRequest) {
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

        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status") as CourseStatus | null;

        const courses = getAllCourses(status || undefined);
        return NextResponse.json({ ok: true, courses });
    } catch (error) {
        console.error("Get courses error:", error);
        return NextResponse.json({ ok: false, error: "Sunucu hatası" }, { status: 500 });
    }
}

// POST /api/training/courses
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
            return NextResponse.json({ ok: false, error: "Eğitim oluşturma yetkiniz yok" }, { status: 403 });
        }

        const body = await request.json();
        const parsed = CreateCourseSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({
                ok: false,
                error: "Validasyon hatası",
                details: parsed.error.issues,
            }, { status: 400 });
        }

        const course = createCourse(parsed.data, {
            id: session.user.id,
            name: session.user.name,
        });

        // Audit log
        createAuditLog({
            actorId: session.user.id,
            action: "CREATE",
            module: "training",
            entityType: "course",
            entityId: course.id,
            ip,
            metadata: { title: course.title, contentType: course.contentType },
        });

        console.log(`📚 [Training] Course created: ${course.id}`);

        return NextResponse.json({ ok: true, course }, { status: 201 });
    } catch (error) {
        console.error("Create course error:", error);
        return NextResponse.json({ ok: false, error: "Sunucu hatası" }, { status: 500 });
    }
}
