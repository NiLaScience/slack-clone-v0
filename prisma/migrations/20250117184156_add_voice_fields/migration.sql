-- AlterTable
ALTER TABLE "Channel" ADD COLUMN     "voiceId" TEXT,
ADD COLUMN     "voiceSampleUrl" TEXT,
ADD COLUMN     "voiceStatus" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "voiceId" TEXT,
ADD COLUMN     "voiceSampleUrl" TEXT,
ADD COLUMN     "voiceStatus" TEXT;
