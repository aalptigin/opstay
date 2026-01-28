import { NextRequest, NextResponse } from "next/server";
import { verifySession, getClientIp } from "@/lib/org/session";
import { hasPermission } from "@/lib/org/rbac";
import { createAuditLog } from "@/lib/org/db";
import { AssignCourseSchema, CreateCourseSchema, ProgressCheckpointSchema, QuizSubmitSchema } from "@/lib/training/schema";
import {
    getAllCourses, createCourse, createAssignment, getCourseById,
    getTrainingOverview, getProgressByPerson, startProgress, updateProgress,
    getQuizQuestionsForClient, submitQuiz
} from "@/lib/training/store";
import { CourseStatus } from "@/lib/training/types";

export const runtime = "edge";

export async function GET(request: NextRequest, { params }: { params: Promise<{ action: string[] }> }) {
    const { action } = await params;
    const path = action[0];

    // GET /api/training/courses
    if (path === "courses") {
        try {
            const token = request.cookies.get("org_session")?.value;
            if (!token) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

            const ip = getClientIp(request.headers);
            const session = verifySession(token, ip);
            if (!session.valid || !session.user) return NextResponse.json({ ok: false, error: session.error }, { status: 401 });

            const { searchParams } = new URL(request.url);
            const status = searchParams.get("status") as CourseStatus | null;
            const courses = getAllCourses(status || undefined);
            return NextResponse.json({ ok: true, courses });
        } catch (error) {
            console.error("Get courses error:", error);
            return NextResponse.json({ ok: false, error: "Sunucu hatası" }, { status: 500 });
        }
    }

    // GET /api/training/overview
    if (path === "overview") {
        try {
            const token = request.cookies.get("org_session")?.value;
            if (!token) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

            const ip = getClientIp(request.headers);
            const session = verifySession(token, ip);
            if (!session.valid || !session.user) return NextResponse.json({ ok: false, error: session.error }, { status: 401 });

            // Mock personId
            const personId = "usr_current";
            const overview = getTrainingOverview(personId, session.user.role);
            return NextResponse.json({ ok: true, ...overview });
        } catch (error) {
            console.error("Training overview error:", error);
            return NextResponse.json({ ok: false, error: "Sunucu hatası" }, { status: 500 });
        }
    }

    // GET /api/training/progress
    if (path === "progress") {
        try {
            const token = request.cookies.get("org_session")?.value;
            if (!token) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

            const ip = getClientIp(request.headers);
            const session = verifySession(token, ip);
            if (!session.valid || !session.user) return NextResponse.json({ ok: false, error: session.error }, { status: 401 });

            const personId = "usr_current";
            const progress = getProgressByPerson(personId);
            return NextResponse.json({ ok: true, progress });
        } catch (error) {
            console.error("Get progress error:", error);
            return NextResponse.json({ ok: false, error: "Sunucu hatası" }, { status: 500 });
        }
    }

    // GET /api/training/quiz
    if (path === "quiz") {
        try {
            const token = request.cookies.get("org_session")?.value;
            if (!token) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

            const ip = getClientIp(request.headers);
            const session = verifySession(token, ip);
            if (!session.valid || !session.user) return NextResponse.json({ ok: false, error: session.error }, { status: 401 });

            const { searchParams } = new URL(request.url);
            const courseId = searchParams.get("courseId");
            if (!courseId) return NextResponse.json({ ok: false, error: "courseId gerekli" }, { status: 400 });

            const course = getCourseById(courseId);
            if (!course) return NextResponse.json({ ok: false, error: "Eğitim bulunamadı" }, { status: 404 });
            if (!course.hasQuiz) return NextResponse.json({ ok: false, error: "Bu eğitimde quiz yok" }, { status: 400 });

            const questions = getQuizQuestionsForClient(courseId);
            return NextResponse.json({ ok: true, questions, passingScore: course.passingScore });
        } catch (error) {
            console.error("Get quiz error:", error);
            return NextResponse.json({ ok: false, error: "Sunucu hatası" }, { status: 500 });
        }
    }

    return NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ action: string[] }> }) {
    const { action } = await params;
    const path = action[0];

    // POST /api/training/assign
    if (path === "assign") {
        try {
            const token = request.cookies.get("org_session")?.value;
            if (!token) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

            const ip = getClientIp(request.headers);
            const session = verifySession(token, ip);
            if (!session.valid || !session.user) return NextResponse.json({ ok: false, error: session.error }, { status: 401 });

            if (!hasPermission(session.user, "training", "create")) {
                return NextResponse.json({ ok: false, error: "Atama yapma yetkiniz yok" }, { status: 403 });
            }

            const body = await request.json();
            const parsed = AssignCourseSchema.safeParse(body);
            if (!parsed.success) return NextResponse.json({ ok: false, error: "Validasyon hatası", details: parsed.error.issues }, { status: 400 });

            const course = getCourseById(parsed.data.courseId);
            if (!course) return NextResponse.json({ ok: false, error: "Eğitim bulunamadı" }, { status: 404 });

            const assignment = createAssignment(parsed.data, { id: session.user.id, name: session.user.name });

            createAuditLog({
                actorId: session.user.id, action: "CREATE", module: "training", entityType: "assignment", entityId: assignment.id, ip,
                metadata: { courseId: assignment.courseId, courseTitle: course.title, targetType: assignment.targetType, dueDate: assignment.dueDate }
            });

            return NextResponse.json({ ok: true, assignment }, { status: 201 });
        } catch (error) {
            console.error("Assign course error:", error);
            return NextResponse.json({ ok: false, error: "Sunucu hatası" }, { status: 500 });
        }
    }

    // POST /api/training/courses
    if (path === "courses") {
        try {
            const token = request.cookies.get("org_session")?.value;
            if (!token) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

            const ip = getClientIp(request.headers);
            const session = verifySession(token, ip);
            if (!session.valid || !session.user) return NextResponse.json({ ok: false, error: session.error }, { status: 401 });

            if (!hasPermission(session.user, "training", "create")) {
                return NextResponse.json({ ok: false, error: "Eğitim oluşturma yetkiniz yok" }, { status: 403 });
            }

            const body = await request.json();
            const parsed = CreateCourseSchema.safeParse(body);
            if (!parsed.success) return NextResponse.json({ ok: false, error: "Validasyon hatası", details: parsed.error.issues }, { status: 400 });

            const course = createCourse(parsed.data, { id: session.user.id, name: session.user.name });

            createAuditLog({
                actorId: session.user.id, action: "CREATE", module: "training", entityType: "course", entityId: course.id, ip,
                metadata: { title: course.title, contentType: course.contentType }
            });

            return NextResponse.json({ ok: true, course }, { status: 201 });
        } catch (error) {
            console.error("Create course error:", error);
            return NextResponse.json({ ok: false, error: "Sunucu hatası" }, { status: 500 });
        }
    }

    // POST /api/training/progress
    if (path === "progress") {
        try {
            const token = request.cookies.get("org_session")?.value;
            if (!token) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

            const ip = getClientIp(request.headers);
            const session = verifySession(token, ip);
            if (!session.valid || !session.user) return NextResponse.json({ ok: false, error: session.error }, { status: 401 });

            const { searchParams } = new URL(request.url);
            const action = searchParams.get("action");
            const courseId = searchParams.get("courseId");
            const personId = "usr_current";

            if (!courseId) return NextResponse.json({ ok: false, error: "courseId gerekli" }, { status: 400 });

            if (action === "start") {
                const progress = startProgress(courseId, personId);
                createAuditLog({ actorId: session.user.id, action: "START", module: "training", entityType: "progress", entityId: progress.id, ip, metadata: { courseId } });
                return NextResponse.json({ ok: true, progress });
            }

            if (action === "checkpoint") {
                const body = await request.json();
                const parsed = ProgressCheckpointSchema.safeParse(body);
                if (!parsed.success) return NextResponse.json({ ok: false, error: "Validasyon hatası" }, { status: 400 });

                const progress = updateProgress(courseId, personId, parsed.data.progressPct);
                if (!progress) return NextResponse.json({ ok: false, error: "İlerleme kaydı bulunamadı" }, { status: 404 });
                return NextResponse.json({ ok: true, progress });
            }

            return NextResponse.json({ ok: false, error: "Geçersiz action" }, { status: 400 });
        } catch (error) {
            console.error("Progress action error:", error);
            return NextResponse.json({ ok: false, error: "Sunucu hatası" }, { status: 500 });
        }
    }

    // POST /api/training/quiz
    if (path === "quiz") {
        try {
            const token = request.cookies.get("org_session")?.value;
            if (!token) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

            const ip = getClientIp(request.headers);
            const session = verifySession(token, ip);
            if (!session.valid || !session.user) return NextResponse.json({ ok: false, error: session.error }, { status: 401 });

            const { searchParams } = new URL(request.url);
            const courseId = searchParams.get("courseId");
            if (!courseId) return NextResponse.json({ ok: false, error: "courseId gerekli" }, { status: 400 });

            const course = getCourseById(courseId);
            if (!course) return NextResponse.json({ ok: false, error: "Eğitim bulunamadı" }, { status: 404 });

            const body = await request.json();
            const parsed = QuizSubmitSchema.safeParse(body);
            if (!parsed.success) return NextResponse.json({ ok: false, error: "Validasyon hatası", details: parsed.error.issues }, { status: 400 });

            const personId = "usr_current";
            const result = submitQuiz(courseId, personId, parsed.data.answers);

            createAuditLog({
                actorId: session.user.id, action: "SUBMIT_QUIZ", module: "training", entityType: "quiz", entityId: courseId, ip,
                metadata: { score: result.score, passed: result.passed, totalQuestions: result.totalQuestions }
            });

            return NextResponse.json({ ok: true, result });
        } catch (error) {
            console.error("Submit quiz error:", error);
            return NextResponse.json({ ok: false, error: "Sunucu hatası" }, { status: 500 });
        }
    }

    return NextResponse.json({ error: "Not found" }, { status: 404 });
}
