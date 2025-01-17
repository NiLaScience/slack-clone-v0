import { Message } from '@prisma/client';
import { getPineconeClient } from './pinecone-client';
import { getEmbedding } from './openai';
import { RecordMetadata, ScoredPineconeRecord } from '@pinecone-database/pinecone';
import { prisma } from './db';

export async function queryMessages(
  query: string,
  channelId?: string,
  ownerId?: string,
  limit: number = 5
): Promise<Message[]> {
  const pinecone = await getPineconeClient();
  const index = pinecone.index(process.env.PINECONE_INDEX_NAME!);
  const embedding = await getEmbedding(query);

  // Get debug info about channel and user
  const channel = channelId ? await prisma.channel.findUnique({
    where: { id: channelId },
    select: { name: true, isDM: true }
  }) : null;

  const user = ownerId ? await prisma.user.findUnique({
    where: { id: ownerId },
    select: { name: true, email: true }
  }) : null;

  console.log('[PINECONE] Debug info:', {
    channelId,
    channelName: channel?.name,
    isDM: channel?.isDM,
    ownerId,
    ownerName: user?.name,
    ownerEmail: user?.email,
    limit
  });

  // Query messages if channelId provided
  const messageResults = channelId ? await index.query({
    vector: embedding,
    filter: { channelId },
    topK: limit,
    includeMetadata: true
  }) : { matches: [] };

  // Query documents if ownerId provided
  const documentResults = ownerId ? await index.query({
    vector: embedding,
    filter: { ownerId },
    topK: limit,
    includeMetadata: true
  }) : { matches: [] };

  console.log('[PINECONE] Query results:', {
    messageMatches: messageResults.matches.length,
    documentMatches: documentResults.matches.length,
    messageMetadata: messageResults.matches.map(m => m.metadata),
    documentMetadata: documentResults.matches.map(m => m.metadata)
  });

  // Combine and sort results by score
  const allMatches = [...messageResults.matches, ...documentResults.matches]
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .slice(0, limit);

  return allMatches
    .filter((match: ScoredPineconeRecord) => match.metadata)
    .map((match: ScoredPineconeRecord) => {
      const metadata = match.metadata as RecordMetadata;
      return {
        id: metadata.id as string,
        content: metadata.content as string,
        channelId: metadata.channelId as string,
        senderId: metadata.senderId as string,
        parentMessageId: null,
        isDeleted: false,
        askBot: false,
        createdAt: new Date(metadata.createdAt as string),
        updatedAt: new Date(metadata.updatedAt as string),
        editedAt: null,
        metadata: metadata.metadata as any || null,
        ownerId: metadata.ownerId as string || null,
        documentId: metadata.documentId as string || null,
        filename: metadata.filename as string || null,
        pageNumber: metadata.pageNumber as number || null,
        chunkIndex: metadata.chunkIndex as number || null
      } as Message;
    });
} 