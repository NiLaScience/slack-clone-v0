export interface User {
  id: string;
  name: string;
  avatar: string;
  status?: string;
  isOnline?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Channel {
  id: string;
  name: string;
  isPrivate: boolean;
  isDM: boolean;
  isSelfNote: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChannelMembership {
  id: string;
  channelId: string;
  userId: string;
  createdAt: Date;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  channelId: string;
  parentMessageId?: string;
  createdAt: string;
  attachments?: Attachment[];
  isDeleted?: boolean;
  editedAt?: string;
  editHistory?: {
    content: string;
    editedAt: string;
  }[];
}

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

