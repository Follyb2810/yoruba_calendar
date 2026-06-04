import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../generated/prisma/client";
// import { PrismaPg } from "@prisma/adapter-pg";

export const prismaClientSingleton = () => {
  const connectionString =
    process.env.DATABASE_URL ?? "file:./dev.db";

  // Local SQLite (default for development)
  const adapter = new PrismaBetterSqlite3({ url: connectionString });
  return new PrismaClient({ adapter });

  // PostgreSQL (production) — uncomment and comment out SQLite above:
  // const adapter = new PrismaPg({ connectionString });
  // return new PrismaClient({ adapter });
};

declare global {
  var prismaGlobal: ReturnType<typeof prismaClientSingleton> | undefined;
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;

export { prisma };
