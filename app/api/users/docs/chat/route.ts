import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from "@clerk/nextjs/server"
import { queryMessages } from '@/lib/rag'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    // Check auth
    const { userId } = getAuth(req)
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Parse request
    const body = await req.json()
    const { query } = body

    if (!query) {
      return new NextResponse(
        JSON.stringify({ error: 'Query is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Get relevant documents
    const relevantDocs = await queryMessages(query, undefined, userId)
    const context = relevantDocs
      ?.map(doc => (typeof doc.text === 'string' ? doc.text : ''))
      .filter(Boolean)

    // Extract source information
    const sources = relevantDocs?.map(doc => ({
      filename: doc.filename,
      pageNumber: doc.pageNumber,
      chunkIndex: doc.chunkIndex
    })) || []

    // Call OpenAI with context
    const response = await openai.chat.completions.create({
      model: "gpt-4-0125-preview",
      messages: [
        {
          role: "system",
          content: `You are a helpful assistant answering questions about the user's personal documents. 
                   Below is relevant context from their documents:\n\n${context?.join("\n\n") || ''}`
        },
        { role: "user", content: query }
      ],
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from OpenAI')
    }

    return NextResponse.json({ 
      content,
      context: context || [],
      sources
    })
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