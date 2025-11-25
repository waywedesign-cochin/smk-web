// src/lib/validation/bankAccountSchema.ts

import { z } from "zod";

export const bankAccountSchema = z.object({
  accountName: z
    .string()
    .min(3, "Account name must be at least 3 characters.")
    .max(100, "Account name cannot exceed 100 characters."),
  accountNumber: z
    .string()
    .min(5, "Account number must be at least 5 digits.")
    .max(30, "Account number cannot exceed 30 characters."),
  bankName: z.string().min(3, "Bank name must be at least 3 characters."),
  ifscCode: z
    .string()
    .max(11, "IFSC code cannot exceed 11 characters.")
    .optional()
    .or(z.literal("")),
  branch: z
    .string()
    .max(100, "Branch name cannot exceed 100 characters.")
    .optional()
    .or(z.literal("")),
});

export type BankAccountFormData = z.infer<typeof bankAccountSchema>;
