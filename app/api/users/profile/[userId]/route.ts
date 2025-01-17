import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuth } from '@clerk/nextjs/server'

export async function GET(request: NextRequest) {
  try {
    const { userId: currentUserId } = getAuth(request)
    if (!currentUserId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Get userId from URL
    const userId = request.nextUrl.pathname.split('/')[4]
    if (!userId) {
      return new NextResponse(
        JSON.stringify({ error: 'User ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return new NextResponse(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Failed to fetch user:', error)
    return new NextResponse(
      JSON.stringify({
        error: 'Failed to fetch user',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
} 