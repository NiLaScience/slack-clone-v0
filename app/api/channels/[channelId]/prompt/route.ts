import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function PUT(request: NextRequest) {
  try {
    const { prompt } = await request.json();
    const channelId = request.nextUrl.pathname.split('/')[3]; // Get channelId from URL

    // Update channel prompt
    const updatedChannel = await prisma.channel.update({
      where: { id: channelId },
      data: { prompt }
    });

    return NextResponse.json(updatedChannel);
  } catch (error) {
    console.error('Failed to update channel prompt:', error);
    return new NextResponse(
      JSON.stringify({
        error: 'Failed to update channel prompt',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 