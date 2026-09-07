-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'singleton',
    "name" TEXT NOT NULL DEFAULT '',
    "tagline" TEXT NOT NULL DEFAULT '',
    "bio" TEXT NOT NULL DEFAULT '',
    "hobbies" TEXT NOT NULL DEFAULT '',
    "avatarUrl" TEXT,
    "updatedAt" DATETIME NOT NULL
);
