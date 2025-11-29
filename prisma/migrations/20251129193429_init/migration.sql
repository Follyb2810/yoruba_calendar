/*
  Warnings:

  - You are about to drop the column `color` on the `Orisa` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Orisa" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);
INSERT INTO "new_Orisa" ("id", "name") SELECT "id", "name" FROM "Orisa";
DROP TABLE "Orisa";
ALTER TABLE "new_Orisa" RENAME TO "Orisa";
CREATE UNIQUE INDEX "Orisa_name_key" ON "Orisa"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
