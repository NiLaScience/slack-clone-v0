-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Channel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "isDM" BOOLEAN NOT NULL DEFAULT false,
    "isSelfNote" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Channel" ("createdAt", "id", "isDM", "isPrivate", "isSelfNote", "name", "updatedAt") SELECT "createdAt", "id", "isDM", "isPrivate", "isSelfNote", "name", "updatedAt" FROM "Channel";
DROP TABLE "Channel";
ALTER TABLE "new_Channel" RENAME TO "Channel";
CREATE UNIQUE INDEX "Channel_isSelfNote_name_key" ON "Channel"("isSelfNote", "name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
