import { NextResponse } from 'next/server';
import { Pinecone } from "@pinecone-database/pinecone";

export async function POST() {
  try {
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });

    const index = pinecone.index("messages");
    
    // Delete all vectors in the index
    await index.deleteAll();
    
    return NextResponse.json({ message: 'Index reset successfully' });
  } catch (error) {
    console.error('Error resetting index:', error);
    return NextResponse.json(
      { 
        error: 'Failed to reset index',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 