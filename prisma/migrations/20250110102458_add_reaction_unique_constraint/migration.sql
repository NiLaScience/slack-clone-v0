/*
  Warnings:

  - A unique constraint covering the columns `[userId,messageId,emoji]` on the table `Reaction` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Reaction_userId_messageId_emoji_key" ON "Reaction"("userId", "messageId", "emoji");
