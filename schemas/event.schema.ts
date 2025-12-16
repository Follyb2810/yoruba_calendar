import { z } from "zod";

export const stepOneSchema = z.object({
  name: z.string().min(3, "Event name must be at least 3 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  // orishaId: z.number({ error: "Please select an Orisa" }),
  orishaId: z
    .number()
    .optional()
    .refine((val) => val !== undefined && val > 0, {
      message: "Orisa is required",
    }),
});

export const stepTwoSchema = z
  .object({
    country: z.string().min(1, "Country is required"),
    eventType: z.enum(["physical", "virtual"]),
    location: z.string().optional(),
    eventLink: z.string().optional(),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    startTime: z.string().min(1, "Start time is required"),
    endTime: z.string().min(1, "End time is required"),
  })
  .refine((data) => (data.eventType === "physical" ? !!data.location : true), {
    message: "Location is required for physical events",
    path: ["location"],
  })
  .refine((data) => (data.eventType === "virtual" ? !!data.eventLink : true), {
    message: "Event link is required for virtual events",
    path: ["eventLink"],
  })
  .refine(
    (data) =>
      data.eventType === "virtual"
        ? data.eventLink === "" || /^https?:\/\//.test(data.eventLink!)
        : true,
    {
      message: "Invalid URL format",
      path: ["eventLink"],
    }
  );

export const stepThreeSchema = z.object({
  ticketType: z.enum(["free", "single", "group"]),
});
