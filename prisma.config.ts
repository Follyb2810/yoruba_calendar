import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "ts-node --project tsconfig.local.json utils/seed.ts",
  },

  datasource: {
    url: env("DATABASE_URL"),

    // PostgreSQL (production):
    // url: env("DIRECT_URL"),
  },
});
