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
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 