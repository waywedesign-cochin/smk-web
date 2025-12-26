import { z } from "zod";

// ✅ Validation schema for creating or updating a bank transaction
export const bankTransactionSchema = z.object({
  transactionDate: z.preprocess(
    (val) =>
      typeof val === "string" || val instanceof Date ? new Date(val) : val,
    z.date().refine((date) => !isNaN(date.getTime()), {
      message: "Transaction date is required and must be a valid date",
    })
  ),

  bankAccountId: z.string().min(1, "Bank account is required"),

  amount: z
    .union([z.string(), z.number()])
    .refine((val) => Number(val) > 0, "Amount must be greater than 0"),

  transactionMode: z.enum(["UPI", "BANK_TRANSFER", "CASH", "CHEQUE","RAZORPAY"], {
    message: "Transaction mode is required",
  }),

  status: z.enum(["PENDING", "COMPLETED", "FAILED"], {
    message: "Status is required",
  }),

  category: z.enum(["OTHER_INCOME", "OTHER_EXPENSE"], {
    message: "Category is required",
  }),

  transactionId: z.string().optional().or(z.literal("")),

  description: z.string().optional().or(z.literal("")),

  locationId: z.string().min(1, "Location is required"),
});
