import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

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
    const { name, isPrivate, isDM, isSelfDM } = await req.json()
    console.log('Creating channel:', { name, isPrivate, isDM, isSelfDM })

    // Check if channel already exists
    const existingChannel = await prisma.channel.findFirst({
      where: { name }
    })

    if (existingChannel) {
      console.log('Found existing channel:', existingChannel)
      return NextResponse.json(existingChannel)
    }

    // Create new channel
    const channel = await prisma.channel.create({
      data: {
        id: `ch_${Date.now()}`,
        name,
        isPrivate: isPrivate ?? false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    })
    console.log('Created new channel:', channel)

    // Get current user
    const user = await prisma.user.findFirst()
    if (!user) {
      throw new Error('No user found')
    }
    console.log('Found current user:', user)

    // Create channel membership for current user
    await prisma.channelMembership.create({
      data: {
        id: `membership_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        channelId: channel.id,
        userId: user.id,
        createdAt: new Date()
      }
    })
    console.log('Created channel membership for current user')

    // For DMs that aren't self-DMs, create membership for the other user
    if (isDM && !isSelfDM) {
      const otherUserName = name.split('-').find((n: string) => n !== user.name)
      if (!otherUserName) {
        throw new Error('Could not find other user name')
      }

      const otherUser = await prisma.user.findFirst({
        where: { name: otherUserName }
      })

      if (!otherUser) {
        throw new Error('Other user not found')
      }

      await prisma.channelMembership.create({
        data: {
          id: `membership_${Date.now()}_${Math.random().toString(36).slice(2)}`,
          channelId: channel.id,
          userId: otherUser.id,
          createdAt: new Date()
        }
      })
      console.log('Created channel membership for other user')
    }

    return NextResponse.json(channel)
  } catch (error) {
    console.error('Failed to create channel:', error)
    return new NextResponse(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to create channel' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
} 