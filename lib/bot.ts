import { prisma } from './db';

const BOT_USER_ID = 'bot_user';

export async function initBotUser() {
  try {
    // Try to find existing bot user
    let botUser = await prisma.user.findUnique({
      where: { id: BOT_USER_ID }
    });

    // Create bot user if it doesn't exist
    if (!botUser) {
      console.log('[BOT] Creating bot user...');
      botUser = await prisma.user.create({
        data: {
          id: BOT_USER_ID,
          name: 'Bot',
          email: 'bot@example.com',
          avatar: null,
          status: 'online',
          isOnline: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      });
      console.log('[BOT] Bot user created');
    }

    // Get all channels
    const channels = await prisma.channel.findMany();

    // Add bot to all channels it's not already in
    for (const channel of channels) {
      const membership = await prisma.channelMembership.findFirst({
        where: {
          channelId: channel.id,
          userId: BOT_USER_ID
        }
      });

      if (!membership) {
        console.log(`[BOT] Adding bot to channel: ${channel.name}`);
        await prisma.channelMembership.create({
          data: {
            id: `bot_membership_${channel.id}`,
            channelId: channel.id,
            userId: BOT_USER_ID,
            createdAt: new Date()
          }
        });
      }
    }

    console.log('[BOT] Bot user initialization complete');
    return botUser;
  } catch (error) {
    console.error('[BOT] Error initializing bot user:', error);
    throw error;
  }
}

// Export bot ID for use in other parts of the app
export const getBotId = () => BOT_USER_ID; 