import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from "@clerk/nextjs/server"
import { prisma } from '@/lib/db'

// Simple test route
export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req)
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Fetch user's documents
    const documents = await prisma.userDocument.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(documents)
  } catch (error) {
    console.error('Error fetching documents:', error)
    return new NextResponse(
      JSON.stringify({ error: 'Failed to fetch documents' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
} 