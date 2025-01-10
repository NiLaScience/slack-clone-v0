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

export async function POST(req: NextRequest) {
  try {
    // Ensure default channels exist
    await ensureDefaultChannels()

    const { userId } = getAuth(req)
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { name, isPrivate, isDM, userIds } = body

    // For DM channels
    if (isDM) {
      // Sort userIds to ensure consistent channel names for DMs
      const sortedUserIds = userIds.sort()
      const channelName = sortedUserIds.join('_')

      // Check if DM channel already exists
      const existingChannel = await prisma.channel.findFirst({
        where: {
          isDM: true,
          name: channelName
        }
      })

      if (existingChannel) {
        return NextResponse.json(existingChannel)
      }

      // Create new DM channel
      const channel = await prisma.channel.create({
        data: {
          id: `channel_${Date.now()}_${Math.random().toString(36).slice(2)}`,
          name: channelName,
          isPrivate: true,
          isDM: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })

      // Create memberships for all users
      await Promise.all(
        sortedUserIds.map((userId: string) =>
          prisma.channelMembership.create({
            data: {
              id: `membership_${Date.now()}_${Math.random().toString(36).slice(2)}`,
              channelId: channel.id,
              userId,
              createdAt: new Date()
            }
          })
        )
      )

      return NextResponse.json(channel)
    }

    // For regular channels
    const channel = await prisma.channel.create({
      data: {
        id: `channel_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        name,
        isPrivate,
        isDM: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    // Create membership for creator
    await prisma.channelMembership.create({
      data: {
        id: `membership_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        channelId: channel.id,
        userId,
        createdAt: new Date()
      }
    })

    return NextResponse.json(channel)
  } catch (error) {
    console.error('Failed to create channel:', error)
    return new NextResponse(
      JSON.stringify({ 
        error: 'Failed to create channel',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
} 