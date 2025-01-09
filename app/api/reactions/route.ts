import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: Request) {
  const { messageId, emoji } = await req.json()
  
  const reaction = await prisma.reaction.create({
    data: {
      id: Date.now().toString(),
      messageId,
      userId: "user_1", // TODO: Replace with actual auth
      emoji,
      createdAt: new Date(),
    }
  })
  
  return NextResponse.json(reaction)
}

export async function DELETE(req: Request) {
  const { id } = await req.json()
  
  await prisma.reaction.delete({
    where: { id }
  })
  
  return NextResponse.json({ success: true })
} 