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

    // Get all data
    const [channels, messages, users, reactions] = await Promise.all([
      prisma.channel.findMany({
        include: {
          memberships: true
        }
      }),
      prisma.message.findMany({
        include: {
          attachments: true
        }
      }),
      prisma.user.findMany(),
      prisma.reaction.findMany()
    ])

    // Transform channels to include memberIds
    const transformedChannels = channels.map(channel => ({
      ...channel,
      memberIds: channel.memberships.map(m => m.userId)
    }))

    return NextResponse.json({
      channels: transformedChannels,
      messages,
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