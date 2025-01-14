import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to process PDF:', error);
    return new NextResponse(
      JSON.stringify({
        error: 'Failed to process PDF',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 