import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'

export async function GET(
  req: Request,
  { params }: { params: { channelId: string } }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Check if user is a member of the channel
    const membership = await prisma.channelMembership.findFirst({
      where: {
        channelId: params.channelId,
        userId
      }
    })

    if (!membership) {
      return new NextResponse(
        JSON.stringify({ error: "You are not a member of this channel" }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const channel = await prisma.$queryRaw<Array<{ systemPrompt: string | null }>>`
      SELECT "systemPrompt" FROM "Channel" WHERE id = ${params.channelId}
    `

    return NextResponse.json({ systemPrompt: channel[0]?.systemPrompt })
  } catch (error) {
    console.error('Failed to fetch channel system prompt:', error)
    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { channelId: string } }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Check if user is a member of the channel
    const membership = await prisma.channelMembership.findFirst({
      where: {
        channelId: params.channelId,
        userId
      }
    })

    if (!membership) {
      return new NextResponse(
        JSON.stringify({ error: "You are not a member of this channel" }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const body = await req.json()
    const { systemPrompt } = body

    if (typeof systemPrompt !== 'string') {
      return new NextResponse(
        JSON.stringify({ error: "System prompt must be a string" }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    await prisma.$executeRaw`
      UPDATE "Channel"
      SET "systemPrompt" = ${systemPrompt}
      WHERE id = ${params.channelId}
    `

    return NextResponse.json({ systemPrompt })
  } catch (error) {
    console.error('Failed to update channel system prompt:', error)
    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
} 