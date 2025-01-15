import { NextResponse, NextRequest } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'
import { emitDataUpdate } from '@/lib/socket'

// How long (in milliseconds) before a user is considered offline
const OFFLINE_THRESHOLD = 10000 // 10 seconds

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req)
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

    // Find users who haven't sent a heartbeat recently
    const usersToUpdate = await prisma.user.findMany({
      where: {
        lastActiveAt: {
          lt: new Date(Date.now() - OFFLINE_THRESHOLD)
        },
        isOnline: true
      },
      select: {
        id: true
      }
    })

    // Update offline users
    if (usersToUpdate.length > 0) {
      await prisma.user.updateMany({
        where: {
          id: {
            in: usersToUpdate.map(u => u.id)
          }
        },
        data: {
          isOnline: false
        }
      })

      // Notify about each user going offline
      await Promise.all(usersToUpdate.map(user => 
        emitDataUpdate({
          type: 'user-status-changed',
          data: {
            userId: user.id,
            isOnline: false
          }
        })
      ))
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in heartbeat:", error)
    return NextResponse.json(
      { error: "Failed to update heartbeat" },
      { status: 500 }
    )
  }
} 