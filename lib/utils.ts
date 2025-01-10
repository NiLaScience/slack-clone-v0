import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getChannelDisplayName(
  channel: { 
    name: string; 
    isDM: boolean; 
    memberIds: string[];
  },
  currentUserId: string,
  users: { id: string; name: string }[]
): string {
  // For normal channels
  if (!channel.isDM) return channel.name;

  // For DM channels, check member count
  if (channel.memberIds.length === 1 && channel.memberIds[0] === currentUserId) {
    return "Note to Self";
  }

  // If there's another user
  const otherUserId = channel.memberIds.find(id => id !== currentUserId);
  if (!otherUserId) return "Note to Self";

  const otherUser = users.find(u => u.id === otherUserId);
  return otherUser?.name ?? "Unknown User";
}
