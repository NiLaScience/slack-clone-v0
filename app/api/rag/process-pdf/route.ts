import { NextRequest, NextResponse } from 'next/server';
import { processPdfAttachment } from '@/lib/pdf';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('[PDF] Processing request:', body);
    
    const { messageId, channelId, senderId, attachmentId, filename, url } = body;
    
    // Process PDF using existing logic
    await processPdfAttachment(
      messageId,
      channelId,
      senderId,
      attachmentId,
      url,
      filename,
      true // isDM - we can get this from the channel later if needed
    );

    console.log('[PDF] Processing complete:', {
      filename,
      messageId,
      channelId
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[PDF] Processing failed:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
} 