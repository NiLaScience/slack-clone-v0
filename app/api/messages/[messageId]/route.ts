import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuth } from '@clerk/nextjs/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { messageId: string } }
) {
  try {
    const { messageId } = params

    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: {
        attachments: true,
        sender: true,
        channel: true,
      },
    })

    if (!message) {
      return new NextResponse(
        JSON.stringify({ error: 'Message not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }

    return NextResponse.json(message)
  } catch (error) {
    console.error('Failed to fetch message:', error)
    return new NextResponse(
      JSON.stringify({
        error: 'Failed to fetch message',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { messageId: string } }
) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { content } = body;
    
    if (!content) {
      return NextResponse.json({ success: false, error: "Content is required" }, { status: 400 });
    }

    // Get the existing message
    const existingMessage = await prisma.message.findUnique({
      where: { id: params.messageId },
      include: {
        channel: {
          include: {
            memberships: true
          }
        }
      }
    });

    if (!existingMessage) {
      return NextResponse.json({ success: false, error: "Message not found" }, { status: 404 });
    }

    // Check if user is a member of the channel
    const isMember = existingMessage.channel.memberships.some(m => m.userId === userId);
    if (!isMember) {
      return NextResponse.json({ success: false, error: "You are not a member of this channel" }, { status: 403 });
    }

    // Check if user is the sender
    if (existingMessage.senderId !== userId) {
      return NextResponse.json({ success: false, error: "You can only edit your own messages" }, { status: 403 });
    }

    // Update the message
    const updatedMessage = await prisma.message.update({
      where: { id: params.messageId },
      data: {
        content,
        editedAt: new Date()
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: updatedMessage 
    });
    
  } catch (error) {
    console.error(`[MESSAGE_EDIT] Error editing message ${params.messageId}:`, error);
    
    return NextResponse.json({ 
      success: false,
      error: "Internal Error", 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { messageId: string } }
) {
  try {
    console.log("[MESSAGE_DELETE] Starting delete request for:", params.messageId);
    
    const { userId } = getAuth(req);
    console.log("[MESSAGE_DELETE] User ID:", userId);
    
    if (!userId) {
      console.log("[MESSAGE_DELETE] Unauthorized - no user ID");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const messageId = params.messageId;
    console.log("[MESSAGE_DELETE] Attempting to delete message:", messageId);

    // Get the existing message
    const existingMessage = await prisma.message.findUnique({
      where: { id: messageId },
      include: {
        channel: {
          include: {
            memberships: true
          }
        }
      }
    });

    console.log("[MESSAGE_DELETE] Found message:", existingMessage);

    if (!existingMessage) {
      console.log("[MESSAGE_DELETE] Message not found");
      return NextResponse.json(
        { error: "Message not found" },
        { status: 404 }
      );
    }

    // Check if user is a member of the channel
    const isMember = existingMessage.channel.memberships.some(m => m.userId === userId);
    if (!isMember) {
      console.log("[MESSAGE_DELETE] Forbidden - user is not a channel member");
      return NextResponse.json(
        { error: "You are not a member of this channel" },
        { status: 403 }
      );
    }

    // Check if user is the sender
    if (existingMessage.senderId !== userId) {
      console.log("[MESSAGE_DELETE] Forbidden - message sender:", existingMessage.senderId, "requester:", userId);
      return NextResponse.json(
        { error: "You can only delete your own messages" },
        { status: 403 }
      );
    }

    // Soft delete the message
    const deletedMessage = await prisma.message.update({
      where: { id: messageId },
      data: { 
        isDeleted: true,
        content: ''  // Clear the content for privacy
      }
    });

    console.log("[MESSAGE_DELETE] Successfully soft-deleted message:", deletedMessage);
    
    const response = NextResponse.json({ 
      success: true, 
      message: deletedMessage 
    });
    
    console.log("[MESSAGE_DELETE] Sending response:", response);
    return response;
  } catch (error) {
    console.error("[MESSAGE_DELETE] Error details:", {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    const errorResponse = NextResponse.json({ 
      error: "Internal Error", 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
    
    console.log("[MESSAGE_DELETE] Sending error response:", errorResponse);
    return errorResponse;
  }
} 