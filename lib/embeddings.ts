import { embedAndStore } from "./rag"
import { prisma } from "./db"
import pdfParse from "pdf-parse"
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"

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
  // Get attachment data
  const attachment = await prisma.attachment.findUnique({
    where: { id: attachmentId },
    include: {
      message: {
        include: {
          channel: true
        }
      }
    }
  })

  if (!attachment || attachment.hasEmbedding || !attachment.contentType.includes('pdf')) return

  try {
    // Download and parse PDF
    const response = await fetch(attachment.fileUrl)
    const buffer = await response.arrayBuffer()
    const pdfData = await pdfParse(Buffer.from(buffer))

    // Split text into chunks
    const chunks = await textSplitter.splitText(pdfData.text)

    // Store embeddings
    await embedAndStore({
      textChunks: chunks,
      metadata: {
        type: "attachment",
        attachmentId: attachment.id,
        messageId: attachment.messageId,
        channelId: attachment.message.channelId,
        isDM: attachment.message.channel.isDM,
        filename: attachment.filename,
        createdAt: attachment.createdAt.toISOString(),
      },
    })

    // Mark as embedded
    await prisma.attachment.update({
      where: { id: attachmentId },
      data: { hasEmbedding: true }
    })
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