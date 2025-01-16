import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    // Check auth
    const { userId } = getAuth(req)
    if (!userId) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body
    const body = await req.json()
    const { messages } = body

    if (!messages || !Array.isArray(messages)) {
      return new NextResponse(
        JSON.stringify({ error: 'Invalid request body' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Call OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4-0125-preview",
      messages: messages.map(m => ({
        role: m.role,
        content: m.content
      })),
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from OpenAI')
    }

    return NextResponse.json({ content })
  } catch (error) {
    console.error('Chat error:', error)
    return new NextResponse(
      JSON.stringify({ 
        error: 'Chat failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
} 