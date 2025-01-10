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
    console.log('Creating profile for user:', userId);
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ensure general channel exists
    console.log('Checking for general channel');
    let generalChannel = await prisma.channel.findFirst({
      where: { name: 'general' }
    });

    if (!generalChannel) {
      console.log('Creating general channel');
      generalChannel = await prisma.channel.create({
        data: {
          id: `ch_${Date.now()}_${Math.random().toString(36).slice(2)}`,
          name: 'general',
          isPrivate: false,
          isDM: false,
          isSelfNote: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
    }

    // Generate random name and avatar
    console.log('Generating random name and avatar');
    const randomAdjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const randomNoun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
    const randomName = `${randomAdjective}${randomNoun}`;
    const randomEmoji = EMOJI_LIST[Math.floor(Math.random() * EMOJI_LIST.length)];

    // Create or update user
    console.log('Creating/updating user with data:', { userId, randomName, randomEmoji });
    const user = await prisma.user.upsert({
      where: { id: userId },
      create: {
        id: userId,
        name: randomName,
        avatar: randomEmoji,
        status: "online",
        isOnline: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      update: {
        name: randomName,
        avatar: randomEmoji,
        status: "online",
        isOnline: true,
        updatedAt: new Date()
      }
    });
    console.log('Created/updated user:', user);

    // Create a self-note channel
    const selfChannelName = `dm_${user.id}`;
    console.log('Creating self-note channel:', selfChannelName);
    
    // Check if self-note channel already exists
    console.log('Checking for existing self-note channel');
    let selfNoteChannel = await prisma.channel.findFirst({
      where: {
        isDM: true,
        isSelfNote: true,
        memberships: {
          every: {
            userId: user.id,
          },
        },
      },
      include: {
        memberships: true,
      },
    });
    console.log('Existing self-note channel:', selfNoteChannel);

    if (selfNoteChannel) {
      console.log('Found existing self-note channel, checking members');
      // Ensure only the owner is a member
      const otherMembers = selfNoteChannel.memberships.filter(
        (m: { id: string; userId: string }) => m.userId !== user.id
      );
      if (otherMembers.length > 0) {
        console.log('Removing other members:', otherMembers);
        // Remove other members
        await Promise.all(otherMembers.map((m: { id: string }) => 
          prisma.channelMembership.delete({
            where: { id: m.id }
          })
        ));
      }
    } else {
      console.log('Creating new self-note channel');
      // Create new self-note channel
      selfNoteChannel = await prisma.channel.create({
        data: {
          id: `ch_self_${Date.now()}_${Math.random().toString(36).slice(2)}`,
          name: selfChannelName,
          isPrivate: true,
          isDM: true,
          isSelfNote: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          memberships: {
            create: {
              id: `membership_${Date.now()}_${Math.random().toString(36).slice(2)}`,
              userId: user.id,
              createdAt: new Date()
            }
          }
        },
        include: {
          memberships: true
        }
      });
      console.log('Created self-note channel:', selfNoteChannel);
    }

    // Join general channel
    console.log('Creating general channel membership');
    await prisma.channelMembership.create({
      data: {
        id: `membership_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        channelId: generalChannel.id,
        userId: user.id,
        createdAt: new Date()
      }
    });

    console.log('Successfully created user profile');
    return NextResponse.json(user);
  } catch (error) {
    console.error("Error creating user profile:", {
      error,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { 
        error: "Failed to create user profile",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 