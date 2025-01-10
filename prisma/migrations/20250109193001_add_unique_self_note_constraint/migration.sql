/*
  Warnings:

  - A unique constraint covering the columns `[isSelfNote,name]` on the table `Channel` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Channel_isSelfNote_name_key" ON "Channel"("isSelfNote", "name");
