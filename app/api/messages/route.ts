import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

type AttachmentInput = {
  filename: string
  fileUrl: string
  contentType: string
}

// Get or create default user
async function getOrCreateUser() {
  const defaultUser = await prisma.user.findFirst()
  if (defaultUser) return defaultUser

  // Create a default user if none exists
  return prisma.user.create({
    data: {
      id: 'user_1',
      name: 'Default User',
      avatar: '👤',
      isOnline: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  })
}

export async function POST(req: Request) {
  try {
    console.log('Received message request')
    const body = await req.json()
    console.log('Request body:', JSON.stringify(body, null, 2))
    const { content, channelId, parentMessageId, attachments } = body
    const now = new Date()

    // Get or create user first
    console.log('Getting or creating user')
    const user = await getOrCreateUser()
    console.log('Using user:', JSON.stringify(user, null, 2))

    // Validate input
    if (!content || typeof content !== 'string') {
      console.error('Invalid content:', content)
      return new NextResponse(
        JSON.stringify({ error: 'Invalid content', details: 'Content must be a non-empty string' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (!channelId || typeof channelId !== 'string') {
      console.error('Invalid channelId:', channelId)
      return new NextResponse(
        JSON.stringify({ error: 'Invalid channelId', details: 'Channel ID must be a non-empty string' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    console.log('Validating channel:', channelId)
    // Validate channel exists
    const channel = await prisma.channel.findUnique({
      where: { id: channelId },
    })

    if (!channel) {
      console.error('Channel not found:', channelId)
      return new NextResponse(
        JSON.stringify({ error: 'Channel not found', details: `No channel found with ID: ${channelId}` }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Validate parent message if provided
    if (parentMessageId) {
      console.log('Validating parent message:', parentMessageId)
      const parentMessage = await prisma.message.findUnique({
        where: { id: parentMessageId },
      })

      if (!parentMessage) {
        console.error('Parent message not found:', parentMessageId)
        return new NextResponse(
          JSON.stringify({ error: 'Parent message not found', details: `No message found with ID: ${parentMessageId}` }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        )
      }

      // Ensure the reply is in the same channel as the parent message
      if (parentMessage.channelId !== channelId) {
        console.error('Channel mismatch:', { parentChannelId: parentMessage.channelId, replyChannelId: channelId })
        return new NextResponse(
          JSON.stringify({ 
            error: 'Invalid channel', 
            details: 'Reply must be in the same channel as the parent message' 
          }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        )
      }
    }

    console.log('Creating message')
    try {
      // Generate a unique message ID
      const messageId = `msg_${Date.now()}_${Math.random().toString(36).slice(2)}`
      console.log('Generated message ID:', messageId)

      // Create the message
      const message = await prisma.message.create({
        data: {
          id: messageId,
          content,
          channelId,
          parentMessageId: parentMessageId || null,
          senderId: user.id,
          createdAt: now,
          updatedAt: now,
        },
      })
      console.log('Message created:', JSON.stringify(message, null, 2))

      // Create attachments if any
      if (attachments && attachments.length > 0) {
        console.log('Creating attachments:', attachments.length)
        await prisma.attachment.createMany({
          data: attachments.map((attachment: AttachmentInput) => ({
            id: `att_${Date.now()}_${Math.random().toString(36).slice(2)}`, // Generate a unique ID
            messageId: message.id,
            filename: attachment.filename,
            fileUrl: attachment.fileUrl,
            contentType: attachment.contentType,
            createdAt: now,
          })),
        })
        console.log('Attachments created')
      }

      console.log('Fetching message with attachments')
      // Return the created message with its attachments and parent message info
      const messageWithAttachments = await prisma.message.findUnique({
        where: { id: message.id },
        include: {
          attachments: true,
          sender: true,
          channel: true,
        },
      })

      if (!messageWithAttachments) {
        throw new Error(`Failed to fetch created message with ID: ${message.id}`)
      }

      console.log('Returning message:', JSON.stringify(messageWithAttachments, null, 2))
      return NextResponse.json(messageWithAttachments)
    } catch (dbError) {
      console.error('Database error:', dbError)
      return new NextResponse(
        JSON.stringify({ 
          error: 'Database error', 
          details: dbError instanceof Error ? dbError.message : 'Unknown database error',
          stack: dbError instanceof Error ? dbError.stack : undefined
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }
  } catch (error) {
    // Log the full error details
    console.error('Failed to create message. Full error:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    
    // Return a more detailed error message
    return new NextResponse(
      JSON.stringify({
        error: 'Failed to create message',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  }
} 