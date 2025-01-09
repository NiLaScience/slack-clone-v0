import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'

const EMOJI_LIST = ["👋", "😊", "🌟", "🎮", "🎨", "🎭", "🎪", "🎯", "🎲", "🎸", "🎺", "🎻", "🎹", "🎼", "🎧", "🎤", "🎬", "📷", "📸", "🎥"];
const ADJECTIVES = ["Happy", "Clever", "Swift", "Bright", "Cool", "Epic", "Fun", "Super", "Mega", "Ultra"];
const NOUNS = ["Coder", "Dev", "Ninja", "Wizard", "Hero", "Star", "Ace", "Pro", "Master", "Champion"];

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ exists: false }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error checking user profile:", error);
    return NextResponse.json(
      { error: "Failed to check user profile" },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Generate random name and avatar
    const randomAdjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const randomNoun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
    const randomName = `${randomAdjective}${randomNoun}`;
    const randomEmoji = EMOJI_LIST[Math.floor(Math.random() * EMOJI_LIST.length)];

    // Create new user
    const user = await prisma.user.create({
      data: {
        id: userId,
        name: randomName,
        avatar: randomEmoji,
        status: "online",
        isOnline: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    // Create a self-note channel
    const selfChannelName = `dm_self_${user.id}`;
    const selfNoteChannel = await prisma.channel.create({
      data: {
        id: `ch_self_${Date.now()}`,
        name: selfChannelName,
        isPrivate: true,
        isDM: true,
        isSelfNote: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    // Create membership for self-note channel
    await prisma.channelMembership.create({
      data: {
        id: `membership_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        channelId: selfNoteChannel.id,
        userId: user.id,
        createdAt: new Date()
      }
    });

    // Create DM channels with existing users
    const allUsers = await prisma.user.findMany();
    for (const existingUser of allUsers) {
      if (existingUser.id === user.id) continue;

      const sorted = [existingUser.id, user.id].sort();
      const dmName = `dm_${sorted.join('_')}`;
      
      const newDM = await prisma.channel.create({
        data: {
          id: `ch_${Date.now()}`,
          name: dmName,
          isPrivate: true,
          isDM: true,
          isSelfNote: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      // Create memberships for both users
      await prisma.channelMembership.createMany({
        data: [
          {
            id: `membership_${Date.now()}_${Math.random().toString(36).slice(2)}`,
            channelId: newDM.id,
            userId: user.id,
            createdAt: new Date()
          },
          {
            id: `membership_${Date.now()}_${Math.random().toString(36).slice(2)}`,
            channelId: newDM.id,
            userId: existingUser.id,
            createdAt: new Date()
          }
        ]
      });
    }

    // Join "general" channel if it exists
    const generalChannel = await prisma.channel.findFirst({
      where: { name: 'general' }
    });
    if (generalChannel) {
      await prisma.channelMembership.create({
        data: {
          id: `membership_${Date.now()}_${Math.random().toString(36).slice(2)}`,
          channelId: generalChannel.id,
          userId: user.id,
          createdAt: new Date()
        }
      });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error creating user profile:", error);
    return NextResponse.json(
      { error: "Failed to create user profile" },
      { status: 500 }
    );
  }
} 