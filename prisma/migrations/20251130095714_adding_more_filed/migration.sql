/*
  Warnings:

  - Added the required column `endYear` to the `Festival` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startYear` to the `Festival` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Festival" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "startYear" INTEGER NOT NULL,
    "startMonth" INTEGER NOT NULL,
    "startDay" INTEGER NOT NULL,
    "endYear" INTEGER NOT NULL,
    "endMonth" INTEGER NOT NULL,
    "endDay" INTEGER NOT NULL,
    "orisaId" INTEGER NOT NULL,
    CONSTRAINT "Festival_orisaId_fkey" FOREIGN KEY ("orisaId") REFERENCES "Orisa" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Festival" ("endDay", "endMonth", "id", "orisaId", "startDay", "startMonth", "title") SELECT "endDay", "endMonth", "id", "orisaId", "startDay", "startMonth", "title" FROM "Festival";
DROP TABLE "Festival";
ALTER TABLE "new_Festival" RENAME TO "Festival";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
