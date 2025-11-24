import { z } from "zod";

export const FeeSchema = z.object({
  discountAmount: z
    .string()
    .min(0, "Discount cannot be negative")
    .transform((val) => Number(val)),

  totalCourseFee: z
    .string()
    .nonempty("Total course fee is required")
    .refine((val) => !isNaN(Number(val)), "Must be a number")
    .transform((val) => Number(val))
    .refine((num) => num > 0, "Total course fee must be greater than 0"),

  finalFee: z
    .string()
    .nonempty("Final fee is required")
    .refine((val) => !isNaN(Number(val)), "Must be a number")
    .transform((val) => Number(val))
    .refine((num) => num > 0, "Final fee must be greater than 0"),

  balanceAmount: z
    .string()
    .nonempty("Balance is required")
    .refine((val) => !isNaN(Number(val)), "Must be a number")
    .transform((val) => Number(val)),

  feePaymentMode: z.enum(["fullPayment", "weekly", "70/30", "others"], {
    message: "Please select a valid fee payment mode",
  }),

  status: z.enum(
    ["PENDING", "PAID", "CANCELLED", "REFUNDED", "INACTIVE", "ACTIVE"],
    {
      message: "Please select a valid status",
    }
  ),
});

export type FeeInput = z.infer<typeof FeeSchema>;
