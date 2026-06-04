import { z } from "zod";

export const payoutAccountSchema = z.object({
  bankCode: z.string().min(2, "Select a bank"),
  accountNumber: z
    .string()
    .regex(/^\d{10}$/, "Account number must be 10 digits"),
  accountName: z.string().min(2, "Account name is required"),
});

export const feedbackSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

export type PayoutAccountInput = z.infer<typeof payoutAccountSchema>;
export type FeedbackInput = z.infer<typeof feedbackSchema>;
