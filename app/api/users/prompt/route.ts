import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

export async function PATCH(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { prompt } = await req.json();

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { prompt }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Failed to update user prompt:', error);
    return new NextResponse(
      JSON.stringify({
        error: 'Failed to update user prompt',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 