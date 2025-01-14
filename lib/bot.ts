import { prisma } from './db';
import OpenAI from 'openai';
import { queryMessages } from './rag';

const BOT_USER_ID = 'bot_user';
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface BotResponseParams {
  id: string;
  content: string;
  channelId: string;
  senderId: string;
}

export async function handleBotResponse(message: BotResponseParams) {
  try {
    console.log('[BOT] Starting response generation for message:', message.id);

    // Get channel info
    const channel = await prisma.channel.findUnique({
      where: { id: message.channelId },
      include: {
        memberships: true
      }
    });

    if (!channel) {
      console.error('[BOT] Channel not found:', message.channelId);
      return;
    }

    const channelPrompt = channel.prompt || "You are a helpful assistant in a Slack-like chat. Keep responses concise and conversational.";
    console.log('[BOT] Using channel prompt:', channelPrompt);

    console.log('[BOT] Querying Pinecone for context with:', {
      content: message.content,
      channelId: message.channelId
    });

    // Query Pinecone for relevant context
    const relevantMessages = await queryMessages(message.content, message.channelId);
    console.log('[BOT] Pinecone results:', JSON.stringify(relevantMessages, null, 2));

    const context = relevantMessages?.map(m => m.text).join('\n\n') || '';
    console.log('[BOT] Assembled context:', context);

    console.log('[BOT] Calling OpenAI with context length:', context.length);
    const response = await openai.chat.completions.create({
      model: "gpt-4-0125-preview",
      messages: [
        { 
          role: "system", 
          content: `${channelPrompt}\n\nBelow is relevant context from previous messages in this channel:\n\n${context}`
        },
        { 
          role: "user", 
          content: message.content 
        }
      ],
    });

    const botResponse = response.choices[0]?.message?.content;
    console.log('[BOT] Generated response:', botResponse);

    if (!botResponse) {
      console.log('[BOT] No response generated, returning');
      return;
    }

    console.log('[BOT] Creating message in database');

    // For DMs, get the other user's ID to post as them
    let senderId = BOT_USER_ID;
    if (channel.isDM) {
      // Get the ID of the user who didn't send the original message
      const otherUserId = channel.memberships.find(m => m.userId !== message.senderId)?.userId;
      if (otherUserId) {
        senderId = otherUserId;
      }
    }

    // Create bot's response message
    await prisma.message.create({
      data: {
        id: `msg_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        content: botResponse,
        channelId: message.channelId,
        senderId: senderId,
        parentMessageId: message.id, // Link to the original message
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    });
    console.log('[BOT] Message created successfully');

  } catch (error) {
    console.error('[BOT] Error generating response:', error);
    // Log the full error details
    if (error instanceof Error) {
      console.error('[BOT] Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        cause: error.cause
      });
    }
  }
}

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
          avatar: '🤖',
          status: 'online',
          isOnline: true,
          isBot: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      });
      console.log('[BOT] Bot user created');
    }

    // Get only public channels (not DMs or private channels)
    const channels = await prisma.channel.findMany({
      where: {
        isDM: false,
        isPrivate: false,
      }
    });

    // Add bot to all public channels it's not already in
    for (const channel of channels) {
      const membership = await prisma.channelMembership.findFirst({
        where: {
          channelId: channel.id,
          userId: BOT_USER_ID
        }
      });

      if (!membership) {
        console.log(`[BOT] Adding bot to public channel: ${channel.name}`);
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