import { OpenAI } from "openai"
import { prisma } from "./db"
import { queryPinecone, type EmbeddingMetadata } from "./rag"
import { ChatCompletionMessageParam } from "openai/resources/chat/completions"
import { Prisma } from "@prisma/client"
import { embedMessage } from "./embeddings"

const MODEL = "chatgpt-4o-latest"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Regex for bot mentions
const BOT_MENTION_REGEX = /@(channel-bot|[\w-]+-bot)/
const USER_BOT_REGEX = /@([\w-]+)-bot/

type BotType = 'channel' | 'user'
type ContextScope = 'channel' | 'public' | 'full'

interface BotContext {
  type: BotType
  scope: ContextScope
  systemPrompt: string
  channelId: string
  userId?: string
  isDM: boolean
}

const DEFAULT_CHANNEL_PROMPT = `You are a helpful channel assistant that provides accurate and relevant information based on the channel's history. 
- Keep responses concise and focused
- Use informal, conversational tone
- Reference relevant past messages when appropriate
- If unsure, acknowledge uncertainty
- Stay on topic with the channel's context`

const DEFAULT_USER_PROMPT = `You are a helpful assistant that aims to emulate the user's communication style based on their message history.
- Match their level of formality/informality
- Use similar language patterns and expressions
- Maintain their typical response length
- Reference their past discussions when relevant
- Stay consistent with their demonstrated knowledge and interests`

/**
 * Generate multiple search queries for better context gathering
 */
async function generateSearchQueries(userQuery: string): Promise<string[]> {
  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: "system",
        content: `Generate exactly 4 search queries to gather relevant context for answering the user's question.
Each query should focus on a different aspect:
1. Direct/Literal: A straightforward version of the question
2. Conceptual: Focus on the underlying concepts or topics
3. Context/Background: Look for relevant background information
4. Related/Similar: Find similar discussions or examples

Return exactly 4 queries, one per line, without numbering or prefixes.`
      },
      {
        role: "user",
        content: userQuery
      }
    ],
    temperature: 0.7,
  })

  const content = response.choices[0].message.content
  const queries = content ? content.split('\n').filter(q => q.trim()) : [userQuery]
  
  // Ensure we always return exactly 4 queries
  if (queries.length < 4) {
    return [...queries, ...Array(4 - queries.length).fill(userQuery)]
  }
  return queries.slice(0, 4)
}

/**
 * Get relevant context using multiple queries and ranking
 */
async function getEnhancedContext(
  queries: string[],
  botContext: BotContext,
  limit = 10
): Promise<Array<{ text: string; metadata: EmbeddingMetadata }>> {
  // Gather results from all queries
  const allResults = await Promise.all(
    queries.map(async (query) => {
      const filter: Record<string, any> = {
        type: 'message' // Start with messages
      }

      // Apply scope-based filters
      if (botContext.scope === 'channel') {
        filter.channelId = botContext.channelId
      } else if (botContext.scope === 'public') {
        filter.isDM = false
        filter.senderId = botContext.userId
      } else if (botContext.scope === 'full') {
        filter.senderId = botContext.userId
      }

      return queryPinecone(query, filter, limit)
    })
  )

  // Flatten and deduplicate results
  const seen = new Set<string>()
  const uniqueResults = allResults.flat().filter(result => {
    const key = result.metadata.messageId || result.metadata.attachmentId
    if (!key || seen.has(key)) return false
    seen.add(key)
    return true
  })

  // Sort by relevance and recency
  return uniqueResults.sort((a, b) => {
    const recencyScore = (new Date(b.metadata.createdAt).getTime() - new Date(a.metadata.createdAt).getTime()) / (1000 * 60 * 60 * 24) // Days
    const recencyWeight = 0.3
    const similarityWeight = 0.7
    
    const scoreA = a.metadata.score || 0
    const scoreB = b.metadata.score || 0
    const similarityDiff = scoreB - scoreA
    
    return (similarityWeight * similarityDiff) + (recencyWeight * recencyScore)
  }).slice(0, limit)
}

/**
 * Format context for the LLM
 */
function formatContext(results: Array<{ text: string; metadata: EmbeddingMetadata }>) {
  return results.map(result => {
    const date = new Date(result.metadata.createdAt).toLocaleString()
    const source = result.metadata.type === 'message' ? 'message' : 'document'
    return `[${date}] (${source}): ${result.text}`
  }).join('\n\n')
}

/**
 * Detect bot type and get context scope
 */
async function detectBotContext(
  content: string,
  channelId: string,
  isDM: boolean
): Promise<BotContext | null> {
  const channelBotMatch = content.match(/@channel-bot/)
  const userBotMatch = content.match(USER_BOT_REGEX)

  if (!channelBotMatch && !userBotMatch) return null

  if (channelBotMatch) {
    const channel = await prisma.$queryRaw<Array<{ systemPrompt: string | null }>>`
      SELECT "systemPrompt" FROM "Channel" WHERE id = ${channelId}
    `
    return {
      type: 'channel',
      scope: 'channel',
      systemPrompt: channel[0]?.systemPrompt || DEFAULT_CHANNEL_PROMPT,
      channelId,
      isDM
    }
  }

  if (userBotMatch) {
    const username = userBotMatch[1]
    const users = await prisma.$queryRaw<Array<{ id: string; name: string; systemPrompt: string | null }>>`
      SELECT id, name, "systemPrompt" FROM "User" WHERE name = ${username}
    `
    const user = users[0]
    if (!user) return null

    return {
      type: 'user',
      scope: isDM ? 'full' : 'public',
      systemPrompt: user.systemPrompt || DEFAULT_USER_PROMPT.replace('{username}', user.name),
      channelId,
      userId: user.id,
      isDM
    }
  }

  return null
}

/**
 * Generate bot response using context-aware RAG
 */
export async function generateBotResponse(
  messageId: string,
  content: string,
  channelId: string,
  isDM: boolean
): Promise<string | null> {
  // 1. Detect bot mention and get context
  const botContext = await detectBotContext(content, channelId, isDM)
  if (!botContext) return null

  // 2. Extract the actual question (remove bot mention)
  const question = content.replace(BOT_MENTION_REGEX, '').trim()

  // 3. Generate multiple search queries
  const queries = await generateSearchQueries(question)

  // 4. Get enhanced context using multiple queries
  const relevantContext = await getEnhancedContext(queries, botContext)

  // 5. Format context and generate response
  const formattedContext = formatContext(relevantContext)

  const messages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: `${botContext.systemPrompt}\n\nRelevant context:\n${formattedContext}`
    },
    {
      role: "user",
      content: question
    }
  ]

  const response = await openai.chat.completions.create({
    model: MODEL,
    messages,
    temperature: 0.7,
  })

  return response.choices[0].message.content || null
}

/**
 * Post bot response as a new message
 */
export async function handleBotResponse(
  messageId: string,
  content: string,
  channelId: string,
  isDM: boolean
) {
  const response = await generateBotResponse(messageId, content, channelId, isDM)
  if (!response) return null

  // Create bot response message as a reply in the thread
  const message = await prisma.message.create({
    data: {
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      content: response,
      senderId: 'bot',
      channelId,
      parentMessageId: messageId, // This makes it a threaded reply
      createdAt: new Date(),
      updatedAt: new Date()
    }
  })

  // Embed the bot response for future context
  try {
    await embedMessage(message.id).catch(error => {
      console.error('Failed to embed bot response:', error)
    })
  } catch (error) {
    console.error('Failed to embed bot response:', error)
  }

  return message
} 