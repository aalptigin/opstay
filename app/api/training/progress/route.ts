// Training Progress API
import { NextRequest, NextResponse } from "next/server";
import { verifySession, getClientIp } from "@/lib/org/session";
import { createAuditLog } from "@/lib/org/db";
import { ProgressCheckpointSchema } from "@/lib/training/schema";
import { startProgress, updateProgress, getProgressByPerson } from "@/lib/training/store";

// GET /api/training/progress
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

        // Use mock personId for demo
        const personId = "usr_current";
        const progress = getProgressByPerson(personId);

        return NextResponse.json({ ok: true, progress });
    } catch (error) {
        console.error("Get progress error:", error);
        return NextResponse.json({ ok: false, error: "Sunucu hatası" }, { status: 500 });
    }
}

// POST /api/training/progress?action=start&courseId=xxx
// POST /api/training/progress?action=checkpoint&courseId=xxx (body: { progressPct })
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

        const { searchParams } = new URL(request.url);
        const action = searchParams.get("action");
        const courseId = searchParams.get("courseId");

        if (!courseId) {
            return NextResponse.json({ ok: false, error: "courseId gerekli" }, { status: 400 });
        }

        const personId = "usr_current"; // Mock

        if (action === "start") {
            const progress = startProgress(courseId, personId);

            createAuditLog({
                actorId: session.user.id,
                action: "START",
                module: "training",
                entityType: "progress",
                entityId: progress.id,
                ip,
                metadata: { courseId },
            });

            console.log(`📚 [Training] Progress started: ${progress.id}`);
            return NextResponse.json({ ok: true, progress });
        }

        if (action === "checkpoint") {
            const body = await request.json();
            const parsed = ProgressCheckpointSchema.safeParse(body);

            if (!parsed.success) {
                return NextResponse.json({ ok: false, error: "Validasyon hatası" }, { status: 400 });
            }

            const progress = updateProgress(courseId, personId, parsed.data.progressPct);
            if (!progress) {
                return NextResponse.json({ ok: false, error: "İlerleme kaydı bulunamadı" }, { status: 404 });
            }

            console.log(`📚 [Training] Progress updated: ${progress.id} -> ${parsed.data.progressPct}%`);
            return NextResponse.json({ ok: true, progress });
        }

        return NextResponse.json({ ok: false, error: "Geçersiz action" }, { status: 400 });
    } catch (error) {
        console.error("Progress action error:", error);
        return NextResponse.json({ ok: false, error: "Sunucu hatası" }, { status: 500 });
    }
}
