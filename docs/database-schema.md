# Database Schema Documentation

## Overview

The application uses Prisma as the ORM with a PostgreSQL database. The schema is designed to support real-time chat functionality with channels, direct messages, threads, and reactions.

## Models

### User
```prisma
model User {
  id        String   @id
  name      String
  avatar    String
  status    String?
  isOnline  Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  messages    Message[]
  reactions   Reaction[]
  memberships ChannelMembership[]
}
```
- Managed through `/api/users/*` endpoints
- Clerk authentication integration
- Real-time online status tracking
- Custom status messages and avatars

### Channel
```prisma
model Channel {
  id         String   @id
  name       String
  isPrivate  Boolean  @default(false)
  isDM       Boolean  @default(false)
  isSelfNote Boolean  @default(false)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  // Relations
  messages    Message[]
  memberships ChannelMembership[]
}
```
- Managed through `/api/channels` endpoints
- Supports public, private, and DM channels
- Special handling for self-note channels
- Real-time membership updates

### Message
```prisma
model Message {
  id             String      @id
  content        String
  senderId       String
  channelId      String
  parentMessageId String?
  isDeleted      Boolean     @default(false)
  editedAt       DateTime?
  createdAt      DateTime    @default(now())

  // Relations
  sender      User          @relation(fields: [senderId], references: [id])
  channel     Channel       @relation(fields: [channelId], references: [id])
  parent      Message?      @relation("ThreadMessages", fields: [parentMessageId], references: [id])
  replies     Message[]     @relation("ThreadMessages")
  reactions   Reaction[]
  attachments Attachment[]
}
```
- Managed through `/api/messages/*` endpoints
- Supports threading via self-referential relation
- Soft deletion for message history
- Real-time updates via Socket.IO

### Reaction
```prisma
model Reaction {
  id        String   @id
  emoji     String
  messageId String
  userId    String
  createdAt DateTime @default(now())

  // Relations
  message Message @relation(fields: [messageId], references: [id])
  user    User    @relation(fields: [userId], references: [id])
}
```
- Managed through `/api/reactions` endpoint
- Real-time reaction updates
- Unique reactions per user per message
- Emoji support

### ChannelMembership
```prisma
model ChannelMembership {
  id        String   @id
  channelId String
  userId    String
  createdAt DateTime @default(now())

  // Relations
  channel Channel @relation(fields: [channelId], references: [id])
  user    User    @relation(fields: [userId], references: [id])
}
```
- Managed through channel join/leave operations
- Tracks channel access permissions
- Used for DM channel management
- Real-time membership updates

### Attachment
```prisma
model Attachment {
  id          String   @id
  filename    String
  fileUrl     String
  contentType String
  messageId   String
  createdAt   DateTime @default(now())

  // Relations
  message Message @relation(fields: [messageId], references: [id])
}
```
- Managed through file upload endpoint
- Supports various file types
- Searchable through global search
- Secure URL generation

## Database Interactions

### Message Operations
1. Creation
   - Validates channel membership
   - Creates attachments if present
   - Triggers real-time updates
   - Updates thread if parent exists

2. Updates
   - Validates message ownership
   - Maintains edit history
   - Real-time broadcast
   - Thread consistency

3. Deletion
   - Soft delete only
   - Maintains thread structure
   - Preserves reactions
   - Real-time notification

### Channel Operations
1. Creation
   - Validates unique names
   - Creates initial membership
   - Handles DM special cases
   - Real-time sidebar update

2. Membership
   - Validates access rights
   - Updates member list
   - Real-time status
   - DM channel handling

### User Operations
1. Profile
   - Clerk integration
   - Default channel joining
   - Self-note creation
   - Real-time updates

2. Status
   - Online presence
   - Custom status messages
   - Real-time broadcasts
   - Session management

## Indexing Strategy

### Performance Indexes
```prisma
@@index([channelId])
@@index([senderId])
@@index([parentMessageId])
@@index([messageId])
```

### Unique Constraints
```prisma
@@unique([userId, channelId])
@@unique([userId, messageId, emoji])
```

## Data Integrity

1. Cascading Deletes
   - Soft deletes for messages
   - Cascade for reactions
   - Preserve thread structure
   - Maintain history

2. Foreign Keys
   - User references
   - Channel references
   - Message threading
   - Attachment links

3. Default Values
   - Timestamps
   - Online status
   - Soft delete flags
   - Privacy settings 