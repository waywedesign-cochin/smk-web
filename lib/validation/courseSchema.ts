// lib/validation/courseSchema.ts
import { z } from "zod";

export const courseSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Course name is required"),
  description: z.string().min(1, "Description is required"),
  baseFee: z.number().min(1, "Base Fee is required"),
  duration: z.string().min(1, "Duration is required"),
  isActive: z.boolean(),
});

export type CourseFormValues = z.infer<typeof courseSchema>;
