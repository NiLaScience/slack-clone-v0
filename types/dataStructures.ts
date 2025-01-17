export type User = {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  status: string | null;
  isOnline: boolean;
  isBot: boolean;
  prompt: string | null;
  voiceId?: string;
  voiceSampleUrl?: string;
  voiceStatus?: string;
  lastActiveAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

export interface Channel {
  id: string;
  name: string;
  isPrivate: boolean;
  isDM: boolean;
  isSelfNote: boolean;
  prompt: string | null;
  voiceId: string | null;
  voiceSampleUrl: string | null;
  voiceStatus: string | null;
  createdAt: Date;
  updatedAt: Date;
  memberIds?: string[];
  memberships?: ChannelMembership[];
}

export interface ChannelMembership {
  id: string;
  channelId: string;
  userId: string;
  createdAt: Date;
}

export type Message = {
  id: string;
  content: string;
  senderId: string;
  channelId: string;
  parentMessageId?: string;
  createdAt: Date;
  editedAt?: Date;
  isDeleted?: boolean;
  reactions?: Reaction[];
  attachments?: Attachment[];
};

export interface Reaction {
  id: string;
  messageId: string;
  userId: string;
  emoji: string;
  createdAt: Date;
}

export interface Attachment {
  id: string;
  messageId: string;
  filename: string;
  fileUrl: string;
  contentType: string;
  createdAt: Date;
}

export interface UserDocument {
  id: string;
  userId: string;
  filename: string;
  fileUrl: string;
  contentType: string;
  createdAt: Date;
  updatedAt: Date;
}

