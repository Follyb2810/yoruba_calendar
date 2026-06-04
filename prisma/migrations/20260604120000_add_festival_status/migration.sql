-- CreateEnum
CREATE TYPE "FestivalStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- AlterTable
ALTER TABLE "Festival" ADD COLUMN "status" "FestivalStatus" NOT NULL DEFAULT 'PUBLISHED';

-- AlterTable
ALTER TABLE "user" ALTER COLUMN "emailVerified" DROP DEFAULT;
