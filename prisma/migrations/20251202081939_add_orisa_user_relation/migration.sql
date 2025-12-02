-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Orisa" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "userId" TEXT,
    CONSTRAINT "Orisa_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Orisa" ("id", "name") SELECT "id", "name" FROM "Orisa";
DROP TABLE "Orisa";
ALTER TABLE "new_Orisa" RENAME TO "Orisa";
CREATE UNIQUE INDEX "Orisa_name_key" ON "Orisa"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
