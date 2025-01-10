import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'

const EMOJI_LIST = ["👋", "😊", "🌟", "🎮", "🎨", "🎭", "🎪", "🎯", "🎲", "🎸", "🎺", "🎻", "🎹", "🎼", "🎧", "🎤", "🎬", "📷", "📸", "🎥"];
const ADJECTIVES = ["Happy", "Clever", "Swift", "Bright", "Cool", "Epic", "Fun", "Super", "Mega", "Ultra"];
const NOUNS = ["Coder", "Dev", "Ninja", "Wizard", "Hero", "Star", "Ace", "Pro", "Master", "Champion"];
const DEFAULT_CHANNELS = ['general', 'random']

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
    const user = await currentUser();
    console.log('Creating profile for user:', userId);
    console.log('Clerk user data:', user);
    
    if (!userId || !user) {
      console.log('Unauthorized: userId or user is null', { userId, user });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const primaryEmail = user.emailAddresses.find(email => email.id === user.primaryEmailAddressId)?.emailAddress;
    console.log('Primary email:', primaryEmail);
    
    if (!primaryEmail) {
      console.log('No email found for user');
      return NextResponse.json({ error: "No email found" }, { status: 400 });
    }

    // Ensure default channels exist
    console.log('Checking for default channels');
    await Promise.all(DEFAULT_CHANNELS.map(async (channelName: string) => {
      const existingChannel = await prisma.channel.findFirst({
        where: { name: channelName }
      });

      if (!existingChannel) {
        console.log(`Creating ${channelName} channel`);
        await prisma.channel.create({
          data: {
            id: `ch_${Date.now()}_${Math.random().toString(36).slice(2)}`,
            name: channelName,
            isPrivate: false,
            isDM: false,
            isSelfNote: false,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });
      } else {
        console.log(`Channel ${channelName} already exists:`, existingChannel);
      }
    }));

    // Generate random name and avatar
    console.log('Generating random name and avatar');
    const randomAdjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const randomNoun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
    const randomName = `${randomAdjective}${randomNoun}`;
    const randomEmoji = EMOJI_LIST[Math.floor(Math.random() * EMOJI_LIST.length)];

    // Create or update user
    console.log('Creating/updating user with data:', { userId, randomName, randomEmoji, email: primaryEmail });
    const dbUser = await prisma.user.upsert({
      where: { id: userId },
      create: {
        id: userId,
        name: randomName,
        email: primaryEmail,
        avatar: randomEmoji,
        status: "Online",
        isOnline: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      update: {
        name: randomName,
        avatar: randomEmoji,
        status: "Online",
        isOnline: true,
        updatedAt: new Date()
      }
    });
    console.log('Created/updated user:', dbUser);

    // Join default channels
    console.log('Creating default channel memberships');
    await Promise.all(DEFAULT_CHANNELS.map(async (channelName: string) => {
      const channel = await prisma.channel.findFirst({
        where: { name: channelName }
      });
      if (channel) {
        console.log(`Creating membership for channel ${channelName}`);
        await prisma.channelMembership.create({
          data: {
            id: `membership_${Date.now()}_${Math.random().toString(36).slice(2)}`,
            channelId: channel.id,
            userId: dbUser.id,
            createdAt: new Date()
          }
        });
      }
    }));

    // Create a self-note channel
    const selfChannelName = `dm_${dbUser.id}`;
    console.log('Creating self-note channel:', selfChannelName);
    
    // Check if self-note channel already exists
    console.log('Checking for existing self-note channel');
    const existingSelfNote = await prisma.channel.findFirst({
      where: {
        isDM: true,
        isSelfNote: true,
        memberships: {
          some: { userId: dbUser.id }
        }
      },
      include: {
        memberships: true
      }
    });
    console.log('Existing self-note channel:', existingSelfNote);

    if (existingSelfNote) {
      console.log('Found existing self-note channel, checking members');
      // Ensure only the owner is a member
      const otherMembers = existingSelfNote.memberships.filter(
        (m: { id: string; userId: string }) => m.userId !== dbUser.id
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
      const selfNoteChannel = await prisma.channel.create({
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
              userId: dbUser.id,
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

    // Create DM channels with all existing users
    console.log('Creating DM channels with existing users');
    const existingUsers = await prisma.user.findMany({
      where: {
        id: { not: dbUser.id }
      }
    });
    console.log('Found existing users:', existingUsers);

    await Promise.all(existingUsers.map(async (otherUser) => {
      // Check if DM channel already exists
      const existingDM = await prisma.channel.findFirst({
        where: {
          isDM: true,
          isSelfNote: false,
          AND: [
            {
              memberships: {
                some: { userId: dbUser.id }
              }
            },
            {
              memberships: {
                some: { userId: otherUser.id }
              }
            }
          ]
        }
      });

      if (!existingDM) {
        console.log(`Creating DM channel between ${dbUser.id} and ${otherUser.id}`);
        // Create new DM channel
        const dmChannel = await prisma.channel.create({
          data: {
            id: `ch_dm_${Date.now()}_${Math.random().toString(36).slice(2)}`,
            name: `dm_${dbUser.id}_${otherUser.id}`,
            isPrivate: true,
            isDM: true,
            isSelfNote: false,
            createdAt: new Date(),
            updatedAt: new Date(),
            memberships: {
              create: [
                {
                  id: `membership_${Date.now()}_${Math.random().toString(36).slice(2)}`,
                  userId: dbUser.id,
                  createdAt: new Date()
                },
                {
                  id: `membership_${Date.now()}_${Math.random().toString(36).slice(2)}`,
                  userId: otherUser.id,
                  createdAt: new Date()
                }
              ]
            }
          }
        });
        console.log('Created DM channel:', dmChannel);
      } else {
        console.log(`DM channel already exists between ${dbUser.id} and ${otherUser.id}`);
      }
    }));

    console.log('Successfully created user profile');
    return NextResponse.json(dbUser);
  } catch (error) {
    console.error("Error creating user profile:", error instanceof Error ? {
      message: error.message,
      stack: error.stack
    } : error);
    
    return NextResponse.json(
      { 
        error: "Failed to create user profile",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 