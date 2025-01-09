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
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { content } = await req.json();
    const messageId = params.messageId;

    // Get the existing message
    const existingMessage = await prisma.message.findUnique({
      where: { id: messageId }
    });

    if (!existingMessage) {
      return new NextResponse("Message not found", { status: 404 });
    }

    if (existingMessage.senderId !== userId) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Update the message
    const updatedMessage = await prisma.message.update({
      where: { id: messageId },
      data: {
        content,
        editedAt: new Date().toISOString(),
        editHistory: {
          push: {
            content: existingMessage.content,
            editedAt: new Date().toISOString()
          }
        }
      }
    });

    return NextResponse.json(updatedMessage);
  } catch (error) {
    console.error("[MESSAGE_EDIT]", error);
    return new NextResponse("Internal Error", { status: 500 });
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
      where: { id: messageId }
    });

    console.log("[MESSAGE_DELETE] Found message:", existingMessage);

    if (!existingMessage) {
      console.log("[MESSAGE_DELETE] Message not found");
      return NextResponse.json(
        { error: "Message not found" },
        { status: 404 }
      );
    }

    if (existingMessage.senderId !== userId) {
      console.log("[MESSAGE_DELETE] Forbidden - message sender:", existingMessage.senderId, "requester:", userId);
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    // Soft delete the message
    const deletedMessage = await prisma.message.update({
      where: { id: messageId },
      data: { 
        isDeleted: true,
        content: '',  // Clear the content for privacy
        updatedAt: new Date()
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