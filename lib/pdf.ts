import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { Readable } from "stream";
import { embedMessage } from "./rag";
import { randomUUID } from "crypto";

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.S3_REGION!,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!,
  },
});

// Function to chunk text with overlap
export function chunkText(text: string, chunkSize: number = 1000, overlap: number = 100): string[] {
  const chunks: string[] = [];
  let startIndex = 0;

  while (startIndex < text.length) {
    // Calculate end index with potential overlap
    const endIndex = Math.min(startIndex + chunkSize, text.length);
    
    // Get the chunk
    const chunk = text.slice(startIndex, endIndex);
    chunks.push(chunk);

    // Move start index, accounting for overlap
    startIndex = endIndex - overlap;
    
    // If we're near the end and the remaining text is smaller than the overlap,
    // we're done to avoid tiny chunks
    if (startIndex + overlap >= text.length) break;
  }

  return chunks;
}

export async function streamToBuffer(stream: Readable): Promise<Buffer> {
  const chunks: Buffer[] = [];
  return new Promise((resolve, reject) => {
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on('error', (err) => reject(err));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });
}

export type PdfChunkMetadata = {
  messageId: string;
  channelId: string;
  senderId: string;
  attachmentId: string;
  filename: string;
  pageNumber: number;
  chunkIndex: number;
  totalChunks: number;
  createdAt: string;
  isDM: boolean;
  type: 'pdf_chunk';
};

export async function processPdfAttachment(
  messageId: string,
  channelId: string,
  senderId: string,
  attachmentId: string,
  fileUrl: string,
  filename: string,
  isDM: boolean
) {
  try {
    console.warn('[PDF] Starting to process PDF attachment');
    console.warn('[PDF] Details:', {
      messageId,
      channelId,
      attachmentId,
      filename,
      fileUrl
    });
    
    // Extract bucket and key from S3 URL
    const url = new URL(fileUrl);
    const key = decodeURIComponent(url.pathname.slice(1));
    console.warn('[PDF] Extracted S3 key:', key);
    
    // Get file from S3
    console.warn('[PDF] Fetching from S3...');
    const getObjectCommand = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: key,
    });
    
    const response = await s3Client.send(getObjectCommand);
    console.warn('[PDF] S3 response received');
    
    if (!response.Body) {
      console.error('[PDF] No file body in S3 response');
      throw new Error('No file body received from S3');
    }
    
    // Convert stream to buffer
    console.warn('[PDF] Converting stream to buffer...');
    const buffer = await streamToBuffer(response.Body as Readable);
    console.warn('[PDF] Buffer size:', buffer.length);
    
    // Dynamically import pdf-parse
    const pdfParse = (await import('pdf-parse')).default;
    
    // Parse PDF
    console.warn('[PDF] Parsing PDF...');
    const data = await pdfParse(buffer);
    console.warn('[PDF] PDF parsed, text length:', data.text.length);
    
    // Chunk the text
    const chunks = chunkText(data.text);
    console.warn(`[PDF] Created ${chunks.length} chunks from PDF`);
    
    // Embed each chunk
    for (let i = 0; i < chunks.length; i++) {
      console.warn(`[PDF] Processing chunk ${i + 1}/${chunks.length}`);
      const chunk = chunks[i];
      
      const metadata: PdfChunkMetadata = {
        messageId,
        channelId,
        senderId,
        attachmentId,
        filename,
        pageNumber: 1, // pdf-parse doesn't provide page numbers
        chunkIndex: i,
        totalChunks: chunks.length,
        createdAt: new Date().toISOString(),
        isDM,
        type: 'pdf_chunk'
      };
      
      // Generate a random UUID for this chunk
      const chunkId = randomUUID();
      console.warn(`[PDF] Embedding chunk ${i + 1} with ID:`, chunkId);
      
      await embedMessage(chunk, chunkId, metadata);
      console.warn(`[PDF] Successfully embedded chunk ${i + 1}`);
    }
    
    console.warn('[PDF] Successfully processed and embedded all PDF content');
    return true;
  } catch (error) {
    console.error('[PDF] Error processing PDF:', error);
    throw error;
  }
} 