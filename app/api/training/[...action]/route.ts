// Consolidated Training API Route
import { NextRequest, NextResponse } from "next/server";
import { verifySession, getClientIp } from "@/lib/org/session";
import { hasPermission } from "@/lib/org/rbac";
import { createAuditLog } from "@/lib/org/db";
import { AssignCourseSchema, CreateCourseSchema, ProgressCheckpointSchema, QuizSubmitSchema } from "@/lib/training/schema";
import {
    getTrainingOverview,
    getAllCourses,
    createCourse,
    getCourseById,
    createAssignment,
    getProgressByPerson,
    startProgress,
    updateProgress,
    getQuizQuestionsForClient,
    submitQuiz
} from "@/lib/training/store";
import { CourseStatus } from "@/lib/training/types";

// export const runtime = "edge";

// --- Helpers ---
const unauthorized = () => NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
const forbidden = (msg: string) => NextResponse.json({ ok: false, error: msg }, { status: 403 });
const serverError = (err: any) => {
    console.error("Training API Error:", err);
    return NextResponse.json({ ok: false, error: "Sunucu hatası" }, { status: 500 });
};

async function getSession(req: NextRequest) {
    const token = req.cookies.get("org_session")?.value;
    if (!token) return null;
    const ip = getClientIp(req.headers);
    const session = verifySession(token, ip);
    if (!session.valid || !session.user) return null;
    return { user: session.user, ip };
}

// --- Handlers ---

async function handleOverview(req: NextRequest) {
    const session = await getSession(req);
    if (!session) return unauthorized();

    // Mock personId
    const overview = getTrainingOverview("usr_current", session.user.role);
    return NextResponse.json({ ok: true, ...overview });
}

async function handleCoursesGet(req: NextRequest) {
    const session = await getSession(req);
    if (!session) return unauthorized();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") as CourseStatus | null;
    const courses = getAllCourses(status || undefined);
    return NextResponse.json({ ok: true, courses });
}

async function handleCoursesPost(req: NextRequest) {
    const session = await getSession(req);
    if (!session) return unauthorized();
    if (!hasPermission(session.user, "training", "create")) return forbidden("Yetkiniz yok");

    const body = await req.json();
    const parsed = CreateCourseSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ ok: false, error: "Validasyon hatası" }, { status: 400 });

    const course = createCourse(parsed.data, { id: session.user.id, name: session.user.name });

    createAuditLog({
        actorId: session.user.id, action: "CREATE", module: "training", entityType: "course",
        entityId: course.id, ip: session.ip, metadata: { title: course.title }
    });

    return NextResponse.json({ ok: true, course }, { status: 201 });
}

async function handleAssignPost(req: NextRequest) {
    const session = await getSession(req);
    if (!session) return unauthorized();
    if (!hasPermission(session.user, "training", "create")) return forbidden("Yetkiniz yok");

    const body = await req.json();
    const parsed = AssignCourseSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ ok: false, error: "Validasyon hatası" }, { status: 400 });

    const course = getCourseById(parsed.data.courseId);
    if (!course) return NextResponse.json({ ok: false, error: "Eğitim bulunamadı" }, { status: 404 });

    const assignment = createAssignment(parsed.data, { id: session.user.id, name: session.user.name });

    createAuditLog({
        actorId: session.user.id, action: "CREATE", module: "training", entityType: "assignment",
        entityId: assignment.id, ip: session.ip, metadata: { courseId: assignment.courseId }
    });

    return NextResponse.json({ ok: true, assignment }, { status: 201 });
}

async function handleProgressGet(req: NextRequest) {
    const session = await getSession(req);
    if (!session) return unauthorized();
    // Mock personId
    const progress = getProgressByPerson("usr_current");
    return NextResponse.json({ ok: true, progress });
}

async function handleProgressPost(req: NextRequest) {
    const session = await getSession(req);
    if (!session) return unauthorized();

    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");
    const courseId = searchParams.get("courseId");
    if (!courseId) return NextResponse.json({ ok: false, error: "courseId gerekli" }, { status: 400 });

    const personId = "usr_current"; // Mock

    if (action === "start") {
        const progress = startProgress(courseId, personId);
        createAuditLog({
            actorId: session.user.id, action: "START", module: "training", entityType: "progress",
            entityId: progress.id, ip: session.ip, metadata: { courseId }
        });
        return NextResponse.json({ ok: true, progress });
    }

    if (action === "checkpoint") {
        const body = await req.json();
        const parsed = ProgressCheckpointSchema.safeParse(body);
        if (!parsed.success) return NextResponse.json({ ok: false, error: "Validasyon hatası" }, { status: 400 });

        const progress = updateProgress(courseId, personId, parsed.data.progressPct);
        if (!progress) return NextResponse.json({ ok: false, error: "Bulunamadı" }, { status: 404 });
        return NextResponse.json({ ok: true, progress });
    }

    return NextResponse.json({ ok: false, error: "Geçersiz action" }, { status: 400 });
}

async function handleQuizGet(req: NextRequest) {
    const session = await getSession(req);
    if (!session) return unauthorized();

    const courseId = new URL(req.url).searchParams.get("courseId");
    if (!courseId) return NextResponse.json({ ok: false, error: "courseId gerekli" }, { status: 400 });

    const course = getCourseById(courseId);
    if (!course) return NextResponse.json({ ok: false, error: "Eğitim bulunamadı" }, { status: 404 });

    const questions = getQuizQuestionsForClient(courseId);
    return NextResponse.json({ ok: true, questions, passingScore: course.passingScore });
}

async function handleQuizPost(req: NextRequest) {
    const session = await getSession(req);
    if (!session) return unauthorized();

    const courseId = new URL(req.url).searchParams.get("courseId");
    if (!courseId) return NextResponse.json({ ok: false, error: "courseId gerekli" }, { status: 400 });

    const body = await req.json();
    const parsed = QuizSubmitSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ ok: false, error: "Validasyon hatası" }, { status: 400 });

    const result = submitQuiz(courseId, "usr_current", parsed.data.answers);

    createAuditLog({
        actorId: session.user.id, action: "SUBMIT_QUIZ", module: "training", entityType: "quiz",
        entityId: courseId, ip: session.ip, metadata: { score: result.score, passed: result.passed }
    });

    return NextResponse.json({ ok: true, result });
}

// --- Dispatcher ---

export async function GET(req: NextRequest, { params }: { params: Promise<{ action: string[] }> }) {
    try {
        const { action } = await params;
        const route = action[0];

        if (route === "overview") return handleOverview(req);
        if (route === "courses") return handleCoursesGet(req);
        if (route === "progress") return handleProgressGet(req);
        if (route === "quiz") return handleQuizGet(req);

        return NextResponse.json({ error: "Not found" }, { status: 404 });
    } catch (e) { return serverError(e); }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ action: string[] }> }) {
    try {
        const { action } = await params;
        const route = action[0];

        if (route === "courses") return handleCoursesPost(req);
        if (route === "assign") return handleAssignPost(req);
        if (route === "progress") return handleProgressPost(req);
        if (route === "quiz") return handleQuizPost(req);

        return NextResponse.json({ error: "Not found" }, { status: 404 });
    } catch (e) { return serverError(e); }
}
