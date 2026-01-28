// Training Store - In-memory storage with sample data
import {
    Course,
    CourseSummary,
    CourseAssignment,
    LearnerProgress,
    QuizQuestion,
    TrainingKpi,
    TrainingOverviewPayload,
    TrainingPermissions,
    UserRef,
    AssignmentStatus,
    CourseContentType,
    CourseStatus,
    TargetType,
    QuizResult,
} from "./types";

// Generate unique ID
function generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Sample Courses
const SAMPLE_COURSES: Course[] = [
    {
        id: "course_1",
        title: "İş Güvenliği Temel Eğitimi",
        description: "Tüm çalışanlar için zorunlu iş güvenliği eğitimi. Yangın, ilk yardım ve acil durum prosedürleri.",
        tags: ["iş güvenliği", "zorunlu", "temel"],
        contentType: "VIDEO",
        contentUrl: "https://example.com/is-guvenligi-video",
        estimatedMinutes: 45,
        hasQuiz: true,
        passingScore: 70,
        status: "PUBLISHED",
        isMandatory: true,
        createdBy: { id: "usr_1", name: "Sistem" },
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: "course_2",
        title: "Hijyen ve Gıda Güvenliği",
        description: "Mutfak ve servis personeli için hijyen kuralları ve gıda güvenliği standartları.",
        tags: ["hijyen", "gıda", "mutfak"],
        contentType: "PDF",
        contentUrl: "https://example.com/hijyen-kitapcik.pdf",
        estimatedMinutes: 30,
        hasQuiz: true,
        passingScore: 80,
        status: "PUBLISHED",
        isMandatory: true,
        createdBy: { id: "usr_1", name: "Sistem" },
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: "course_3",
        title: "Müşteri İlişkileri Yönetimi",
        description: "Misafir memnuniyeti, şikayet yönetimi ve iletişim becerileri.",
        tags: ["müşteri", "iletişim", "servis"],
        contentType: "MIXED",
        contentUrl: "https://example.com/musteri-iliskileri",
        estimatedMinutes: 60,
        hasQuiz: false,
        passingScore: 0,
        status: "PUBLISHED",
        isMandatory: false,
        createdBy: { id: "usr_1", name: "Sistem" },
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: "course_4",
        title: "Yangın Söndürme Ekipmanları",
        description: "Yangın söndürücü kullanımı ve acil tahliye prosedürleri.",
        tags: ["yangın", "acil durum", "güvenlik"],
        contentType: "VIDEO",
        contentUrl: "https://example.com/yangin-egitimi",
        estimatedMinutes: 20,
        hasQuiz: true,
        passingScore: 75,
        status: "PUBLISHED",
        isMandatory: true,
        createdBy: { id: "usr_1", name: "Sistem" },
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
];

// Sample Quiz Questions
const SAMPLE_QUESTIONS: QuizQuestion[] = [
    // Course 1 questions
    { id: "q1_1", courseId: "course_1", type: "SINGLE_CHOICE", prompt: "Yangın çıkışları hangi renk ile işaretlenir?", options: [{ id: "a", label: "Kırmızı" }, { id: "b", label: "Yeşil" }, { id: "c", label: "Mavi" }], correctOptionIds: ["b"] },
    { id: "q1_2", courseId: "course_1", type: "TRUE_FALSE", prompt: "İş kazası durumunda ilk yapılması gereken şey amiri bilgilendirmektir.", options: [{ id: "t", label: "Doğru" }, { id: "f", label: "Yanlış" }], correctOptionIds: ["f"], explanation: "İlk önce güvenlik sağlanmalı, ardından ilk yardım uygulanmalıdır." },
    { id: "q1_3", courseId: "course_1", type: "SINGLE_CHOICE", prompt: "Acil durum numarası hangisidir?", options: [{ id: "a", label: "110" }, { id: "b", label: "112" }, { id: "c", label: "155" }], correctOptionIds: ["b"] },
    // Course 2 questions
    { id: "q2_1", courseId: "course_2", type: "SINGLE_CHOICE", prompt: "El yıkama süresi en az kaç saniye olmalıdır?", options: [{ id: "a", label: "10 saniye" }, { id: "b", label: "20 saniye" }, { id: "c", label: "5 saniye" }], correctOptionIds: ["b"] },
    { id: "q2_2", courseId: "course_2", type: "MULTI_CHOICE", prompt: "Hangisi çapraz bulaşmaya neden olabilir?", options: [{ id: "a", label: "Aynı kesme tahtasını kullanmak" }, { id: "b", label: "Eldiven değiştirmemek" }, { id: "c", label: "Elleri yıkamak" }], correctOptionIds: ["a", "b"] },
    // Course 4 questions
    { id: "q4_1", courseId: "course_4", type: "SINGLE_CHOICE", prompt: "ABC tipi yangın söndürücü hangi yangınlarda kullanılır?", options: [{ id: "a", label: "Sadece elektrik" }, { id: "b", label: "Katı, sıvı ve gaz" }, { id: "c", label: "Sadece mutfak" }], correctOptionIds: ["b"] },
];

// Sample Progress (for current user)
const SAMPLE_PROGRESS: LearnerProgress[] = [
    { id: "prog_1", courseId: "course_1", personId: "usr_current", status: "IN_PROGRESS", progressPct: 60, startedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), quizAttemptCount: 0, dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], isMandatory: true },
    { id: "prog_2", courseId: "course_2", personId: "usr_current", status: "ASSIGNED", progressPct: 0, quizAttemptCount: 0, dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], isMandatory: true },
    { id: "prog_3", courseId: "course_4", personId: "usr_current", status: "COMPLETED", progressPct: 100, startedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), quizAttemptCount: 1, lastQuizScore: 85, isMandatory: true },
    { id: "prog_4", courseId: "course_3", personId: "usr_current", status: "ASSIGNED", progressPct: 0, quizAttemptCount: 0, isMandatory: false },
];

// In-memory store
interface TrainingStore {
    courses: Course[];
    questions: QuizQuestion[];
    assignments: CourseAssignment[];
    progress: LearnerProgress[];
}

declare global {
    // biome-ignore lint/style/noVar: required for global augmentation
    var __trainingStore: TrainingStore | undefined;
}

function getStore(): TrainingStore {
    if (!globalThis.__trainingStore) {
        globalThis.__trainingStore = {
            courses: [...SAMPLE_COURSES],
            questions: [...SAMPLE_QUESTIONS],
            assignments: [],
            progress: [...SAMPLE_PROGRESS],
        };
    }
    return globalThis.__trainingStore;
}

// === COURSE FUNCTIONS ===

export function getAllCourses(status?: CourseStatus): Course[] {
    let courses = getStore().courses;
    if (status) {
        courses = courses.filter((c) => c.status === status);
    }
    return courses;
}

export function getCourseById(id: string): Course | null {
    return getStore().courses.find((c) => c.id === id) || null;
}

export function getCourseSummary(id: string): CourseSummary | null {
    const course = getCourseById(id);
    if (!course) return null;
    return {
        id: course.id,
        title: course.title,
        description: course.description,
        contentType: course.contentType,
        estimatedMinutes: course.estimatedMinutes,
        hasQuiz: course.hasQuiz,
        isMandatory: course.isMandatory,
    };
}

export function createCourse(data: {
    title: string;
    description?: string;
    tags?: string[];
    contentType: CourseContentType;
    contentUrl?: string;
    estimatedMinutes: number;
    hasQuiz?: boolean;
    passingScore?: number;
    isMandatory?: boolean;
}, createdBy: UserRef): Course {
    const store = getStore();
    const now = new Date().toISOString();

    const course: Course = {
        id: generateId("course"),
        title: data.title,
        description: data.description,
        tags: data.tags || [],
        contentType: data.contentType,
        contentUrl: data.contentUrl,
        estimatedMinutes: data.estimatedMinutes,
        hasQuiz: data.hasQuiz || false,
        passingScore: data.passingScore || 70,
        status: "PUBLISHED",
        isMandatory: data.isMandatory || false,
        createdBy,
        createdAt: now,
        updatedAt: now,
    };

    store.courses.push(course);
    return course;
}

export function updateCourse(id: string, updates: Partial<Course>): Course | null {
    const store = getStore();
    const index = store.courses.findIndex((c) => c.id === id);
    if (index === -1) return null;

    store.courses[index] = {
        ...store.courses[index],
        ...updates,
        updatedAt: new Date().toISOString(),
    };

    return store.courses[index];
}

// === PROGRESS FUNCTIONS ===

export function getProgressByPerson(personId: string): LearnerProgress[] {
    const store = getStore();
    return store.progress
        .filter((p) => p.personId === personId)
        .map((p) => ({
            ...p,
            course: getCourseSummary(p.courseId) || undefined,
        }));
}

export function getProgressByCourse(courseId: string): LearnerProgress[] {
    return getStore().progress.filter((p) => p.courseId === courseId);
}

export function getProgress(courseId: string, personId: string): LearnerProgress | null {
    return getStore().progress.find((p) => p.courseId === courseId && p.personId === personId) || null;
}

export function startProgress(courseId: string, personId: string): LearnerProgress {
    const store = getStore();
    let progress = getProgress(courseId, personId);

    if (progress) {
        // Update existing
        progress.status = "IN_PROGRESS";
        progress.startedAt = progress.startedAt || new Date().toISOString();
        progress.lastSeenAt = new Date().toISOString();
    } else {
        // Create new
        const course = getCourseById(courseId);
        progress = {
            id: generateId("prog"),
            courseId,
            personId,
            status: "IN_PROGRESS",
            progressPct: 0,
            startedAt: new Date().toISOString(),
            lastSeenAt: new Date().toISOString(),
            quizAttemptCount: 0,
            isMandatory: course?.isMandatory || false,
        };
        store.progress.push(progress);
    }

    return progress;
}

export function updateProgress(courseId: string, personId: string, progressPct: number): LearnerProgress | null {
    const progress = getProgress(courseId, personId);
    if (!progress) return null;

    progress.progressPct = Math.min(100, Math.max(0, progressPct));
    progress.lastSeenAt = new Date().toISOString();

    return progress;
}

export function completeProgress(courseId: string, personId: string, passed: boolean): LearnerProgress | null {
    const progress = getProgress(courseId, personId);
    if (!progress) return null;

    progress.status = passed ? "COMPLETED" : "FAILED";
    progress.progressPct = 100;
    progress.completedAt = new Date().toISOString();

    return progress;
}

// === QUIZ FUNCTIONS ===

export function getQuizQuestions(courseId: string): QuizQuestion[] {
    return getStore().questions.filter((q) => q.courseId === courseId);
}

export function getQuizQuestionsForClient(courseId: string): Array<Omit<QuizQuestion, "correctOptionIds" | "explanation">> {
    return getQuizQuestions(courseId).map(({ correctOptionIds, explanation, ...q }) => q);
}

export function submitQuiz(courseId: string, personId: string, answers: { questionId: string; selectedOptionIds: string[] }[]): QuizResult {
    const questions = getQuizQuestions(courseId);
    const course = getCourseById(courseId);
    const progress = getProgress(courseId, personId);

    if (!course || !progress) {
        return { score: 0, passed: false, totalQuestions: 0, correctCount: 0 };
    }

    let correctCount = 0;
    for (const answer of answers) {
        const question = questions.find((q) => q.id === answer.questionId);
        if (!question) continue;

        // Check if all correct options are selected and no incorrect ones
        const isCorrect =
            question.correctOptionIds.length === answer.selectedOptionIds.length &&
            question.correctOptionIds.every((id) => answer.selectedOptionIds.includes(id));

        if (isCorrect) correctCount++;
    }

    const score = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;
    const passed = score >= course.passingScore;

    // Update progress
    progress.quizAttemptCount++;
    progress.lastQuizScore = score;
    if (passed) {
        progress.status = "COMPLETED";
        progress.completedAt = new Date().toISOString();
        progress.progressPct = 100;
    }

    return { score, passed, totalQuestions: questions.length, correctCount };
}

// === ASSIGNMENT FUNCTIONS ===

export function createAssignment(data: {
    courseId: string;
    targetType: TargetType;
    targetUnitId?: string;
    targetRole?: string;
    targetPersonIds?: string[];
    dueDate?: string;
    isMandatory?: boolean;
    note?: string;
}, createdBy: UserRef): CourseAssignment {
    const store = getStore();

    const assignment: CourseAssignment = {
        id: generateId("assign"),
        courseId: data.courseId,
        targetType: data.targetType,
        targetUnitId: data.targetUnitId,
        targetRole: data.targetRole,
        targetPersonIds: data.targetPersonIds,
        dueDate: data.dueDate,
        isMandatory: data.isMandatory ?? true,
        note: data.note,
        createdBy,
        createdAt: new Date().toISOString(),
    };

    store.assignments.push(assignment);

    // Create progress records for target persons
    // In real implementation, this would query actual users
    const targetPersons = data.targetPersonIds || ["usr_current"]; // Mock
    for (const personId of targetPersons) {
        if (!getProgress(data.courseId, personId)) {
            store.progress.push({
                id: generateId("prog"),
                courseId: data.courseId,
                personId,
                assignmentId: assignment.id,
                status: "ASSIGNED",
                progressPct: 0,
                quizAttemptCount: 0,
                dueDate: data.dueDate,
                isMandatory: data.isMandatory ?? true,
            });
        }
    }

    return assignment;
}

// === KPI ===

export function getTrainingKpi(personId: string): TrainingKpi {
    const progress = getProgressByPerson(personId);

    const mandatoryActive = progress.filter((p) => p.isMandatory && p.status !== "COMPLETED").length;
    const pending = progress.filter((p) => p.status === "ASSIGNED" || p.status === "IN_PROGRESS").length;
    const completed = progress.filter((p) => p.status === "COMPLETED").length;
    const total = progress.length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const risky = progress.filter((p) => p.status === "FAILED" || p.status === "EXPIRED").length;

    return { mandatoryActive, pending, completionRate, risky };
}

// === OVERVIEW ===

export function getTrainingOverview(personId: string, userRole: string): TrainingOverviewPayload {
    const kpi = getTrainingKpi(personId);
    const myAssignments = getProgressByPerson(personId);
    const catalog = getAllCourses("PUBLISHED");

    const permissions: TrainingPermissions = {
        canCreateCourse: userRole === "PRESIDENT",
        canAssign: userRole === "PRESIDENT" || userRole === "UNIT_MANAGER",
        canViewAllUnits: userRole === "PRESIDENT",
        canReport: userRole === "PRESIDENT" || userRole === "UNIT_MANAGER",
    };

    return { kpi, myAssignments, catalog, permissions };
}
