export interface User {
  id: string;
  name: string;
  avatar: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Channel {
  id: string;
  name: string;
  isPrivate: boolean;
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
  channelId: string;
  senderId: string;
  content: string;
  parentMessageId: string | null;
  createdAt: Date;
  updatedAt: Date;
  attachments: Attachment[];
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

