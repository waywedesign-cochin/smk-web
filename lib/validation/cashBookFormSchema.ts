import { z } from "zod";

export const cashBookFormSchema = z
  .object({
    transactionDate: z.preprocess(
      (val) => (val ? new Date(val as string) : undefined),
      z.date().refine((date) => !isNaN(date.getTime()), {
        message: "Transaction date is required or invalid",
      })
    ),
    transactionType: z
      .enum(["STUDENT_PAID", "OFFICE_EXPENSE", "OWNER_TAKEN"])
      .refine((val) => val !== undefined, {
        message: "Transaction type is required",
      }),
    description: z
      .string()
      .min(1, "Description is required")
      .max(500, "Description is too long"),
    amount: z.coerce
      .number()
      .positive({ message: "Amount must be greater than 0" })
      .refine((val) => !isNaN(val), {
        message: "Amount must be a valid number",
      }),
    locationId: z.string().min(1, "Location ID is required"),
    referenceId: z.string().optional(),
    studentId: z.string().optional(),
    directorId: z.string().optional(),
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
  )
  .refine(
    (data) => {
      if (data.transactionType === "OWNER_TAKEN") {
        return data.directorId && data.directorId.length > 0;
      }
      return true;
    },
    {
      message: "Director is required for Director Paid transactions",
      path: ["directorId"],
    }
  );

export type CashBookFormSchema = z.infer<typeof cashBookFormSchema>;
