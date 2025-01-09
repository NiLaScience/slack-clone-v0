import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    console.log('Starting getData request')
    
    // Get or create default user
    console.log('Checking for default user')
    let defaultUser = await prisma.user.findFirst()
    console.log('Default user query result:', defaultUser)
    
    if (!defaultUser) {
      console.log('Creating default user')
      defaultUser = await prisma.user.create({
        data: {
          id: 'user_1',
          name: 'Default User',
          avatar: '👤',
          isOnline: true,
          status: 'Online',
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      })
      console.log('Created default user:', defaultUser)
    }

    // Get or create general channel
    console.log('Checking for general channel')
    let generalChannel = await prisma.channel.findFirst({
      where: { name: 'general' }
    })
    console.log('General channel query result:', generalChannel)
    
    if (!generalChannel) {
      console.log('Creating general channel')
      generalChannel = await prisma.channel.create({
        data: {
          id: 'channel_1',
          name: 'general',
          isPrivate: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      })
      console.log('Created general channel:', generalChannel)
    }

    // Get or create channel membership
    console.log('Checking for channel membership')
    let membership = await prisma.channelMembership.findFirst({
      where: {
        userId: defaultUser.id,
        channelId: generalChannel.id
      }
    })
    console.log('Channel membership query result:', membership)
    
    if (!membership) {
      console.log('Creating channel membership')
      membership = await prisma.channelMembership.create({
        data: {
          id: 'membership_1',
          userId: defaultUser.id,
          channelId: generalChannel.id,
          createdAt: new Date()
        }
      })
      console.log('Created channel membership:', membership)
    }

    // Fetch all data
    console.log('Fetching all data')
    const [users, channels, channelMemberships, messages, reactions] = await Promise.all([
      prisma.user.findMany(),
      prisma.channel.findMany(),
      prisma.channelMembership.findMany(),
      prisma.message.findMany({
        include: {
          attachments: true,
        },
      }),
      prisma.reaction.findMany(),
    ])

    console.log('Data fetch complete:', {
      userCount: users.length,
      channelCount: channels.length,
      membershipCount: channelMemberships.length,
      messageCount: messages.length,
      reactionCount: reactions.length,
    })

    return NextResponse.json({
      users,
      channels,
      channelMemberships,
      messages,
      reactions,
    })
  } catch (error) {
    console.error('Failed to fetch data. Full error:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return new NextResponse(
      JSON.stringify({
        error: 'Internal Server Error',
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