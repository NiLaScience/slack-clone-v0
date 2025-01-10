import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'

// How long (in milliseconds) before a user is considered offline
const OFFLINE_THRESHOLD = 10000 // 10 seconds

export async function POST() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Update user's last active timestamp
    await prisma.user.update({
      where: { id: userId },
      data: {
        lastActiveAt: new Date(),
        isOnline: true
      }
    })

    // Find and update users who haven't sent a heartbeat recently
    await prisma.user.updateMany({
      where: {
        lastActiveAt: {
          lt: new Date(Date.now() - OFFLINE_THRESHOLD)
        },
        isOnline: true
      },
      data: {
        isOnline: false
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in heartbeat:", error)
    return NextResponse.json(
      { error: "Failed to update heartbeat" },
      { status: 500 }
    )
  }
} 