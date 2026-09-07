-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Profile" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'singleton',
    "name" TEXT NOT NULL DEFAULT '',
    "tagline" TEXT NOT NULL DEFAULT '',
    "bio" TEXT NOT NULL DEFAULT '',
    "hobbies" TEXT NOT NULL DEFAULT '',
    "avatarUrl" TEXT,
    "musicTitle" TEXT NOT NULL DEFAULT '',
    "musicArtist" TEXT NOT NULL DEFAULT '',
    "musicUrl" TEXT,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Profile" ("avatarUrl", "bio", "hobbies", "id", "name", "tagline", "updatedAt") SELECT "avatarUrl", "bio", "hobbies", "id", "name", "tagline", "updatedAt" FROM "Profile";
DROP TABLE "Profile";
ALTER TABLE "new_Profile" RENAME TO "Profile";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
