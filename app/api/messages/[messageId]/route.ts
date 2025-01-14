import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const messageId = request.nextUrl.pathname.split('/')[3]; // Get messageId from URL

    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: {
        sender: true,
        attachments: true,
        reactions: true
      }
    });

    if (!message) {
      return new NextResponse(
        JSON.stringify({ error: 'Message not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return NextResponse.json(message);
  } catch (error) {
    console.error('Failed to fetch message:', error);
    return new NextResponse(
      JSON.stringify({
        error: 'Failed to fetch message',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const messageId = request.nextUrl.pathname.split('/')[3]; // Get messageId from URL
    const { content } = await request.json();

    const message = await prisma.message.findUnique({
      where: { id: messageId }
    });

    if (!message) {
      return new NextResponse(
        JSON.stringify({ error: 'Message not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (message.senderId !== userId) {
      return new NextResponse(
        JSON.stringify({ error: 'Not authorized to edit this message' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const updatedMessage = await prisma.message.update({
      where: { id: messageId },
      data: {
        content,
        editedAt: new Date()
      }
    });

    return NextResponse.json({ success: true, message: updatedMessage });
  } catch (error) {
    console.error('Failed to update message:', error);
    return new NextResponse(
      JSON.stringify({
        error: 'Failed to update message',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const messageId = request.nextUrl.pathname.split('/')[3]; // Get messageId from URL

    const message = await prisma.message.findUnique({
      where: { id: messageId }
    });

    if (!message) {
      return new NextResponse(
        JSON.stringify({ error: 'Message not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (message.senderId !== userId) {
      return new NextResponse(
        JSON.stringify({ error: 'Not authorized to delete this message' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Delete all reactions and attachments first
    await prisma.$transaction([
      prisma.reaction.deleteMany({
        where: { messageId }
      }),
      prisma.attachment.deleteMany({
        where: { messageId }
      }),
      prisma.message.delete({
        where: { id: messageId }
      })
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete message:', error);
    return new NextResponse(
      JSON.stringify({
        error: 'Failed to delete message',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 