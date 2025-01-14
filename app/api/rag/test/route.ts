import { NextResponse } from 'next/server';
import { queryMessages } from '@/lib/rag';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';
    const channelId = searchParams.get('channelId');
    
    const results = await queryMessages(query, channelId || undefined);
    
    return NextResponse.json(results);
  } catch (error) {
    console.error('Error querying messages:', error);
    return NextResponse.json(
      { error: 'Failed to query messages' },
      { status: 500 }
    );
  }
} 