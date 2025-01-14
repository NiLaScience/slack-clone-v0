import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'
import { embedMessage } from '@/lib/rag'
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
    const { content, channelId, parentMessageId, attachments, askBot } = body

    // Check if user is a member of the channel
    const membership = await prisma.channelMembership.findFirst({
      where: {
        channelId,
        userId
      },
      include: {
        channel: true
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
        askBot: askBot || false,
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

    // Handle bot response if askBot is true
    if (askBot) {
      // Process bot response in the background
      handleBotResponse({
        id: message.id,
        content: message.content,
        channelId: message.channelId,
        senderId: message.senderId
      }).catch(error => {
        console.error('[MESSAGE] Error handling bot response:', error);
      });
    }

    // Only try to embed if it's not a self-note
    if (!message.channel.isSelfNote) {
      // Embed message text
      try {
        await embedMessage(content, undefined, {
          messageId: message.id,
          channelId: message.channelId,
          senderId: message.senderId,
          createdAt: message.createdAt.toISOString(),
          isDM: message.channel.isDM,
          type: 'message'
        }).catch(error => {
          console.error('[MESSAGE] Error embedding message:', error);
        });
      } catch (error) {
        console.error('[MESSAGE] Error in embedding process:', error);
      }

      // Process PDF attachments
      if (message.attachments?.length > 0) {
        const pdfAttachments = message.attachments.filter(att => att.contentType === 'application/pdf');
        if (pdfAttachments.length > 0) {
          console.warn('[PDF] Found PDF attachments:', pdfAttachments.length);
          
          // Process PDFs in the background by calling the PDF processing endpoint
          Promise.all(pdfAttachments.map(attachment => {
            return fetch('/api/rag/process-pdf', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                messageId: message.id,
                channelId: message.channelId,
                senderId: message.senderId,
                attachmentId: attachment.id,
                fileUrl: attachment.fileUrl,
                filename: attachment.filename,
                isDM: message.channel.isDM
              })
            }).catch(err => {
              console.error('[PDF] Error processing attachment:', attachment.filename, err);
            });
          })).catch(err => {
            console.error('[PDF] Error in PDF processing:', err);
          });
          
          console.warn('[PDF] PDF processing initiated');
        }
      }
    }

    return NextResponse.json(message)
  } catch (error) {
    console.error('Error creating message:', error)
    return new NextResponse(
      JSON.stringify({ error: "Internal server error", details: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
} 