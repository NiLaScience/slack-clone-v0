import { NextResponse, NextRequest } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'
import { validateChannelOperation } from '../../middleware/channelValidation'

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req)
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { channelId } = await req.json()
    if (!channelId) {
      return NextResponse.json(
        { error: "channelId is required" },
        { status: 400 }
      )
    }

    // Validate channel operation
    const validationError = await validateChannelOperation(channelId, 'join')
    if (validationError) {
      return NextResponse.json(
        { error: validationError.error },
        { status: validationError.status }
      )
    }

    // Check if user is already a member
    const existingMembership = await prisma.channelMembership.findFirst({
      where: {
        channelId,
        userId
      }
    })

    if (existingMembership) {
      return NextResponse.json({ success: true })
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

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error joining channel:', error)
    return NextResponse.json(
      { error: "Failed to join channel", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 