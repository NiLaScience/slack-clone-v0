import { OpenAIEmbeddings } from "@langchain/openai";
import { Pinecone } from "@pinecone-database/pinecone";
import { randomUUID } from "crypto";
import { PdfChunkMetadata } from "./pdf";
import { UserDocChunkMetadata } from "./pdfUserDocs";
import { PrismaClient } from "@prisma/client";

let pineconeClient: Pinecone | null = null;
let embedder: OpenAIEmbeddings | null = null;
const prisma = new PrismaClient();

function cleanHtml(html: string): string {
  // Remove HTML tags
  let text = html.replace(/<[^>]*>/g, ' ');
  
  // Decode HTML entities
  text = text.replace(/&nbsp;/g, ' ')
             .replace(/&amp;/g, '&')
             .replace(/&lt;/g, '<')
             .replace(/&gt;/g, '>')
             .replace(/&quot;/g, '"')
             .replace(/&#39;/g, "'");
  
  // Remove extra whitespace
  text = text.replace(/\s+/g, ' ').trim();
  
  return text;
}

async function initClients() {
  if (!pineconeClient) {
    console.warn('[RAG] Initializing Pinecone client...');
    pineconeClient = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });
  }

  if (!embedder) {
    console.warn('[RAG] Initializing OpenAI embeddings...');
    embedder = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: "text-embedding-3-large",
    });
  }

  const indexName = process.env.PINECONE_INDEX_NAME;
  if (!indexName) {
    throw new Error('PINECONE_INDEX_NAME environment variable is not set');
  }

  const index = pineconeClient.index(indexName);
  const stats = await index.describeIndexStats();
  console.warn('[RAG] Pinecone index ready:', JSON.stringify(stats, null, 2));

  return {
    index,
    embedder,
  };
}

export type MessageMetadata = {
  messageId: string;
  channelId: string;
  senderId: string;
  createdAt: string;
  isDM?: boolean;
  type: 'message';
};

export async function embedMessage(
  content: string,
  id: string | undefined,
  metadata: MessageMetadata | PdfChunkMetadata | UserDocChunkMetadata
) {
  console.warn(`[RAG] Starting embedding process for ${metadata.type}...`);
  
  if (!content.trim()) {
    console.warn('[RAG] Empty content, skipping embedding');
    return;
  }

  // Clean HTML if it's a regular message
  const cleanContent = metadata.type === 'message' ? cleanHtml(content) : content;
  console.warn('[RAG] Content to embed:', cleanContent);

  console.warn('[RAG] Initializing clients...');
  const { index, embedder } = await initClients();

  console.warn('[RAG] Generating embedding...');
  const [embedding] = await embedder.embedDocuments([cleanContent]);
  console.warn('[RAG] Embedding generated, dimensions:', embedding.length);

  // Generate random ID if not provided
  const vectorId = id || randomUUID();

  // Prepare vector for Pinecone
  const vector = {
    id: vectorId,
    values: embedding,
    metadata: {
      ...metadata,
      text: cleanContent,
    },
  };

  console.warn('[RAG] Upserting to Pinecone...');
  await index.upsert([vector]);
  console.warn('[RAG] Successfully stored in Pinecone');

  // Verify storage
  const stats = await index.describeIndexStats();
  console.warn('[RAG] Current index stats:', JSON.stringify(stats, null, 2));
}

export async function queryMessages(query: string, channelId?: string, ownerId?: string) {
  // Get debug info about channel and user
  const channel = channelId ? await prisma.channel.findUnique({
    where: { id: channelId },
    select: { name: true, isDM: true }
  }) : null;

  const user = ownerId ? await prisma.user.findUnique({
    where: { id: ownerId },
    select: { name: true, email: true }
  }) : null;

  console.log('[RAG] Starting query with:', {
    query,
    channelId,
    channelName: channel?.name,
    isDM: channel?.isDM,
    ownerId,
    ownerName: user?.name,
    ownerEmail: user?.email
  });

  const { index, embedder } = await initClients();
  
  // Generate query embedding
  const queryEmbedding = await embedder.embedQuery(query);
  console.log('[RAG] Generated query embedding');
  
  // Query messages if channelId provided
  const messageResults = channelId ? await index.query({
    vector: queryEmbedding,
    filter: { 
      channelId,
      type: 'message'
    },
    topK: 5,
    includeMetadata: true
  }) : { matches: [] };

  // Query documents if ownerId provided
  const documentResults = ownerId ? await index.query({
    vector: queryEmbedding,
    filter: { 
      ownerId,
      type: 'pdf_chunk'
    },
    topK: 5,
    includeMetadata: true
  }) : { matches: [] };

  console.log('[RAG] Query results:', {
    messageMatches: messageResults.matches.length,
    documentMatches: documentResults.matches.length,
    messageMetadata: messageResults.matches.map(m => m.metadata),
    documentMetadata: documentResults.matches.map(m => m.metadata)
  });

  // Return messages and documents separately
  return {
    messageMatches: messageResults.matches.map(match => ({
      text: match.metadata?.text,
      messageId: match.metadata?.messageId,
      channelId: match.metadata?.channelId,
      createdAt: match.metadata?.createdAt,
      type: match.metadata?.type,
    })),
    documentMatches: documentResults.matches.map(match => ({
      text: match.metadata?.text,
      documentId: match.metadata?.documentId,
      filename: match.metadata?.filename,
      pageNumber: match.metadata?.pageNumber,
      chunkIndex: match.metadata?.chunkIndex,
      type: match.metadata?.type,
    }))
  };
} 