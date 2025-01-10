import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'

type AttachmentInput = {
  filename: string
  fileUrl: string
  contentType: string
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { content, channelId, parentMessageId, attachments } = body

    // Check if user is a member of the channel
    const membership = await prisma.channelMembership.findFirst({
      where: {
        channelId,
        userId
      }
    })

    if (!membership) {
      return new NextResponse(
        JSON.stringify({ error: "You are not a member of this channel" }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        id: `msg_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        content,
        senderId: userId,
        channelId,
        parentMessageId,
        attachments: attachments ? {
          create: attachments.map((attachment: AttachmentInput) => ({
            id: `att_${Date.now()}_${Math.random().toString(36).slice(2)}`,
            filename: attachment.filename,
            fileUrl: attachment.fileUrl,
            contentType: attachment.contentType,
            createdAt: new Date()
          }))
        } : undefined
      },
      include: {
        attachments: true
      }
    })

    return NextResponse.json(message)
  } catch (error) {
    console.error('Error creating message:', error)
    return new NextResponse(
      JSON.stringify({ error: "Internal server error", details: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
} 