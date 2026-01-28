import { z } from "zod";
import { LeaveType, DayPart } from "./types";

export const CreateLeaveRequestSchema = z.object({
    personId: z.string().optional(), // If creating for someone else (admin only)
    type: z.nativeEnum(LeaveType),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Tarih formatı geçersiz"),
    startPart: z.nativeEnum(DayPart).default(DayPart.FULL),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Tarih formatı geçersiz"),
    endPart: z.nativeEnum(DayPart).default(DayPart.FULL),
    description: z.string().min(10, "Açıklama en az 10 karakter olmalıdır"),
    attachmentUrl: z.string().optional(),
}).refine((data) => {
    return new Date(data.endDate) >= new Date(data.startDate);
}, {
    message: "Bitiş tarihi başlangıç tarihinden önce olamaz",
    path: ["endDate"],
});

export const ApproveLeaveSchema = z.object({
    note: z.string().optional(),
});

export const RejectLeaveSchema = z.object({
    reason: z.string().min(5, "Red sebebi belirtmelisiniz (min 5 karakter)"),
});

export const RequestChangesSchema = z.object({
    message: z.string().min(5, "Düzeltme talebi mesajı gereklidir"),
});

export const CancelLeaveSchema = z.object({
    reason: z.string().optional(),
});

export const AdjustBalanceSchema = z.object({
    personId: z.string().min(1, "Personel seçilmeli"),
    year: z.number().int().min(2020),
    deltaAnnualEntitled: z.number().optional(),
    reason: z.string().min(5, "Değişiklik sebebi zorunludur"),
});

export type CreateLeaveRequestInput = z.infer<typeof CreateLeaveRequestSchema>;
