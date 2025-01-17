import { NextRequest, NextResponse } from "next/server"
import { getAuth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/db"
import { uploadFile } from "@/lib/s3"

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

    if (!file.type.startsWith("audio/")) {
      return NextResponse.json(
        { error: "File must be an audio file" },
        { status: 400 }
      )
    }

    const key = `voice-samples/${entityType}/${entityId}/${file.name}`
    const url = await uploadFile(file, key)

    if (entityType === "user") {
      await prisma.user.update({
        where: { id: entityId },
        data: {
          voiceSampleUrl: url,
          voiceStatus: "pending"
        }
      })
    } else {
      await prisma.channel.update({
        where: { id: entityId },
        data: {
          voiceSampleUrl: url,
          voiceStatus: "pending"
        }
      })
    }

    return NextResponse.json({ url })
  } catch (error) {
    console.error("Error uploading voice sample:", error)
    return NextResponse.json(
      { error: "Failed to upload voice sample" },
      { status: 500 }
    )
  }
} 