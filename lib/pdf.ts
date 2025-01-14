import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { Readable } from "stream";
import * as pdfjsLib from "pdfjs-dist";
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
function chunkText(text: string, chunkSize: number = 1000, overlap: number = 100): string[] {
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

async function streamToBuffer(stream: Readable): Promise<Buffer> {
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
    console.warn('[PDF] Processing PDF attachment:', attachmentId);
    
    // Extract bucket and key from S3 URL
    const url = new URL(fileUrl);
    const key = url.pathname.slice(1); // Remove leading slash
    
    // Get file from S3
    const getObjectCommand = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: key,
    });
    
    const response = await s3Client.send(getObjectCommand);
    if (!response.Body) throw new Error('No file body received from S3');
    
    // Convert stream to buffer
    const buffer = await streamToBuffer(response.Body as Readable);
    
    // Load PDF document
    const data = new Uint8Array(buffer);
    const pdf = await pdfjsLib.getDocument({ data }).promise;
    
    // Process each page
    let allChunks: { text: string; pageNumber: number }[] = [];
    
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item: any) => item.str)
        .join(' ');
      
      // Chunk the page text
      const pageChunks = chunkText(pageText);
      allChunks.push(...pageChunks.map(chunk => ({
        text: chunk,
        pageNumber: pageNum
      })));
    }
    
    console.warn(`[PDF] Created ${allChunks.length} chunks from PDF`);
    
    // Embed each chunk with complete metadata
    for (let i = 0; i < allChunks.length; i++) {
      const { text, pageNumber } = allChunks[i];
      const metadata: PdfChunkMetadata = {
        messageId,
        channelId,
        senderId,
        attachmentId,
        filename,
        pageNumber,
        chunkIndex: i,
        totalChunks: allChunks.length,
        createdAt: new Date().toISOString(),
        isDM,
        type: 'pdf_chunk'
      };
      
      // Generate a random UUID for this chunk
      const chunkId = randomUUID();
      
      await embedMessage(text, chunkId, metadata);
    }
    
    console.warn('[PDF] Successfully processed and embedded PDF content');
    return true;
  } catch (error) {
    console.error('[PDF] Error processing PDF:', error);
    throw error;
  }
} 