import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuth } from '@clerk/nextjs/server'
import { emitDataUpdate } from '@/lib/socket'

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req)
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { messageId, emoji } = await req.json()
    
    // Get the message to find its channel
    const message = await prisma.message.findUnique({
      where: { id: messageId }
    })

    if (!message) {
      return new NextResponse(
        JSON.stringify({ error: 'Message not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }

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

    let result;
    if (existingReaction) {
      // If reaction exists, remove it
      await prisma.reaction.delete({
        where: { id: existingReaction.id }
      })
      
      // Notify clients about the update
      await emitDataUpdate(userId, {
        type: 'reaction-toggled',
        channelId: message.channelId,
        data: {
          messageId,
          action: 'removed' as const,
          reactionId: existingReaction.id
        }
      });
      
      result = { success: true, action: 'removed', reactionId: existingReaction.id };
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
      
      // Notify clients about the update
      await emitDataUpdate(userId, {
        type: 'reaction-toggled',
        channelId: message.channelId,
        data: {
          messageId,
          action: 'added' as const,
          reaction
        }
      });
      
      result = { success: true, action: 'added', reaction };
    }

    return NextResponse.json(result)
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

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = getAuth(req)
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { id } = await req.json()
    
    // Get the reaction to find its message and channel
    const reaction = await prisma.reaction.findUnique({
      where: { id },
      include: { message: true }
    })

    if (!reaction) {
      return new NextResponse(
        JSON.stringify({ error: 'Reaction not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    await prisma.reaction.delete({
      where: { id }
    })

    // Notify clients about the update
    await emitDataUpdate(userId, {
      type: 'reaction-toggled',
      channelId: reaction.message.channelId,
      data: {
        messageId: reaction.messageId,
        action: 'removed' as const,
        reactionId: id
      }
    });
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete reaction:', error)
    return new NextResponse(
      JSON.stringify({
        error: 'Failed to delete reaction',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
} 