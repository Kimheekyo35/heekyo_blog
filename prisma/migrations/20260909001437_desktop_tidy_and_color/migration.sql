-- CreateTable
CREATE TABLE "DesktopSetting" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'singleton',
    "folderColor" TEXT NOT NULL DEFAULT 'blue',
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_DesktopSpot" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "x" REAL NOT NULL,
    "y" REAL NOT NULL,
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_DesktopSpot" ("key", "updatedAt", "x", "y") SELECT "key", "updatedAt", "x", "y" FROM "DesktopSpot";
DROP TABLE "DesktopSpot";
ALTER TABLE "new_DesktopSpot" RENAME TO "DesktopSpot";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
