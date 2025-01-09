import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: { messageId: string } }
) {
  try {
    const { messageId } = params

    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: {
        attachments: true,
        sender: true,
        channel: true,
      },
    })

    if (!message) {
      return new NextResponse(
        JSON.stringify({ error: 'Message not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }

    return NextResponse.json(message)
  } catch (error) {
    console.error('Failed to fetch message:', error)
    return new NextResponse(
      JSON.stringify({
        error: 'Failed to fetch message',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
} 