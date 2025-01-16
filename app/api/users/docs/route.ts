import { NextRequest, NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { auth } from "@clerk/nextjs/server"
import { prisma } from '@/lib/db'
import { processUserPdf } from '@/lib/pdfUserDocs'
import { randomUUID } from 'crypto'

const s3Client = new S3Client({
  region: process.env.S3_REGION,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!,
  },
})

export async function GET(req: NextRequest) {
  try {
    // Check auth
    const session = await auth()
    if (!session?.userId) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Fetch user's documents
    const documents = await prisma.userDocument.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(documents)
  } catch (error) {
    console.error('Error fetching documents:', error)
    return new NextResponse(
      JSON.stringify({ 
        error: 'Failed to fetch documents',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    // Check auth
    const session = await auth()
    if (!session?.userId) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Parse form data
    const formData = await req.formData()
    const file = formData.get('file') as File
    if (!file) {
      return new NextResponse(
        JSON.stringify({ error: 'No file provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      return new NextResponse(
        JSON.stringify({ error: 'Only PDF files are supported' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Create a unique filename
    const bytes = new Uint8Array(8)
    crypto.getRandomValues(bytes)
    const uniqueId = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
    const key = `users/${session.userId}/docs/${uniqueId}-${file.name}`
    
    // Convert file to buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer())

    // Upload to S3
    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key,
        Body: fileBuffer,
        ContentType: file.type,
      })
    )

    // Generate the S3 URL
    const fileUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.S3_REGION}.amazonaws.com/${key}`
    
    // Create document record
    const documentId = randomUUID()
    const document = await prisma.userDocument.create({
      data: {
        id: documentId,
        userId: session.userId,
        filename: file.name,
        fileUrl,
        contentType: file.type,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    })

    // Process PDF in background
    processUserPdf(session.userId, documentId, fileUrl, file.name)
      .catch(error => console.error('Error processing PDF:', error))
    
    return NextResponse.json({ 
      documentId: document.id,
      filename: document.filename,
      fileUrl: document.fileUrl,
      contentType: document.contentType
    })
  } catch (error) {
    console.error('Upload error:', error)
    return new NextResponse(
      JSON.stringify({ 
        error: 'Upload failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
} 