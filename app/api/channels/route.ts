import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuth } from '@clerk/nextjs/server'
import { validateChannelCreation } from '../middleware/channelValidation'
import { Prisma } from '@prisma/client'
import { getBotId } from '@/lib/bot'
import { emitDataUpdate } from '@/lib/socket'

const DEFAULT_CHANNELS = ['general', 'random']
const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // 1 second

// Create default channels if they don't exist
async function ensureDefaultChannels() {
  const botId = getBotId();
  
  for (const channelName of DEFAULT_CHANNELS) {
    const existingChannel = await prisma.channel.findFirst({
      where: { name: channelName }
    })

    if (!existingChannel) {
      // Create channel
      const channel = await prisma.channel.create({
        data: {
          id: `channel_${Date.now()}_${Math.random().toString(36).slice(2)}`,
          name: channelName,
          isPrivate: false,
          isDM: false,
          isSelfNote: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      // Add bot to default channel (these are always regular channels)
      await prisma.channelMembership.create({
        data: {
          id: `bot_membership_${channel.id}`,
          channelId: channel.id,
          userId: botId,
          createdAt: new Date()
        }
      });
    }
  }
}

async function findExistingDMChannel(userIds: string[], isSelfNote: boolean) {
  return await prisma.channel.findFirst({
    where: {
      isDM: true,
      isSelfNote,
      AND: userIds.map(userId => ({
        memberships: {
          some: { userId }
        }
      }))
    },
    include: {
      memberships: true
    }
  })
}

async function createDMChannel(channelName: string, sortedUserIds: string[], retryCount = 0): Promise<any> {
  try {
    // First check if a channel already exists
    const isSelfNote = sortedUserIds.length === 1
    const existingChannel = await findExistingDMChannel(sortedUserIds, isSelfNote)
    if (existingChannel) return existingChannel

    // Create new channel if none exists
    return await prisma.channel.create({
      data: {
        id: `channel_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        name: channelName,
        isPrivate: true,
        isDM: true,
        isSelfNote,
        createdAt: new Date(),
        updatedAt: new Date(),
        memberships: {
          create: sortedUserIds.map((userId: string) => ({
            id: `membership_${Date.now()}_${Math.random().toString(36).slice(2)}`,
            userId,
            createdAt: new Date()
          }))
        }
      },
      include: {
        memberships: true
      }
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle unique constraint violations
      if (error.code === 'P2002') {
        // Channel with this name already exists, try to fetch it
        const existingChannel = await findExistingDMChannel(sortedUserIds, sortedUserIds.length === 1)
        if (existingChannel) return existingChannel
      }
    }

    // For other errors or if channel not found, retry if possible
    if (retryCount < MAX_RETRIES) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY))
      return createDMChannel(channelName, sortedUserIds, retryCount + 1)
    }

    throw error
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

      // Validate channel creation
      const validationError = await validateChannelCreation({
        name: channelName,
        isDM: true,
        isSelfNote: sortedUserIds.length === 1,
        memberIds: sortedUserIds
      })

      if (validationError) {
        return NextResponse.json(validationError, { status: validationError.status })
      }

      try {
        const channel = await createDMChannel(channelName, sortedUserIds)
        await emitDataUpdate(userId, {
          type: 'channel-created',
          data: {
            ...channel,
            memberIds: sortedUserIds
          }
        });
        return NextResponse.json(channel)
      } catch (error) {
        console.error('Failed to create DM channel:', error)
        return NextResponse.json({
          error: 'Failed to create DM channel',
          details: error instanceof Error ? error.message : 'Unknown error',
          retryAfter: RETRY_DELAY
        }, { status: 500 })
      }
    }

    // For regular channels
    const validationError = await validateChannelCreation({
      name,
      isDM: false,
      isSelfNote: false,
      memberIds: [userId]
    })

    if (validationError) {
      return NextResponse.json(validationError, { status: validationError.status })
    }

    // Only add bot to non-DM, non-self-note channels
    const memberships = [
      {
        id: `membership_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        userId,
        createdAt: new Date()
      }
    ];

    // Add bot only to regular channels
    if (!isDM && !isPrivate) {
      memberships.push({
        id: `bot_membership_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        userId: getBotId(),
        createdAt: new Date()
      });
    }

    const channel = await prisma.channel.create({
      data: {
        id: `channel_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        name,
        isPrivate,
        isDM: false,
        isSelfNote: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        memberships: {
          create: memberships
        }
      },
      include: {
        memberships: true
      }
    })

    // Notify clients about the new channel
    await emitDataUpdate(userId, {
      type: 'channel-created',
      data: {
        ...channel,
        memberIds: channel.memberships.map(m => m.userId)
      }
    });

    return NextResponse.json(channel)
  } catch (error) {
    console.error('Failed to create channel:', error)
    return new NextResponse(
      JSON.stringify({ 
        error: 'Failed to create channel',
        details: error instanceof Error ? error.message : 'Unknown error',
        retryAfter: RETRY_DELAY
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
} 