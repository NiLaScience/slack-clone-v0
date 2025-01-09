import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const channels = await prisma.channel.findMany()
    return NextResponse.json(channels)
  } catch (error) {
    console.error('Failed to fetch channels:', error)
    return new NextResponse('Failed to fetch channels', { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { name } = await req.json()
    const now = new Date()

    const channel = await prisma.channel.create({
      data: {
        id: `ch_${Date.now()}`,
        name,
        isPrivate: false,
        createdAt: now,
        updatedAt: now,
      },
    })

    return NextResponse.json(channel)
  } catch (error) {
    console.error('Failed to create channel:', error)
    return new NextResponse('Failed to create channel', { status: 500 })
  }
} 