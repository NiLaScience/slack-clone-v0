import { OpenAIEmbeddings } from "@langchain/openai";
import { Pinecone } from "@pinecone-database/pinecone";
import { randomUUID } from "crypto";
import { PdfChunkMetadata } from "./pdf";
import { UserDocChunkMetadata } from "./pdfUserDocs";

let pineconeClient: Pinecone | null = null;
let embedder: OpenAIEmbeddings | null = null;

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
  console.warn('[RAG] Starting query with:', { query, channelId, ownerId });
  const { index, embedder } = await initClients();
  
  // Generate query embedding
  const queryEmbedding = await embedder.embedQuery(query);
  console.warn('[RAG] Generated query embedding');
  
  // Prepare filter
  const filter: Record<string, any> = {};
  if (channelId) filter.channelId = channelId;
  if (ownerId) filter.ownerId = ownerId;
  
  console.warn('[RAG] Using filter:', filter);
  
  // Query Pinecone
  const results = await index.query({
    vector: queryEmbedding,
    filter: Object.keys(filter).length > 0 ? filter : undefined,
    topK: 5,
    includeMetadata: true,
  });
  
  console.warn('[RAG] Got results:', {
    totalResults: results.matches?.length || 0,
    channelMatches: results.matches?.filter(m => m.metadata?.channelId === channelId).length || 0,
    ownerMatches: results.matches?.filter(m => m.metadata?.ownerId === ownerId).length || 0
  });
  
  return results.matches?.map(match => ({
    score: match.score,
    text: match.metadata?.text,
    messageId: match.metadata?.messageId,
    channelId: match.metadata?.channelId,
    ownerId: match.metadata?.ownerId,
    createdAt: match.metadata?.createdAt,
    type: match.metadata?.type,
    documentId: match.metadata?.documentId,
    filename: match.metadata?.filename,
    pageNumber: match.metadata?.pageNumber,
    chunkIndex: match.metadata?.chunkIndex,
    ...(match.metadata?.type === 'pdf_chunk' && {
      attachmentId: match.metadata.attachmentId,
    })
  }));
} 