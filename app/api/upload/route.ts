import { NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import { join } from 'path'

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
    const fileName = `${uniqueId}-${file.name}`
    
    // Save the file
    const bytes2 = await file.arrayBuffer()
    const buffer = Buffer.from(bytes2)
    
    // Save to public/uploads directory
    const path = join(process.cwd(), 'public/uploads', fileName)
    await writeFile(path, buffer)
    
    // Return the public URL
    const fileUrl = `/uploads/${fileName}`
    
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