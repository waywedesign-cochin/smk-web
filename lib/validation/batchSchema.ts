import { z } from "zod";

export const batchSchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .min(2, "Batch name is required")
    .max(100, "Batch name must be less than 100 characters"),

  year: z
    .number()
    .int("Year must be an integer")
    .min(2000, "Year must be >= 2000")
    .max(2100, "Year must be <= 2100"),

  startDate: z
    .string()
    .min(1, "Start date is required")
    .refine((date) => !isNaN(Date.parse(date)), "Invalid date format"),

  courseId: z.string().min(1, "Course is required"),
  locationId: z.string().min(1, "Location is required"),

  tutor: z.string().min(2, "Tutor name is required").max(100),
  coordinator: z.string().min(2, "Coordinator name is required").max(100),

  slotLimit: z
    .number()
    .int("Capacity must be an integer")
    .min(1, "Capacity must be at least 1")
    .max(100, "Capacity cannot exceed 100"),

  currentCount: z
    .number()
    .int("Current count must be an integer")
    .min(0, "Current count cannot be negative")
    .optional(),

  mode: z.enum(["ONLINE", "OFFLINE", "HYBRID"], {
    message: "Delivery mode is required",
  }),

  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional()
    .or(z.literal("")),

  status: z.enum(["ACTIVE", "INACTIVE", "PENDING", "COMPLETED", "CANCELLED"], {
    message: "Status is required",
  }),
});

export type BatchMode = "ONLINE" | "OFFLINE";
export type BatchStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "PENDING"
  | "COMPLETED"
  | "CANCELLED";
export type BatchFormValues = z.infer<typeof batchSchema>;
