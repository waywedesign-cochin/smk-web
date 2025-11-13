import { z } from "zod";

// Convert string → number safely
const toNumber = (val: unknown) => {
  if (val === "" || val === null || val === undefined) return 0;
  const num = Number(val);
  return isNaN(num) ? 0 : num;
};

export const FeeSchema = z.object({
  discountAmount: z
    .preprocess(toNumber, z.number().min(0, "Discount cannot be negative"))
    .optional(),
  feePaymentMode: z.enum(["fullPayment", "weekly", "70/30", "others"], {
    message: "Please select a valid fee payment mode",
  }),
  totalCourseFee: z.preprocess(
    toNumber,
    z.number().min(0, "Total course fee cannot be negative")
  ),
  finalFee: z.preprocess(
    toNumber,
    z.number().min(0, "Final fee cannot be negative")
  ),
  balanceAmount: z.preprocess(
    toNumber,
    z.number().min(0, "Balance amount cannot be negative")
  ),
});

export type FeeInput = z.infer<typeof FeeSchema>;
