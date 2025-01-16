import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { Readable } from "stream";
import { embedMessage } from "./rag";
import { randomUUID } from "crypto";
import { chunkText, streamToBuffer } from "./pdf";

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.S3_REGION!,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!,
  },
});

export type UserDocChunkMetadata = {
  ownerId: string;           // The user who owns this document
  documentId: string;        // ID from UserDocument table
  filename: string;
  pageNumber: number;
  chunkIndex: number;
  totalChunks: number;
  createdAt: string;
  type: 'pdf_chunk';
};

export async function processUserPdf(
  userId: string,
  documentId: string,
  fileUrl: string,
  filename: string,
) {
  try {
    console.warn('[PDF] Starting to process user PDF document');
    console.warn('[PDF] Details:', {
      userId,
      documentId,
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
      
      const metadata: UserDocChunkMetadata = {
        ownerId: userId,
        documentId,
        filename,
        pageNumber: 1, // pdf-parse doesn't provide page numbers
        chunkIndex: i,
        totalChunks: chunks.length,
        createdAt: new Date().toISOString(),
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