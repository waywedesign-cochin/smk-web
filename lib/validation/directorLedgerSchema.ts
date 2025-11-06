import { z } from "zod";

export const directorLedgerEntrySchema = z
  .object({
    id: z.string().optional(),
    transactionDate: z.coerce
      .date()
      .min(new Date("2000-01-01"), "Date must be valid"),
    amount: z.coerce.number().positive("Amount must be greater than 0"),
    transactionType: z.enum([
      "STUDENT_PAID",
      "OTHER_EXPENSE",
      "INSTITUTION_GAVE_BANK",
      "OWNER_TAKEN",
    ]),
    description: z.string().min(3, "Description must be at least 3 characters"),
    referenceId: z.string().optional(),
    studentId: z.string().optional(),
    locationId: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.transactionType === "STUDENT_PAID") {
        return data.studentId && data.studentId.length > 0;
      }
      return true;
    },
    {
      message: "Student is required for Student Paid transactions",
      path: ["studentId"],
    }
  );

export type DirectorLedgerEntryFormData = z.infer<
  typeof directorLedgerEntrySchema
>;
