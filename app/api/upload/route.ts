import { NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { embedPDFAttachment } from '@/lib/embeddings'

const s3Client = new S3Client({
  region: process.env.S3_REGION,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!,
  },
})

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    if (!file) {
      return new NextResponse(
        JSON.stringify({ error: 'No file provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Create a unique filename
    const bytes = new Uint8Array(8)
    crypto.getRandomValues(bytes)
    const uniqueId = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
    const key = `${uniqueId}-${file.name}`
    
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

    // Note: We can't embed the PDF here since we don't have the attachment ID yet
    // The message creation endpoint will create the attachment record
    // Then the message embedding process will handle embedding any PDF attachments
    
    return NextResponse.json({ 
      filename: file.name,
      fileUrl,
      contentType: file.type
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