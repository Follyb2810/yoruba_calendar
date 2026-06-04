import { z } from "zod";

export const grantRoleSchema = z.object({
  role: z.enum(["CREATOR", "MODERATOR", "ADMIN", "SUPERADMIN"]),
});

export type GrantRoleInput = z.infer<typeof grantRoleSchema>;
