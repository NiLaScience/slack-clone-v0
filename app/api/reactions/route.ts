import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuth } from '@clerk/nextjs/server'

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req)
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { messageId, emoji } = await req.json()
    
    // Get the authenticated user
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return new NextResponse(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Check if reaction already exists
    const existingReaction = await prisma.reaction.findFirst({
      where: {
        messageId,
        userId: user.id,
        emoji
      }
    })

    if (existingReaction) {
      // If reaction exists, remove it
      await prisma.reaction.delete({
        where: { id: existingReaction.id }
      })
      return NextResponse.json({ success: true, action: 'removed' })
    } else {
      // If reaction doesn't exist, create it
      const reaction = await prisma.reaction.create({
        data: {
          id: `reaction_${Date.now()}_${Math.random().toString(36).slice(2)}`,
          messageId,
          userId: user.id,
          emoji,
          createdAt: new Date()
        }
      })
      return NextResponse.json({ success: true, action: 'added', reaction })
    }
  } catch (error) {
    console.error('Failed to toggle reaction:', error)
    return new NextResponse(
      JSON.stringify({
        error: 'Failed to toggle reaction',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

export async function DELETE(req: Request) {
  const { id } = await req.json()
  
  await prisma.reaction.delete({
    where: { id }
  })
  
  return NextResponse.json({ success: true })
} 