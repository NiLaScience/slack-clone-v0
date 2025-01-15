import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuth } from '@clerk/nextjs/server'
import { emitDataUpdate } from '@/lib/socket'

export async function PATCH(req: NextRequest) {
  try {
    const { userId } = getAuth(req)
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { status } = await req.json()
    
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        status,
        updatedAt: new Date(),
      },
    })
    
    // Notify clients about the status change
    await emitDataUpdate({
      type: 'user-updated',
      data: {
        userId,
        name: updatedUser.name || undefined,
        avatar: updatedUser.avatar || undefined,
        status: updatedUser.status || undefined
      }
    });

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Failed to update user status:', error)
    return new NextResponse(
      JSON.stringify({
        error: 'Failed to update user status',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
} 