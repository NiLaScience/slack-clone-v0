import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from "@clerk/nextjs/server"
import { queryMessages } from '@/lib/rag'
import { truncateContext } from '@/lib/tokens'
import OpenAI from 'openai'
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions'

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
    const { query, history = [] } = body

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

    // Extract source information (keep all sources even if context is truncated)
    const sources = relevantDocs?.map(doc => ({
      filename: doc.filename || '',
      pageNumber: doc.pageNumber || 1,
      chunkIndex: doc.chunkIndex || 0,
      documentId: doc.documentId
    })).filter(source => source.filename && source.documentId) || []

    // Prepare base messages
    const baseMessages = [
      {
        role: "system" as const,
        content: "You are a helpful assistant answering questions about the user's personal documents."
      },
      ...history.map(msg => ({
        role: msg.role as "system" | "user" | "assistant",
        content: msg.content
      })),
      { role: "user" as const, content: query }
    ] satisfies ChatCompletionMessageParam[]

    // Truncate context if needed
    const { context: truncatedContext, messages } = truncateContext(
      context || [],
      baseMessages
    )

    // Update system message with truncated context
    const messagesWithContext: ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: `You are a helpful assistant answering questions about the user's personal documents.\n\nBelow is relevant context from their documents:\n\n${truncatedContext.join("\n\n")}`
      },
      ...messages.slice(1)
    ]

    // Call OpenAI with truncated context and history
    const response = await openai.chat.completions.create({
      model: "gpt-4-0125-preview",
      messages: messagesWithContext,
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from OpenAI')
    }

    return NextResponse.json({ 
      content,
      context: truncatedContext,
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