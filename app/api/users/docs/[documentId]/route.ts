import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from "@clerk/nextjs/server"
import { prisma } from '@/lib/db'
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3"
import { emitDataUpdate } from '@/lib/socket'

const s3Client = new S3Client({
  region: process.env.S3_REGION,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!,
  },
})

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = getAuth(request)
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Extract `documentId` from the URL
    const url = new URL(request.url)
    const documentId = url.pathname.split('/').pop()

    if (!documentId) {
      return new NextResponse(
        JSON.stringify({ error: 'Document ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Verify document exists and belongs to user
    const document = await prisma.userDocument.findUnique({
      where: { id: documentId }
    })

    if (!document) {
      return new NextResponse(
        JSON.stringify({ error: 'Document not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (document.userId !== userId) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Extract S3 key from fileUrl
    const urlParts = document.fileUrl.split('.amazonaws.com/')
    const key = urlParts[1]

    // Delete from S3
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key,
      })
    )

    // Delete from database
    await prisma.userDocument.delete({
      where: { id: documentId }
    })

    // Notify clients about the deleted document
    await emitDataUpdate({
      type: 'document-deleted',
      userId,
      data: {
        id: documentId
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete error:', error)
    return new NextResponse(
      JSON.stringify({ error: 'Failed to delete document', details: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
