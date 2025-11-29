-- CreateTable
CREATE TABLE "Orisa" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Festival" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "startMonth" INTEGER NOT NULL,
    "startDay" INTEGER NOT NULL,
    "endMonth" INTEGER NOT NULL,
    "endDay" INTEGER NOT NULL,
    "orisaId" INTEGER NOT NULL,
    CONSTRAINT "Festival_orisaId_fkey" FOREIGN KEY ("orisaId") REFERENCES "Orisa" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
