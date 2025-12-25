import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(4),
});

export const reservationAddSchema = z.object({
  datetime: z.string().min(5),
  full_name: z.string().min(2),
  phone: z.string().min(7),
  note: z.string().optional().default(""),
});

export const recordAddSchema = z.object({
  full_name: z.string().min(2),
  phone: z.string().min(7),
  status: z.string().min(2).default("active"),
  note: z.string().optional().default(""),
});

export const recordUpdateSchema = z.object({
  record_id: z.string().min(3),
  full_name: z.string().optional(),
  phone: z.string().optional(),
  status: z.string().optional(),
  note: z.string().optional(),
});

export const recordDeleteSchema = z.object({
  record_id: z.string().min(3),
});

export const recordCheckSchema = z.object({
  phone: z.string().optional(),
  full_name: z.string().optional(),
});

export const requestAddSchema = z.object({
  subject_person_name: z.string().min(2),
  subject_phone: z.string().min(7),
  reason: z.string().min(5),
});

export const requestRespondSchema = z.object({
  request_id: z.string().min(3),
  manager_response: z.string().min(2),
  status: z.string().default("closed"),
});
