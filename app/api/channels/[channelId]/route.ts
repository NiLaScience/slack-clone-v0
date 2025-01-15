import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuth } from '@clerk/nextjs/server'
import { emitDataUpdate } from '@/lib/socket'

const PROTECTED_CHANNELS = ['general', 'random']

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = getAuth(request)
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const channelId = request.nextUrl.pathname.split('/')[3]

    // Check if this is a protected channel
    const channel = await prisma.channel.findUnique({
      where: { id: channelId }
    })

    if (!channel) {
      return new NextResponse(
        JSON.stringify({ error: 'Channel not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (PROTECTED_CHANNELS.includes(channel.name)) {
      return new NextResponse(
        JSON.stringify({ error: 'Cannot delete protected channels' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Delete all related data in a transaction
    await prisma.$transaction([
      // Delete all reactions to messages in this channel
      prisma.reaction.deleteMany({
        where: {
          message: {
            channelId
          }
        }
      }),
      // Delete all attachments of messages in this channel
      prisma.attachment.deleteMany({
        where: {
          message: {
            channelId
          }
        }
      }),
      // Delete all messages in the channel
      prisma.message.deleteMany({
        where: {
          channelId
        }
      }),
      // Delete all channel memberships
      prisma.channelMembership.deleteMany({
        where: {
          channelId
        }
      }),
      // Finally delete the channel itself
      prisma.channel.delete({
        where: {
          id: channelId
        }
      })
    ])

    // Notify clients about the channel deletion
    await emitDataUpdate({
      type: 'channel-deleted',
      data: {
        id: channelId,
        name: channel.name
      }
    });

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete channel:', error)
    return new NextResponse(
      JSON.stringify({
        error: 'Failed to delete channel',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const channelId = request.nextUrl.pathname.split('/')[3]; // Get channelId from URL

    const channel = await prisma.channel.findUnique({
      where: { id: channelId },
      include: {
        memberships: true,
        messages: {
          include: {
            sender: true,
            attachments: true,
            reactions: true
          }
        }
      }
    });

    if (!channel) {
      return new NextResponse(
        JSON.stringify({ error: 'Channel not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return NextResponse.json(channel);
  } catch (error) {
    console.error('Failed to fetch channel:', error);
    return new NextResponse(
      JSON.stringify({
        error: 'Failed to fetch channel',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 