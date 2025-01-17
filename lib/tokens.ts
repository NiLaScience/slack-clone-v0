import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions'

// We'll use GPT-4's context window size
const MAX_CONTEXT_TOKENS = 128000 // for gpt-4-0125-preview
const BUFFER_TOKENS = 1000 // leave room for the response

// Rough token estimator (about 4 chars per token on average)
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}

export function truncateContext(
  context: string[],
  messages: ChatCompletionMessageParam[],
  maxTokens: number = MAX_CONTEXT_TOKENS - BUFFER_TOKENS
): { context: string[]; messages: ChatCompletionMessageParam[] } {
  let totalTokens = 0

  // First, count tokens in messages as they're more important
  const messageTokens = messages.reduce((acc, msg) => {
    const content = typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)
    return acc + estimateTokens(content) + estimateTokens(msg.role) + 4 // 4 tokens for message formatting
  }, 0)

  totalTokens += messageTokens
  
  // Calculate remaining tokens for context
  const remainingTokens = maxTokens - totalTokens
  
  // Sort context by relevance (assuming first items are more relevant)
  // and truncate if necessary
  let truncatedContext: string[] = []
  let currentTokens = 0
  
  for (const chunk of context) {
    const chunkTokens = estimateTokens(chunk)
    if (currentTokens + chunkTokens <= remainingTokens) {
      truncatedContext.push(chunk)
      currentTokens += chunkTokens
    } else {
      break
    }
  }

  return {
    context: truncatedContext,
    messages
  }
} 