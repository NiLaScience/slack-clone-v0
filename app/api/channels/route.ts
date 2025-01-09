import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'
import type { Channel } from '@/types/dataStructures'
import { NextRequest } from "next/server";

export async function GET() {
  try {
    const channels = await prisma.channel.findMany()
    return NextResponse.json(channels)
  } catch (error) {
    console.error('Failed to fetch channels:', error)
    return new NextResponse('Failed to fetch channels', { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    console.log('Auth userId:', userId)
    
    if (!userId) {
      console.log('No userId from auth')
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { name, isPrivate, isDM, userIds } = body
    console.log('Request body:', { name, isPrivate, isDM, userIds })

    // Handle DM channel creation
    if (isDM) {
      console.log('Creating DM channel')
      if (!Array.isArray(userIds) || userIds.length === 0) {
        console.log('Invalid userIds:', userIds)
        return NextResponse.json({ error: "userIds must be a non-empty array" }, { status: 400 })
      }

      // Validate user IDs
      const invalidUserIds = userIds.filter(id => typeof id !== 'string' || !id.startsWith('user_'))
      if (invalidUserIds.length > 0) {
        console.log('Invalid user IDs format:', invalidUserIds)
        return NextResponse.json({ error: "Invalid user IDs format", details: invalidUserIds }, { status: 400 })
      }

      // Ensure all users exist, create them if they don't
      console.log('Finding existing users')
      const existingUsers = await prisma.user.findMany({
        where: {
          id: {
            in: userIds
          }
        }
      })
      console.log('Found existing users:', existingUsers)

      const existingUserIds = existingUsers.map((u: { id: string }) => u.id)
      const missingUserIds = userIds.filter(id => !existingUserIds.includes(id))
      console.log('Missing user IDs:', missingUserIds)

      // Create missing users with default profiles
      if (missingUserIds.length > 0) {
        console.log('Creating missing users')
        try {
          await Promise.all(missingUserIds.map(id =>
            prisma.user.create({
              data: {
                id,
                name: "New User",
                avatar: "👤",
                status: "",
                isOnline: true,
                createdAt: new Date(),
                updatedAt: new Date()
              }
            })
          ))
        } catch (error) {
          console.error('Failed to create users:', error)
          return NextResponse.json(
            { error: "Failed to create users", details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
          )
        }
      }

      // Sort userIds to ensure consistent channel naming
      const sortedUserIds = [...new Set(userIds)].sort()
      const dmChannelName = `dm_${sortedUserIds.join('_')}`
      const isSelfNote = sortedUserIds.length === 1
      console.log('DM channel details:', { dmChannelName, isSelfNote })

      // Check if DM channel already exists
      console.log('Checking for existing DM channel')
      const existingChannel = await prisma.channel.findFirst({
        where: { 
          name: dmChannelName,
          isDM: true
        },
        include: {
          memberships: true
        }
      })
      console.log('Existing channel found:', existingChannel)

      if (existingChannel) {
        // Ensure all users are members
        const existingMemberIds = existingChannel.memberships.map((m: { userId: string }) => m.userId)
        const missingMemberIds = sortedUserIds.filter(id => !existingMemberIds.includes(id))
        console.log('Missing member IDs:', missingMemberIds)

        if (missingMemberIds.length > 0) {
          console.log('Creating missing memberships')
          try {
            await Promise.all(missingMemberIds.map(userId =>
              prisma.channelMembership.create({
                data: {
                  id: `membership_${Date.now()}_${Math.random().toString(36).slice(2)}`,
                  channelId: existingChannel.id,
                  userId,
                  createdAt: new Date()
                }
              })
            ))
          } catch (error) {
            console.error('Failed to create memberships:', error)
            return NextResponse.json(
              { error: "Failed to create memberships", details: error instanceof Error ? error.message : String(error) },
              { status: 500 }
            )
          }
        }

        return NextResponse.json(existingChannel)
      }

      // Create new DM channel
      console.log('Creating new DM channel')
      let channel: Channel
      try {
        channel = await prisma.channel.create({
          data: {
            id: `ch_${Date.now()}`,
            name: dmChannelName,
            isPrivate: true,
            isDM: true,
            isSelfNote,
            createdAt: new Date(),
            updatedAt: new Date(),
          }
        })
        console.log('Created channel:', channel)

        // Create channel memberships for all participants
        console.log('Creating memberships for:', sortedUserIds)
        await Promise.all(sortedUserIds.map(participantId =>
          prisma.channelMembership.create({
            data: {
              id: `membership_${Date.now()}_${Math.random().toString(36).slice(2)}`,
              channelId: channel.id,
              userId: participantId,
              createdAt: new Date()
            }
          })
        ))

        return NextResponse.json(channel)
      } catch (error) {
        console.error('Failed to create channel or memberships:', error)
        return NextResponse.json(
          { error: "Failed to create channel or memberships", details: error instanceof Error ? error.message : String(error) },
          { status: 500 }
        )
      }
    }

    // Handle regular channel creation
    if (!name) {
      return NextResponse.json({ error: "name is required for regular channels" }, { status: 400 })
    }

    // Check if channel already exists
    const existingChannel = await prisma.channel.findFirst({
      where: { name }
    })

    if (existingChannel) {
      return NextResponse.json(existingChannel)
    }

    // Create new channel
    const channel = await prisma.channel.create({
      data: {
        id: `ch_${Date.now()}`,
        name,
        isPrivate: isPrivate ?? false,
        isDM: false,
        isSelfNote: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    })

    // Create channel membership for current user
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
    console.error('Error in channels endpoint:', error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { messageId, newText } = await req.json();
    if (!messageId || !newText) {
      return NextResponse.json({ error: "Missing messageId or newText" }, { status: 400 });
    }
    await prisma.message.update({
      where: { id: messageId },
      data: { content: newText },
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { messageId } = await req.json();
    if (!messageId) {
      return NextResponse.json({ error: "Missing messageId" }, { status: 400 });
    }
    // Soft delete
    await prisma.message.update({
      where: { id: messageId },
      data: {
        isDeleted: true,
        content: "[deleted]"
      },
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
} 