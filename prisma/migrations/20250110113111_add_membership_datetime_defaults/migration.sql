-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ChannelMembership" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "channelId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChannelMembership_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ChannelMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ChannelMembership" ("channelId", "createdAt", "id", "userId") SELECT "channelId", "createdAt", "id", "userId" FROM "ChannelMembership";
DROP TABLE "ChannelMembership";
ALTER TABLE "new_ChannelMembership" RENAME TO "ChannelMembership";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
