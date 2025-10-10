import { z } from "zod";

export const FeeSchema = z.object({
  discountAmount: z.number().min(0, "Discount cannot be negative").optional(),
  feePaymentMode: z.enum(["fullPayment", "weekly", "70/30"], {
    message: "Please select a valid fee payment mode",
  }),
});

export type FeeInput = z.infer<typeof FeeSchema>;
