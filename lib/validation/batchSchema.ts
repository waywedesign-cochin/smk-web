import { z } from "zod";

export const batchSchema = z.object({
  name: z.string().min(2, "Batch name is required"),
  year: z.number().min(2000, "Invalid year").max(2100, "Invalid year"),
  courseId: z.string().nonempty("Course is required"),
  locationId: z.string().nonempty("Location is required"),
  tutor: z.string().min(2, "Tutor name is required"),
  coordinator: z.string().min(2, "Coordinator name is required"),
  slotLimit: z
    .number()
    .min(1, "Must be at least 1")
    .max(100, "Max 100 students"),
  mode: z.enum(["ONLINE", "OFFLINE", "HYBRID"]),
  status: z.enum(["ACTIVE", "INACTIVE"]),
  description: z.string().optional(),
});

export type BatchFormValues = z.infer<typeof batchSchema>;
