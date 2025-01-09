import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { Message, Channel, Attachment } from '@/types/dataStructures'

type MessageWithChannel = Message & { channel: Channel }
type MessageWithAttachments = Message & { attachments: Attachment[], channel: Channel }

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const query = searchParams.get('q')?.toLowerCase() || ''
  
  const messages = await prisma.message.findMany({
    where: {
      content: {
        contains: query,
        mode: 'insensitive'
      }
    },
    include: {
      channel: true
    }
  })

  const messagesWithAttachments = await prisma.message.findMany({
    where: {
      attachments: {
        some: {
          filename: {
            contains: query,
            mode: 'insensitive'
          }
        }
      }
    },
    include: {
      attachments: true,
      channel: true
    }
  })

  const fileResults = messagesWithAttachments.flatMap((message: MessageWithAttachments) =>
    message.attachments.map((attachment: Attachment) => ({
      attachment,
      message,
      channel: message.channel
    }))
  ).filter(({ attachment }: { attachment: Attachment }) =>
    attachment.filename.toLowerCase().includes(query)
  )

  return NextResponse.json({
    messages: messages.map((message: MessageWithChannel) => ({
      message,
      channel: message.channel
    })),
    files: fileResults
  })
} 