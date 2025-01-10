import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@clerk/nextjs/server'

export async function PATCH(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { isOnline } = await req.json()

    const user = await prisma.user.update({
      where: { id: userId },
      data: { isOnline }
    })

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