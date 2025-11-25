import { z } from "zod";

export const PaymentSchema = z.object({
  amount: z.number().min(1, "Amount must be greater than 0"),
  mode: z.string().optional(),
  isAdvance: z.boolean(),
  paidAt: z.preprocess(
    (val) => (val ? new Date(val as string) : null),
    z.date().refine((date) => date !== null, {
      message: "Paid date is required",
    })
  ),

  dueDate: z.date().nullable().optional(),
  transactionId: z.string().optional(),
  note: z.string().optional(),
  feeId: z.string().nonempty("Fee ID is required"),
  bankAccountId: z.string().optional(),
});

export const duePaymentSchema = z.object({
  amount: z.number().min(1, "Amount must be greater than 0"),
  dueDate: z.date(),
  note: z.string().optional(),
});
