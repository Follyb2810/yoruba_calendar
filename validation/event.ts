import { z } from "zod";

export const step1Schema = z.object({
  name: z.string().min(3),
  description: z.string().min(20),
  orisha: z.string().min(1),
});

export const step2Schema = z.object({
  country: z.string().min(1),
  eventType: z.enum(["physical", "virtual"]),
  location: z.string().optional(),
  eventLink: z.string().url().optional(),
  timezone: z.string(),
  startDate: z.date(),
  endDate: z.date(),
});

export const step3Schema = z.object({
  ticketType: z.enum(["free", "single", "group"]),
});
