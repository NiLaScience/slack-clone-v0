import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// This endpoint should be called by a cron job (e.g., every hour)
// It should be protected by a secret header to prevent unauthorized access
export async function POST(req: Request) {
  try {
    // Verify secret header
    const authHeader = req.headers.get('x-cron-secret')
    if (authHeader !== process.env.CRON_SECRET) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Find all DM channels
    const dmChannels = await prisma.channel.findMany({
      where: {
        isDM: true,
        isSelfNote: false
      },
      include: {
        memberships: true
      }
    })

    // Group channels by their member pairs
    const channelsByMembers = new Map<string, typeof dmChannels>()
    for (const channel of dmChannels) {
      const memberIds = channel.memberships
        .map(m => m.userId)
        .sort()
        .join('_')
      
      if (!channelsByMembers.has(memberIds)) {
        channelsByMembers.set(memberIds, [])
      }
      channelsByMembers.get(memberIds)?.push(channel)
    }

    // Find and clean up duplicates
    const cleanupPromises: Promise<any>[] = []
    for (const [memberIds, channels] of channelsByMembers.entries()) {
      if (channels.length > 1) {
        // Keep the oldest channel, delete others
        const [keepChannel, ...duplicates] = channels.sort(
          (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
        )

        // For each duplicate channel
        for (const dupChannel of duplicates) {
          cleanupPromises.push(
            prisma.$transaction([
              // Move all messages to the kept channel
              prisma.message.updateMany({
                where: { channelId: dupChannel.id },
                data: { channelId: keepChannel.id }
              }),
              // Delete memberships of duplicate channel
              prisma.channelMembership.deleteMany({
                where: { channelId: dupChannel.id }
              }),
              // Delete the duplicate channel
              prisma.channel.delete({
                where: { id: dupChannel.id }
              })
            ])
          )
        }
      }
    }

    // Find and clean up orphaned self-note channels
    const selfNoteChannels = await prisma.channel.findMany({
      where: {
        isDM: true,
        isSelfNote: true
      },
      include: {
        memberships: true
      }
    })

    for (const channel of selfNoteChannels) {
      // If channel has no members or more than one member
      if (channel.memberships.length !== 1) {
        cleanupPromises.push(
          prisma.channel.delete({
            where: { id: channel.id }
          })
        )
      }
    }

    // Execute all cleanup operations
    await Promise.all(cleanupPromises)

    return NextResponse.json({
      success: true,
      duplicatesCleaned: cleanupPromises.length
    })
  } catch (error) {
    console.error('Failed to clean up DM channels:', error)
    return NextResponse.json(
      { 
        error: 'Failed to clean up DM channels',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 