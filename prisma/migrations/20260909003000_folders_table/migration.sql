PRAGMA foreign_keys=off;
DROP TABLE "DesktopSetting";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Folder" (
    "slug" TEXT NOT NULL PRIMARY KEY,
    "label" TEXT NOT NULL,
    "tagline" TEXT NOT NULL DEFAULT '',
    "color" TEXT NOT NULL DEFAULT 'blue',
    "sort" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

