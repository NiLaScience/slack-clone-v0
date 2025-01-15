import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuth } from '@clerk/nextjs/server'
import { emitDataUpdate } from '@/lib/socket'

export async function PATCH(req: NextRequest) {
  try {
    const { userId } = getAuth(req)
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { isOnline } = await req.json()

    const user = await prisma.user.update({
      where: { id: userId },
      data: { isOnline }
    })

    await emitDataUpdate(userId, {
      type: 'user-status-changed',
      data: {
        userId,
        isOnline
      }
    });
    
    return NextResponse.json(user)
  } catch (error) {
    console.error('Failed to update online status:', error)
    return new NextResponse(
      JSON.stringify({
        error: 'Failed to update online status',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
} 