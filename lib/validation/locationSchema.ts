import z from "zod";

// ✅ Validation schema
export const locationSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Location name is required"),
  address: z.string().optional(),
});

export type LocationFormData = z.infer<typeof locationSchema>;
