import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { uploadFile } from "@/lib/s3"
import { getAuth } from "@clerk/nextjs/server"

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File
    const entityId = formData.get("entityId") as string
    const entityType = formData.get("entityType") as "user" | "channel"

    if (!file || !entityId || !entityType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.type.startsWith("audio/")) {
      return NextResponse.json(
        { error: "Invalid file type" },
        { status: 400 }
      )
    }

    // Upload to S3
    const s3Key = `voice-samples/${entityType}/${entityId}/${file.name}`
    const voiceSampleUrl = await uploadFile(file, s3Key)

    // Update database
    if (entityType === "user") {
      await prisma.user.update({
        where: { id: entityId },
        data: {
          voiceSampleUrl,
          voiceStatus: "pending" as const,
          voiceId: null,
        },
      })
    } else {
      await prisma.channel.update({
        where: { id: entityId },
        data: {
          voiceSampleUrl,
          voiceStatus: "pending" as const,
          voiceId: null,
        },
      })
    }

    // Start voice cloning process asynchronously
    // This would typically be handled by a background job
    // For now, we'll just return success and handle cloning separately
    
    return NextResponse.json({ voiceSampleUrl })
  } catch (error) {
    console.error("Voice sample upload error:", error)
    return NextResponse.json(
      { error: "Failed to upload voice sample" },
      { status: 500 }
    )
  }
} 