import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuth } from '@clerk/nextjs/server'

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req)
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { name, avatar, status, isOnline, email } = await req.json()
    
    // Create or update user profile
    const user = await prisma.user.upsert({
      where: { id: userId },
      update: {
        name,
        avatar,
        status,
        isOnline,
        updatedAt: new Date(),
      },
      create: {
        id: userId,
        name,
        email,
        avatar,
        status,
        isOnline,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })
    
    return NextResponse.json(user)
  } catch (error) {
    console.error('Failed to create/update user profile:', error)
    return new NextResponse(
      JSON.stringify({
        error: 'Failed to create/update user profile',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
} 