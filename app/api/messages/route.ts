import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'
import { embedMessage, embedPDFAttachment } from '@/lib/embeddings'
import { handleBotResponse } from '@/lib/bot'

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
        attachments: true,
        channel: true
      }
    })

    // Handle embeddings and bot responses in parallel
    const promises: Promise<any>[] = []

    // Embed the message and any PDF attachments in background
    if (!message.channel.isSelfNote) {
      // Embed message content
      promises.push(
        embedMessage(message.id).catch(error => {
          console.error('Failed to embed message:', error)
        })
      )

      // Embed PDF attachments
      message.attachments
        .filter(att => att.contentType.includes('pdf'))
        .forEach(pdf => {
          promises.push(
            embedPDFAttachment(pdf.id).catch(error => {
              console.error(`Failed to embed PDF ${pdf.id}:`, error)
            })
          )
        })
    }

    // Check for bot mentions and generate response
    if (/@(channel-bot|[\w-]+-bot)/.test(content)) {
      promises.push(
        handleBotResponse(
          message.id,
          content,
          channelId,
          message.channel.isDM
        ).catch(error => {
          console.error('Failed to generate bot response:', error)
        })
      )
    }

    // Fire off all background tasks
    Promise.all(promises).catch(error => {
      console.error('Background task error:', error)
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