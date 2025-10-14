import { z } from "zod";
import { no } from "zod/v4/locales";

export const PaymentSchema = z.object({
  amount: z.number().min(1, "Amount must be greater than 0"),
  mode: z.string().optional(),
  isAdvance: z.boolean(),
  paidAt: z.date(),
  dueDate: z.date().nullable().optional(),
  transactionId: z.string().optional(),
  note: z.string().optional(),
  feeId: z.string().nonempty("Fee ID is required"),
});

export const duePaymentSchema = z.object({
  amount: z.number().min(1, "Amount must be greater than 0"),
  dueDate: z.date(),
  note: z.string().optional(),
});
