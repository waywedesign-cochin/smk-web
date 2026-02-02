import { z } from "zod";

export const StudentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(10, "Phone must be at least 10 digits"),
  address: z.string().optional(),
  currentBatchId: z.string().min(1, "Please select a batch"),
  salesperson: z.string().optional(),
  isFundedAccount: z.boolean().default(false),
  admissionNo: z.string().min(1, "Admission No is required"),
  referralInfo: z.string().optional(),
  status: z.string().min(1, "Status is required"),
});

export type StudentInput = z.infer<typeof StudentSchema>;
