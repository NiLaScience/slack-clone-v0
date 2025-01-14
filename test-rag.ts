import { embedMessage } from "./lib/embeddings"
import { generateBotResponse, handleBotResponse } from "./lib/bot"
import { prisma } from "./lib/db"

async function testRAG() {
  try {
    // Clean up any existing test data
    console.log("Cleaning up existing test data...")
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

    // 0. Create test channel and user
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

    // Update channel with system prompt
    await prisma.channel.update({
      where: { id: channel.id },
      data: { systemPrompt: "You are a helpful AI assistant for testing purposes." }
    })

    console.log("Created channel:", channel.id)
    console.log("Created user:", user.id)

    // Create bot user
    console.log("\nCreating bot user...")
    const botUser = await prisma.user.create({
      data: {
        id: "bot",
        name: "AI Assistant",
        email: "bot@example.com",
        avatar: "🤖",
        isOnline: true,
        lastActiveAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    })
    console.log("Created bot user:", botUser.id)

    // 1. Create a test message
    console.log("\nCreating test message...")
    const message = await prisma.message.create({
      data: {
        id: `msg_test_${Date.now()}`,
        content: "This is a test message about artificial intelligence and machine learning.",
        senderId: user.id,
        channelId: channel.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    })
    console.log("Created message:", message.id)

    // 2. Test embedding
    console.log("\nTesting embedding...")
    await embedMessage(message.id)
    console.log("Embedding complete")

    // 3. Test bot response
    console.log("\nTesting bot response...")
    const botResponse = await generateBotResponse(
      message.id,
      "@channel-bot what do you know about AI?",
      channel.id,
      false
    )
    console.log("Bot response:", botResponse)

    // 4. Test threaded response
    console.log("\nTesting threaded response...")
    const threadedResponse = await handleBotResponse(
      message.id,
      "@channel-bot what do you know about AI?",
      channel.id,
      false
    )
    console.log("Threaded response:", threadedResponse)

    // Cleanup
    console.log("\nCleaning up...")
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
testRAG().catch(console.error) 