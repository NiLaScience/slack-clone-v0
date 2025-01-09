import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuth } from '@clerk/nextjs/server'

export async function PATCH(req: NextRequest) {
  try {
    const { userId } = getAuth(req)
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { avatar } = await req.json()
    
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        avatar,
        updatedAt: new Date(),
      },
    })
    
    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Failed to update user avatar:', error)
    return new NextResponse(
      JSON.stringify({
        error: 'Failed to update user avatar',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
} 