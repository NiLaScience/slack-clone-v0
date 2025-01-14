import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'

export async function GET(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const users = await prisma.$queryRaw<Array<{ systemPrompt: string | null }>>`
      SELECT "systemPrompt" FROM "User" WHERE id = ${userId}
    `

    return NextResponse.json({ systemPrompt: users[0]?.systemPrompt })
  } catch (error) {
    console.error('Failed to fetch system prompt:', error)
    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

export async function PATCH(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
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
      UPDATE "User"
      SET "systemPrompt" = ${systemPrompt}
      WHERE id = ${userId}
    `

    return NextResponse.json({ systemPrompt })
  } catch (error) {
    console.error('Failed to update system prompt:', error)
    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
} 