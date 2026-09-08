-- CreateTable
CREATE TABLE "DesktopItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "kind" TEXT NOT NULL,
    "imageUrl" TEXT,
    "label" TEXT NOT NULL DEFAULT '',
    "x" REAL NOT NULL,
    "y" REAL NOT NULL,
    "rotate" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
