// Training / LMS Types

// Enums
export type CourseContentType = "VIDEO" | "PDF" | "LINK" | "MIXED";
export type CourseStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type AssignmentStatus = "ASSIGNED" | "IN_PROGRESS" | "COMPLETED" | "FAILED" | "EXPIRED";
export type QuestionType = "SINGLE_CHOICE" | "MULTI_CHOICE" | "TRUE_FALSE";
export type TargetType = "ALL" | "UNIT" | "ROLE" | "PERSON";

// Labels
export const CONTENT_TYPE_LABELS: Record<CourseContentType, string> = {
    VIDEO: "Video",
    PDF: "PDF",
    LINK: "Link",
    MIXED: "Karma",
};

export const CONTENT_TYPE_ICONS: Record<CourseContentType, string> = {
    VIDEO: "🎬",
    PDF: "📄",
    LINK: "🔗",
    MIXED: "📚",
};

export const STATUS_LABELS: Record<AssignmentStatus, string> = {
    ASSIGNED: "Atandı",
    IN_PROGRESS: "Devam Ediyor",
    COMPLETED: "Tamamlandı",
    FAILED: "Başarısız",
    EXPIRED: "Süresi Doldu",
};

export const STATUS_COLORS: Record<AssignmentStatus, string> = {
    ASSIGNED: "bg-blue-100 text-blue-700",
    IN_PROGRESS: "bg-amber-100 text-amber-700",
    COMPLETED: "bg-green-100 text-green-700",
    FAILED: "bg-red-100 text-red-700",
    EXPIRED: "bg-slate-100 text-slate-600",
};

export const COURSE_STATUS_LABELS: Record<CourseStatus, string> = {
    DRAFT: "Taslak",
    PUBLISHED: "Yayında",
    ARCHIVED: "Arşiv",
};

// User reference
export interface UserRef {
    id: string;
    name: string;
}

// Course
export interface Course {
    id: string;
    title: string;
    description?: string;
    tags: string[];
    contentType: CourseContentType;
    contentUrl?: string;
    estimatedMinutes: number;
    hasQuiz: boolean;
    passingScore: number; // 0-100
    status: CourseStatus;
    isMandatory: boolean;
    createdBy: UserRef;
    createdAt: string;
    updatedAt: string;
}

// Course summary for lists
export interface CourseSummary {
    id: string;
    title: string;
    description?: string;
    contentType: CourseContentType;
    estimatedMinutes: number;
    hasQuiz: boolean;
    isMandatory: boolean;
}

// Lesson (optional module within course)
export interface Lesson {
    id: string;
    courseId: string;
    title: string;
    contentUrl?: string;
    order: number;
    required: boolean;
}

// Quiz Question
export interface QuizOption {
    id: string;
    label: string;
}

export interface QuizQuestion {
    id: string;
    courseId: string;
    type: QuestionType;
    prompt: string;
    options: QuizOption[];
    correctOptionIds: string[]; // server-side only
    explanation?: string;
}

// Quiz Question (client-safe, no answers)
export interface QuizQuestionClient {
    id: string;
    type: QuestionType;
    prompt: string;
    options: QuizOption[];
}

// Course Assignment (bulk assignment record)
export interface CourseAssignment {
    id: string;
    courseId: string;
    targetType: TargetType;
    targetUnitId?: string;
    targetRole?: string;
    targetPersonIds?: string[];
    dueDate?: string; // YYYY-MM-DD
    isMandatory: boolean;
    note?: string;
    createdBy: UserRef;
    createdAt: string;
}

// Learner Progress
export interface LearnerProgress {
    id: string;
    courseId: string;
    personId: string;
    assignmentId?: string;
    status: AssignmentStatus;
    progressPct: number; // 0-100
    startedAt?: string;
    completedAt?: string;
    lastSeenAt?: string;
    quizAttemptCount: number;
    lastQuizScore?: number; // 0-100
    dueDate?: string;
    isMandatory: boolean;
    course?: CourseSummary;
}

// KPI Stats
export interface TrainingKpi {
    mandatoryActive: number;
    pending: number;
    completionRate: number; // 0-100
    risky: number; // failed + expired
}

// Permissions
export interface TrainingPermissions {
    canCreateCourse: boolean;
    canAssign: boolean;
    canViewAllUnits: boolean;
    canReport: boolean;
}

// Overview payload
export interface TrainingOverviewPayload {
    kpi: TrainingKpi;
    myAssignments: LearnerProgress[];
    catalog: Course[];
    permissions: TrainingPermissions;
}

// API Payloads
export interface CreateCoursePayload {
    title: string;
    description?: string;
    tags?: string[];
    contentType: CourseContentType;
    contentUrl?: string;
    estimatedMinutes: number;
    hasQuiz?: boolean;
    passingScore?: number;
    isMandatory?: boolean;
}

export interface AssignCoursePayload {
    courseId: string;
    targetType: TargetType;
    targetUnitId?: string;
    targetRole?: string;
    targetPersonIds?: string[];
    dueDate?: string;
    isMandatory?: boolean;
    note?: string;
}

export interface QuizSubmitPayload {
    answers: {
        questionId: string;
        selectedOptionIds: string[];
    }[];
}

export interface QuizResult {
    score: number;
    passed: boolean;
    totalQuestions: number;
    correctCount: number;
}
