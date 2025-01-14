import { embedAndStore } from "./rag"
import { prisma } from "./db"
import pdfParse from "pdf-parse"
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"

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
  const [message] = await prisma.$queryRaw<Array<{
    id: string
    content: string
    channelId: string
    senderId: string
    hasEmbedding: boolean
    createdAt: Date
    channel: { isDM: boolean }
  }>>`
    SELECT m.*, c.* 
    FROM "Message" m
    JOIN "Channel" c ON c.id = m."channelId"
    WHERE m.id = ${messageId}
  `
  
  if (!message || message.hasEmbedding) return
  
  const chunks = await textSplitter.splitText(message.content)
  await embedAndStore({
    textChunks: chunks,
    metadata: {
      type: "message",
      messageId: message.id,
      channelId: message.channelId,
      senderId: message.senderId,
      isDM: message.channel.isDM,
      createdAt: message.createdAt.toISOString(),
    },
  })
}

/**
 * Process and embed PDF attachment
 */
export async function embedPDFAttachment(attachmentId: string) {
  // Use raw query to get attachment with hasEmbedding field
  const [attachment] = await prisma.$queryRaw<Array<{
    id: string
    messageId: string
    fileUrl: string
    contentType: string
    hasEmbedding: boolean
    createdAt: Date
    message: {
      channelId: string
      senderId: string
      channel: { isDM: boolean }
    }
  }>>`
    SELECT a.*, m.*, c.*
    FROM "Attachment" a
    JOIN "Message" m ON m.id = a."messageId"
    JOIN "Channel" c ON c.id = m."channelId"
    WHERE a.id = ${attachmentId}
  `
  
  if (!attachment || attachment.hasEmbedding || !attachment.contentType.includes("pdf")) return
  
  try {
    const response = await fetch(attachment.fileUrl)
    const buffer = await response.arrayBuffer()
    const pdfData = await pdfParse(buffer)
    const chunks = await textSplitter.splitText(pdfData.text)
    
    await embedAndStore({
      textChunks: chunks,
      metadata: {
        type: "attachment",
        attachmentId: attachment.id,
        messageId: attachment.messageId,
        channelId: attachment.message.channelId,
        senderId: attachment.message.senderId,
        isDM: attachment.message.channel.isDM,
        createdAt: attachment.createdAt.toISOString(),
      },
    })
  } catch (error) {
    console.error("Failed to process PDF:", error)
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