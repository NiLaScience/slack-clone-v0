import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'

export async function POST(req: Request) {
  try {
    const { channelId, userId } = await req.json()

    if (!channelId || !userId) {
      return NextResponse.json(
        { error: "channelId and userId are required" },
        { status: 400 }
      )
    }

    // Check if user exists, create if not
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      await prisma.user.create({
        data: {
          id: userId,
          name: "New User",
          avatar: "👤",
          status: "",
          isOnline: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
    }

    // Check if channel exists
    const channel = await prisma.channel.findUnique({
      where: { id: channelId },
      include: {
        memberships: true
      }
    })

    if (!channel) {
      return NextResponse.json(
        { error: "Channel not found" },
        { status: 404 }
      )
    }

    // Check if user is already a member
    const existingMembership = channel.memberships.find(
      (m: { userId: string }) => m.userId === userId
    )

    if (existingMembership) {
      return NextResponse.json(channel)
    }

    // Create membership
    await prisma.channelMembership.create({
      data: {
        id: `membership_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        channelId,
        userId,
        createdAt: new Date()
      }
    })

    return NextResponse.json(channel)
  } catch (error) {
    console.error('Error joining channel:', error)
    return NextResponse.json(
      { error: "Failed to join channel", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 