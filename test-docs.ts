import { embedPDFAttachment } from "./lib/embeddings"
import { generateBotResponse, handleBotResponse } from "./lib/bot"
import { prisma } from "./lib/db"

async function testDocuments() {
  try {
    // Clean up any existing test data
    console.log("Cleaning up existing test data...")
    await prisma.attachment.deleteMany({
      where: {
        message: {
          OR: [
            { id: { startsWith: 'msg_test_' } },
            { channelId: 'test_channel' }
          ]
        }
      }
    })
    await prisma.message.deleteMany({
      where: {
        OR: [
          { id: { startsWith: 'msg_test_' } },
          { channelId: 'test_channel' }
        ]
      }
    })
    await prisma.channelMembership.deleteMany({
      where: { channelId: 'test_channel' }
    })
    await prisma.channel.deleteMany({
      where: { id: 'test_channel' }
    })
    await prisma.user.deleteMany({
      where: { id: 'test_user' }
    })

    // Create test channel and user
    console.log("\nCreating test channel and user...")
    const channel = await prisma.channel.create({
      data: {
        id: "test_channel",
        name: "test-channel",
        isPrivate: false,
        isDM: false,
        isSelfNote: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    })
    
    const user = await prisma.user.create({
      data: {
        id: "test_user",
        name: "Test User",
        email: "test@example.com",
        avatar: "🧪",
        isOnline: true,
        lastActiveAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    })

    // Create channel membership
    await prisma.channelMembership.create({
      data: {
        id: `membership_${Date.now()}`,
        channelId: channel.id,
        userId: user.id,
        createdAt: new Date(),
      }
    })

    // Create bot user if it doesn't exist
    console.log("\nCreating bot user...")
    const botUser = await prisma.user.upsert({
      where: { id: "bot" },
      create: {
        id: "bot",
        name: "AI Assistant",
        email: "bot@example.com",
        avatar: "🤖",
        isOnline: true,
        lastActiveAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      update: {}
    })
    console.log("Bot user ready:", botUser.id)

    // Create a message with PDF attachment
    console.log("\nCreating message with PDF attachment...")
    const message = await prisma.message.create({
      data: {
        id: `msg_test_${Date.now()}`,
        content: "Here's a document about AI",
        senderId: user.id,
        channelId: channel.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    })

    // Create attachment
    const attachment = await prisma.attachment.create({
      data: {
        id: `att_test_${Date.now()}`,
        messageId: message.id,
        filename: "example.pdf",
        contentType: "application/pdf",
        fileUrl: `${process.cwd()}/test-docs/example.pdf`,
        createdAt: new Date(),
      }
    })

    // Test PDF embedding
    console.log("\nTesting PDF embedding...")
    await embedPDFAttachment(attachment.id)
    console.log("PDF embedding complete")

    // Test querying with document context
    console.log("\nTesting document-aware bot response...")
    const botResponse = await generateBotResponse(
      message.id,
      "@channel-bot what are the key concepts of AI mentioned in the document?",
      channel.id,
      false
    )
    console.log("Bot response:", botResponse)

    // Test threaded response
    console.log("\nTesting threaded response...")
    const threadedResponse = await handleBotResponse(
      message.id,
      "@channel-bot what are the future developments mentioned in the document?",
      channel.id,
      false
    )
    console.log("Threaded response:", threadedResponse)

    // Cleanup
    console.log("\nCleaning up...")
    await prisma.attachment.delete({
      where: { id: attachment.id }
    })
    await prisma.message.deleteMany({
      where: {
        OR: [
          { id: message.id },
          { parentMessageId: message.id }
        ]
      }
    })
    await prisma.channelMembership.deleteMany({
      where: { channelId: channel.id }
    })
    await prisma.channel.delete({
      where: { id: channel.id }
    })
    await prisma.user.delete({
      where: { id: user.id }
    })
    console.log("Test complete and cleanup done!")

  } catch (error) {
    console.error("Test failed:", error)
    if (error instanceof Error) {
      console.error("Error details:", error.message)
      console.error("Stack trace:", error.stack)
    }
  } finally {
    await prisma.$disconnect()
  }
}

// Run the test
testDocuments().catch(console.error) 