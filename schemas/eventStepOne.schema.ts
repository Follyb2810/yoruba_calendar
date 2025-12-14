import { z } from "zod";

export const stepOneSchema = z.object({
  name: z.string().min(3, "Event name must be at least 3 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  orishaId: z.number({
    error: "Please select an Orisa",
  }),
});
