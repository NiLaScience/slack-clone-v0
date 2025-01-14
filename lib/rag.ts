import { OpenAIEmbeddings } from "@langchain/openai"
import { Pinecone } from "@pinecone-database/pinecone"
import { prisma } from "./db"

export interface EmbeddingMetadata {
  messageId?: string
  attachmentId?: string
  channelId?: string
  senderId?: string
  isDM?: boolean
  createdAt: string
  type: 'message' | 'attachment'
  text: string
  score?: number
}

const pinecone = new Pinecone()

// Initialize Pinecone client
export const initPinecone = async () => {
  return pinecone.Index(process.env.PINECONE_INDEX_NAME!)
}

/**
 * Embeds text and stores in Pinecone, updates DB hasEmbedding flag
 */
export async function embedAndStore({
  textChunks,
  metadata,
}: {
  textChunks: string[]
  metadata: Omit<EmbeddingMetadata, 'text' | 'score'>
}): Promise<void> {
  if (!textChunks?.length) return
  
  const index = await initPinecone()
  const embedder = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
    modelName: "text-embedding-3-large",
    dimensions: 3072, // text-embedding-3-large dimensions
    stripNewLines: false, // Preserve formatting for better context
  })

  const embeddings = await embedder.embedDocuments(textChunks)
  
  const records = embeddings.map((embedding: number[], i: number) => ({
    id: `${metadata.type}_${metadata[metadata.type === 'message' ? 'messageId' : 'attachmentId']}_${i}`,
    values: embedding,
    metadata: {
      ...metadata,
      text: textChunks[i],
    },
  }))

  await index.upsert(records)

  // Update hasEmbedding flag in DB
  if (metadata.type === 'message' && metadata.messageId) {
    await prisma.$executeRaw`
      UPDATE "Message"
      SET "hasEmbedding" = true
      WHERE id = ${metadata.messageId}
    `
  } else if (metadata.type === 'attachment' && metadata.attachmentId) {
    await prisma.$executeRaw`
      UPDATE "Attachment"
      SET "hasEmbedding" = true
      WHERE id = ${metadata.attachmentId}
    `
  }
}

/**
 * Queries Pinecone with filters and returns matches with metadata
 */
export async function queryPinecone(
  query: string,
  filter?: Record<string, any>,
  topK: number = 5
): Promise<Array<{ text: string; metadata: EmbeddingMetadata }>> {
  const index = await initPinecone()
  const embedder = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
    modelName: "text-embedding-3-large",
    dimensions: 3072,
    stripNewLines: false,
  })
  
  const queryEmbedding = await embedder.embedQuery(query)

  const res = await index.query({
    vector: queryEmbedding,
    topK,
    includeMetadata: true,
    filter: Object.keys(filter || {}).length ? filter : undefined,
  })

  return (res.matches?.map(match => ({
    text: match.metadata?.text as string,
    metadata: {
      ...match.metadata,
      score: match.score,
    } as EmbeddingMetadata,
  })) || [])
} 