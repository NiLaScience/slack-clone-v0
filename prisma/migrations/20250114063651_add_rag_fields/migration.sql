-- AlterTable
ALTER TABLE "Attachment" ADD COLUMN     "hasEmbedding" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Channel" ADD COLUMN     "systemPrompt" TEXT;

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "hasEmbedding" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "systemPrompt" TEXT;
