// Training / LMS Zod Schemas
import { z } from "zod";

// Enums
export const CourseContentTypeSchema = z.enum(["VIDEO", "PDF", "LINK", "MIXED"]);
export const CourseStatusSchema = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);
export const AssignmentStatusSchema = z.enum(["ASSIGNED", "IN_PROGRESS", "COMPLETED", "FAILED", "EXPIRED"]);
export const QuestionTypeSchema = z.enum(["SINGLE_CHOICE", "MULTI_CHOICE", "TRUE_FALSE"]);
export const TargetTypeSchema = z.enum(["ALL", "UNIT", "ROLE", "PERSON"]);

// Create Course
export const CreateCourseSchema = z.object({
    title: z.string().min(3, "Başlık en az 3 karakter"),
    description: z.string().optional(),
    tags: z.array(z.string()).default([]),
    contentType: CourseContentTypeSchema,
    contentUrl: z.string().url("Geçerli URL giriniz").optional().or(z.literal("")),
    estimatedMinutes: z.number().min(1, "En az 1 dakika"),
    hasQuiz: z.boolean().default(false),
    passingScore: z.number().min(0).max(100).default(70),
    isMandatory: z.boolean().default(false),
});

// Update Course
export const UpdateCourseSchema = z.object({
    title: z.string().min(3).optional(),
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
    contentType: CourseContentTypeSchema.optional(),
    contentUrl: z.string().url().optional().or(z.literal("")),
    estimatedMinutes: z.number().min(1).optional(),
    hasQuiz: z.boolean().optional(),
    passingScore: z.number().min(0).max(100).optional(),
    isMandatory: z.boolean().optional(),
    status: CourseStatusSchema.optional(),
});

// Assign Course
export const AssignCourseSchema = z.object({
    courseId: z.string().min(1),
    targetType: TargetTypeSchema,
    targetUnitId: z.string().optional(),
    targetRole: z.string().optional(),
    targetPersonIds: z.array(z.string()).optional(),
    dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    isMandatory: z.boolean().default(true),
    note: z.string().optional(),
}).refine((data) => {
    // Validate target based on type
    if (data.targetType === "UNIT" && !data.targetUnitId) return false;
    if (data.targetType === "ROLE" && !data.targetRole) return false;
    if (data.targetType === "PERSON" && (!data.targetPersonIds || data.targetPersonIds.length === 0)) return false;
    return true;
}, { message: "Hedef bilgisi eksik" });

// Progress Update
export const ProgressCheckpointSchema = z.object({
    progressPct: z.number().min(0).max(100),
    lessonId: z.string().optional(),
});

// Quiz Submit
export const QuizSubmitSchema = z.object({
    answers: z.array(z.object({
        questionId: z.string(),
        selectedOptionIds: z.array(z.string()),
    })),
});

// Type exports
export type CreateCourseInput = z.infer<typeof CreateCourseSchema>;
export type UpdateCourseInput = z.infer<typeof UpdateCourseSchema>;
export type AssignCourseInput = z.infer<typeof AssignCourseSchema>;
export type ProgressCheckpointInput = z.infer<typeof ProgressCheckpointSchema>;
export type QuizSubmitInput = z.infer<typeof QuizSubmitSchema>;
