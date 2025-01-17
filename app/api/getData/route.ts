import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuth } from '@clerk/nextjs/server'

const DEFAULT_CHANNELS = ['general', 'random']

// Create default channels if they don't exist
async function ensureDefaultChannels() {
  for (const channelName of DEFAULT_CHANNELS) {
    const existingChannel = await prisma.channel.findFirst({
      where: { name: channelName }
    })

    if (!existingChannel) {
      await prisma.channel.create({
        data: {
          id: `channel_${Date.now()}_${Math.random().toString(36).slice(2)}`,
          name: channelName,
          isPrivate: false,
          isDM: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
    }
  }
}

export async function GET(req: NextRequest) {
  try {
    // Ensure default channels exist
    await ensureDefaultChannels()

    const { userId } = getAuth(req)
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Get all data with limits and selective fields
    const [channels, messages, users, reactions] = await Promise.all([
      prisma.channel.findMany({
        select: {
          id: true,
          name: true,
          isPrivate: true,
          isDM: true,
          isSelfNote: true,
          memberships: {
            select: {
              userId: true
            }
          }
        }
      }),
      prisma.message.findMany({
        take: 100, // Limit to last 100 messages
        orderBy: {
          createdAt: 'desc'
        },
        select: {
          id: true,
          content: true,
          senderId: true,
          channelId: true,
          parentMessageId: true,
          createdAt: true,
          editedAt: true,
          attachments: {
            select: {
              id: true,
              filename: true,
              fileUrl: true,
              contentType: true
            }
          }
        }
      }),
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          avatar: true,
          status: true,
          isBot: true,
          voiceId: true,
          voiceSampleUrl: true,
          voiceStatus: true
        }
      }),
      prisma.reaction.findMany({
        select: {
          id: true,
          emoji: true,
          messageId: true,
          userId: true
        }
      })
    ])

    // Transform channels to include memberIds
    const transformedChannels = channels.map(channel => ({
      ...channel,
      memberIds: channel.memberships.map(m => m.userId)
    }))

    return NextResponse.json({
      channels: transformedChannels,
      messages: messages.reverse(), // Reverse to get chronological order
      users,
      reactions
    })
  } catch (error) {
    console.error('Failed to get data:', error)
    return new NextResponse(
      JSON.stringify({
        error: 'Failed to get data',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
} 