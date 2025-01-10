import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function validateChannelOperation(
  channelId: string,
  operation: 'join' | 'create' | 'update' | 'delete',
  data?: any
) {
  // Get channel details
  const channel = await prisma.channel.findUnique({
    where: { id: channelId },
    include: {
      memberships: true
    }
  });

  if (!channel) {
    return {
      error: "Channel not found",
      status: 404
    };
  }

  // Self-note channel validations
  if (channel.isSelfNote) {
    // Prevent adding members to self-note channels
    if (operation === 'join' || (operation === 'update' && data?.addMemberIds?.length)) {
      return {
        error: "Cannot add members to self-note channels",
        status: 400
      };
    }

    // Ensure only one member exists
    if (channel.memberships.length > 1) {
      // Clean up extra members
      const owner = channel.memberships[0];
      if (owner) {
        await Promise.all(
          channel.memberships
            .slice(1)
            .map(m => prisma.channelMembership.delete({ where: { id: m.id } }))
        );
      }
    }
  }

  // DM channel validations
  if (channel.isDM && !channel.isSelfNote) {
    // Prevent adding/removing members from DM channels
    if (operation === 'join' || operation === 'update') {
      return {
        error: "Cannot modify members in DM channels",
        status: 400
      };
    }
  }

  return null; // No validation errors
}

export async function validateChannelCreation(data: {
  name: string;
  isDM: boolean;
  isSelfNote: boolean;
  memberIds?: string[];
}) {
  // Validate self-note channel creation
  if (data.isSelfNote) {
    if (!data.memberIds || data.memberIds.length !== 1) {
      return {
        error: "Self-note channels must have exactly one member",
        status: 400
      };
    }

    // Check if user already has a self-note channel
    const existingSelfNote = await prisma.channel.findFirst({
      where: {
        isSelfNote: true,
        memberships: {
          some: {
            userId: data.memberIds[0]
          }
        }
      }
    });

    if (existingSelfNote) {
      return {
        error: "User already has a self-note channel",
        status: 400
      };
    }
  }

  // Validate DM channel creation
  if (data.isDM && !data.isSelfNote) {
    if (!data.memberIds || data.memberIds.length !== 2) {
      return {
        error: "DM channels must have exactly two members",
        status: 400
      };
    }

    // Check for existing DM channel between these users
    const existingDM = await prisma.channel.findFirst({
      where: {
        isDM: true,
        isSelfNote: false,
        AND: [
          {
            memberships: {
              some: {
                userId: data.memberIds[0]
              }
            }
          },
          {
            memberships: {
              some: {
                userId: data.memberIds[1]
              }
            }
          }
        ]
      }
    });

    if (existingDM) {
      return {
        error: "DM channel already exists between these users",
        status: 400
      };
    }
  }

  return null; // No validation errors
} 