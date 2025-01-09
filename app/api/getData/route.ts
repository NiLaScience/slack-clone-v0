import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuth } from '@clerk/nextjs/server'
import { Channel, ChannelMembership } from '@/types/dataStructures'

export async function GET(request: NextRequest) {
  try {
    console.log('Starting getData request')
    
    const { userId } = getAuth(request)
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }
    
    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })
    
    if (!user) {
      return new NextResponse(
        JSON.stringify({ error: "User not found" }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Fetch all data
    console.log('Fetching all data')
    const [users, channels, messages, reactions] = await Promise.all([
      prisma.user.findMany(),
      prisma.channel.findMany({
        include: {
          memberships: true
        }
      }),
      prisma.message.findMany({
        include: {
          attachments: true,
          sender: true,
          channel: true,
        },
      }),
      prisma.reaction.findMany(),
    ])

    // Add memberIds to channels
    const channelsWithMemberIds = channels.map((channel: Channel & { memberships: ChannelMembership[] }) => ({
      ...channel,
      memberIds: channel.memberships.map((m: ChannelMembership) => m.userId)
    }))

    console.log('Data fetch complete:', {
      userCount: users.length,
      channelCount: channels.length,
      messageCount: messages.length,
      reactionCount: reactions.length,
    })

    return NextResponse.json({
      users,
      channels: channelsWithMemberIds,
      messages,
      reactions,
    })
  } catch (error) {
    console.error('Failed to fetch data:', error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
} 