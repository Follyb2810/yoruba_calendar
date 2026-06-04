import { z } from "zod";

const ticketInputSchema = z.object({
  name: z.string().min(1, "Ticket name is required"),
  type: z.enum(["single", "group"]),
  isFree: z.boolean(),
  price: z.number().min(0).optional(),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  maxPerGroup: z.number().int().min(1).optional(),
});

export const createFestivalSchema = z
  .object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z
      .string()
      .min(20, "Description must be at least 20 characters"),
    orisaId: z.number().int().positive("Orisa is required"),
    country: z.string().min(1, "Country is required"),
    eventType: z.enum(["physical", "virtual"]),
    location: z.string().optional(),
    eventLink: z.string().optional(),
    timezone: z.string().min(1),
    startDate: z.string().min(1, "Start date is required"),
    startTime: z.string().optional(),
    endDate: z.string().min(1, "End date is required"),
    endTime: z.string().optional(),
    ticketType: z.enum(["single", "group"]),
    status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
    tickets: z.array(ticketInputSchema).optional(),
    image: z.string().url().optional().or(z.literal("")),
    banner: z.string().url().optional().or(z.literal("")),
  })
  .refine(
    (data) => (data.eventType === "physical" ? !!data.location : true),
    { message: "Location is required for physical events", path: ["location"] }
  )
  .refine(
    (data) =>
      data.eventType === "virtual"
        ? !!data.eventLink && /^https?:\/\//.test(data.eventLink)
        : true,
    { message: "Valid event link is required for virtual events", path: ["eventLink"] }
  );

export const updateFestivalSchema = createFestivalSchema.partial();

export type CreateFestivalInput = z.infer<typeof createFestivalSchema>;
