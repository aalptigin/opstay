// Training Quiz Submit API
import { NextRequest, NextResponse } from "next/server";
import { verifySession, getClientIp } from "@/lib/org/session";
import { createAuditLog } from "@/lib/org/db";
import { QuizSubmitSchema } from "@/lib/training/schema";
import { submitQuiz, getCourseById, getQuizQuestionsForClient } from "@/lib/training/store";

export const runtime = "edge";

// GET /api/training/quiz?courseId=xxx - Get quiz questions (without answers)
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
        const courseId = searchParams.get("courseId");

        if (!courseId) {
            return NextResponse.json({ ok: false, error: "courseId gerekli" }, { status: 400 });
        }

        const course = getCourseById(courseId);
        if (!course) {
            return NextResponse.json({ ok: false, error: "Eğitim bulunamadı" }, { status: 404 });
        }

        if (!course.hasQuiz) {
            return NextResponse.json({ ok: false, error: "Bu eğitimde quiz yok" }, { status: 400 });
        }

        const questions = getQuizQuestionsForClient(courseId);
        return NextResponse.json({
            ok: true,
            questions,
            passingScore: course.passingScore,
        });
    } catch (error) {
        console.error("Get quiz error:", error);
        return NextResponse.json({ ok: false, error: "Sunucu hatası" }, { status: 500 });
    }
}

// POST /api/training/quiz?courseId=xxx - Submit quiz answers
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
        const courseId = searchParams.get("courseId");

        if (!courseId) {
            return NextResponse.json({ ok: false, error: "courseId gerekli" }, { status: 400 });
        }

        const course = getCourseById(courseId);
        if (!course) {
            return NextResponse.json({ ok: false, error: "Eğitim bulunamadı" }, { status: 404 });
        }

        const body = await request.json();
        const parsed = QuizSubmitSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({
                ok: false,
                error: "Validasyon hatası",
                details: parsed.error.issues,
            }, { status: 400 });
        }

        const personId = "usr_current"; // Mock
        const result = submitQuiz(courseId, personId, parsed.data.answers);

        // Audit log
        createAuditLog({
            actorId: session.user.id,
            action: "SUBMIT_QUIZ",
            module: "training",
            entityType: "quiz",
            entityId: courseId,
            ip,
            metadata: {
                score: result.score,
                passed: result.passed,
                totalQuestions: result.totalQuestions,
            },
        });

        console.log(`📚 [Training] Quiz submitted: ${courseId}, score: ${result.score}%, passed: ${result.passed}`);

        return NextResponse.json({ ok: true, result });
    } catch (error) {
        console.error("Submit quiz error:", error);
        return NextResponse.json({ ok: false, error: "Sunucu hatası" }, { status: 500 });
    }
}
