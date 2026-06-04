import { z } from "zod";

export const checkoutTicketSchema = z.object({
  ticketId: z.number().int().positive(),
  quantity: z.number().int().min(1).max(50).default(1),
  buyerPhone: z.string().optional(),
});

export const reserveFreeTicketSchema = checkoutTicketSchema;

export type CheckoutTicketInput = z.infer<typeof checkoutTicketSchema>;
