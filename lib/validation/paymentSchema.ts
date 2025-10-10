import { z } from "zod";

export const PaymentSchema = z.object({
  amount: z.number().min(1, "Amount must be greater than 0"),
  mode: z.string().nonempty("Select a payment mode"),
  isAdvance: z.boolean(),
  paidAt: z.date().nullable(),
  transactionId: z.string().optional(),
  note: z.string().optional(),
  feeId: z.string().nonempty("Fee ID is required"),
});
