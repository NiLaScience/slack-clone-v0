import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

type SearchMessage = {
  id: string
  content: string
  createdAt: Date
  sender: {
    id: string
    name: string
    avatar: string
    status: string | null
    isOnline: boolean
  }
  attachments: Array<{
    id: string
    filename: string
    fileUrl: string
    contentType: string
  }>
  channel: {
    id: string
    name: string
    isPrivate: boolean
  }
}

export async function GET(req: Request) {
  try {
    console.log('Starting search request')
    const { searchParams } = new URL(req.url)
    const query = searchParams.get('q')?.toLowerCase() || ''
    console.log('Search query:', query)
    
    console.log('Fetching messages matching content')
    const messages = await prisma.message.findMany({
      where: {
        content: {
          contains: query
        }
      },
      include: {
        channel: {
          select: {
            id: true,
            name: true,
            isPrivate: true
          }
        },
        sender: {
          select: {
            id: true,
            name: true,
            avatar: true,
            status: true,
            isOnline: true
          }
        },
        attachments: {
          select: {
            id: true,
            filename: true,
            fileUrl: true,
            contentType: true
          }
        }
      }
    })
    console.log(`Found ${messages.length} messages matching content`)

    console.log('Fetching messages with matching attachments')
    const messagesWithAttachments = await prisma.message.findMany({
      where: {
        attachments: {
          some: {
            filename: {
              contains: query
            }
          }
        }
      },
      include: {
        attachments: {
          select: {
            id: true,
            filename: true,
            fileUrl: true,
            contentType: true
          }
        },
        channel: {
          select: {
            id: true,
            name: true,
            isPrivate: true
          }
        },
        sender: {
          select: {
            id: true,
            name: true,
            avatar: true,
            status: true,
            isOnline: true
          }
        }
      }
    })
    console.log(`Found ${messagesWithAttachments.length} messages with matching attachments`)

    const fileResults = messagesWithAttachments.flatMap((message: SearchMessage) =>
      message.attachments
        .filter(attachment => attachment.filename.toLowerCase().includes(query))
        .map(attachment => ({
          attachment,
          message: {
            id: message.id,
            content: message.content,
            createdAt: message.createdAt,
            sender: message.sender
          },
          channel: message.channel
        }))
    )
    console.log(`Extracted ${fileResults.length} file results`)

    const response = {
      messages: messages.map((message: SearchMessage) => ({
        message: {
          id: message.id,
          content: message.content,
          createdAt: message.createdAt,
          sender: message.sender,
          attachments: message.attachments
        },
        channel: message.channel
      })),
      files: fileResults
    }

    console.log('Sending response')
    return NextResponse.json(response)
  } catch (error) {
    console.error('Search failed. Full error:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    
    return new NextResponse(
      JSON.stringify({
        error: 'Search failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    )
  }
} 