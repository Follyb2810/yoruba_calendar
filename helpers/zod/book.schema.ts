import { z } from "zod";

export const createBookSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(20),
  author: z.string().min(2),
  price: z.number().positive("Price must be greater than 0"),
  currency: z.string().default("NGN"),
  coverImage: z.string().url().optional().or(z.literal("")),
  stock: z.number().int().min(0).default(0),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
});

export type CreateBookInput = z.infer<typeof createBookSchema>;
