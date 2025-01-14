import { embedAndStore } from "./rag"
import { prisma } from "./db"
import pdfParse from "pdf-parse"
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"
import { initPinecone } from "./rag"
import { OpenAIEmbeddings } from "@langchain/openai"
import { promises as fs } from "fs"

interface MessageWithChannel {
  id: string
  content: string
  channelId: string
  senderId: string
  hasEmbedding: boolean
  createdAt: Date
  channel_isDM: boolean
}

const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
  separators: ["\n\n", "\n", " ", ""], // Tries to split on paragraphs first, then newlines, then spaces
  lengthFunction: (text) => text.length,
})

/**
 * Embed a new message
 */
export async function embedMessage(messageId: string) {
  // Use raw query to get message with hasEmbedding field
  const result = await prisma.$queryRaw<MessageWithChannel[]>`
    SELECT 
      m.id,
      m.content,
      m."channelId",
      m."senderId",
      m."hasEmbedding",
      m."createdAt",
      c."isDM" as "channel_isDM"
    FROM "Message" m
    JOIN "Channel" c ON c.id = m."channelId"
    WHERE m.id = ${messageId}
  `;
  
  if (!result || result.length === 0) return
  
  const message = result[0]
  
  if (message.hasEmbedding) return
  
  const chunks = await textSplitter.splitText(message.content)
  await embedAndStore({
    textChunks: chunks,
    metadata: {
      type: "message",
      messageId: message.id,
      channelId: message.channelId,
      senderId: message.senderId,
      isDM: message.channel_isDM,
      createdAt: message.createdAt.toISOString(),
    },
  })
}

/**
 * Embed a PDF attachment
 */
export async function embedPDFAttachment(attachmentId: string) {
  try {
    const attachment = await prisma.attachment.findUnique({
      where: { id: attachmentId }
    })
    if (!attachment) {
      throw new Error(`Attachment ${attachmentId} not found`)
    }

    const message = await prisma.message.findUnique({
      where: { id: attachment.messageId }
    })
    if (!message) {
      throw new Error(`Message ${attachment.messageId} not found`)
    }

    const channel = await prisma.channel.findUnique({
      where: { id: message.channelId }
    })
    if (!channel) {
      throw new Error(`Channel ${message.channelId} not found`)
    }

    // Read the PDF file using fs.readFile
    const filePath = attachment.fileUrl.replace(/^file:\/\//, '')
    const pdfBuffer = await fs.readFile(filePath)
    const pdfData = await pdfParse(pdfBuffer)
    const text = pdfData.text

    // Split text into chunks
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
      separators: ["\n\n", "\n", " ", ""]
    })
    const chunks = await textSplitter.createDocuments([text])

    // Initialize OpenAI embeddings
    const embeddings = new OpenAIEmbeddings({
      modelName: "text-embedding-3-large",
      dimensions: 3072,
      stripNewLines: false
    })

    // Initialize Pinecone
    const pinecone = await initPinecone()

    // Embed and store chunks
    const records = await Promise.all(
      chunks.map(async (chunk, i) => {
        const embedding = await embeddings.embedQuery(chunk.pageContent)
        return {
          id: `${attachmentId}_chunk_${i}`,
          metadata: {
            text: chunk.pageContent,
            messageId: message.id,
            channelId: message.channelId,
            isDM: channel.isDM,
            type: "pdf",
            filename: attachment.filename
          },
          values: embedding
        }
      })
    )

    // Upsert records to Pinecone
    await pinecone.upsert(records)

    // Update attachment status
    await prisma.attachment.update({
      where: { id: attachmentId },
      data: { hasEmbedding: true }
    })

    return true
  } catch (error) {
    console.error(`Failed to embed PDF ${attachmentId}:`, error)
    throw error
  }
}

/**
 * Batch process unembedded messages
 */
export async function processUnembeddedMessages(limit = 50) {
  const messages = await prisma.$queryRaw<Array<{ id: string }>>`
    SELECT id
    FROM "Message"
    WHERE "hasEmbedding" = false
    AND "isDeleted" = false
    LIMIT ${limit}
  `
  
  await Promise.all(messages.map(msg => embedMessage(msg.id)))
}

/**
 * Batch process unembedded PDF attachments
 */
export async function processUnembeddedPDFs(limit = 10) {
  const pdfs = await prisma.$queryRaw<Array<{ id: string }>>`
    SELECT id
    FROM "Attachment"
    WHERE "hasEmbedding" = false
    AND "contentType" LIKE '%pdf%'
    LIMIT ${limit}
  `
  
  await Promise.all(pdfs.map(pdf => embedPDFAttachment(pdf.id)))
} 