import { prisma } from '../lib/db';
import { handleBotResponse } from '../lib/bot';

async function main() {
  // Create a test channel
  const channel = await prisma.channel.create({
    data: {
      id: `ch_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      name: 'test-bot-channel',
      isPrivate: false,
      isDM: false,
      isSelfNote: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  });

  console.log('Created channel:', channel);

  // Create a test user
  const user = await prisma.user.create({
    data: {
      id: `user_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      name: 'Test User',
      email: 'test@example.com',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  });

  console.log('Created user:', user);

  // Create channel membership
  await prisma.channelMembership.create({
    data: {
      id: `membership_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      channelId: channel.id,
      userId: user.id,
      createdAt: new Date(),
    }
  });

  // Create a test message
  const message = await prisma.message.create({
    data: {
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      content: "What is the meaning of life?",
      channelId: channel.id,
      senderId: user.id,
      askBot: true,
    }
  });

  console.log('Created message:', message);

  // Trigger bot response
  await handleBotResponse({
    id: message.id,
    content: message.content,
    channelId: message.channelId,
    senderId: message.senderId
  });

  console.log('Bot response triggered');

  // Wait a bit and fetch the bot's response
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  const botResponse = await prisma.message.findFirst({
    where: {
      parentMessageId: message.id
    }
  });

  console.log('Bot response:', botResponse);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  }); 