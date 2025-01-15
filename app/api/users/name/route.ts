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

    const { name } = await req.json()
    
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        updatedAt: new Date(),
      },
    })
    
    // Notify clients about the name change
    await emitDataUpdate(userId, {
      type: 'user-updated',
      data: {
        userId,
        avatar: updatedUser.avatar || undefined,
        name: updatedUser.name || undefined,
        status: updatedUser.status || undefined
      }
    });

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Failed to update user name:', error)
    return new NextResponse(
      JSON.stringify({
        error: 'Failed to update user name',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
} 