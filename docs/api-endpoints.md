# API Endpoints Documentation

## Authentication

All endpoints are protected by Clerk authentication middleware unless specified. Requests must include a valid JWT token in the Authorization header.

## Message Endpoints

### `/api/messages`
- **GET**: List messages for a channel
  - Query: `?channelId=string&cursor=string&limit=number`
  - Returns: `{ messages: Message[], nextCursor: string | null }`
  - Pagination: Cursor-based, default limit 50

- **POST**: Create a new message
  - Body: 
    ```typescript
    {
      content: string;
      channelId: string;
      parentMessageId?: string;
      attachments?: File[];
    }
    ```
  - Returns: Created message object with attachments

### `/api/messages/[messageId]`
- **GET**: Fetch a specific message
  - Returns: Message with attachments, sender, and reactions
- **PATCH**: Edit a message
  - Body: `{ content: string }`
  - Returns: Updated message
  - Note: Only message owner can edit
- **DELETE**: Soft delete a message
  - Returns: `{ success: true }`
  - Note: Preserves thread structure

### `/api/messages/thread/[messageId]`
- **GET**: Get thread messages
  - Query: `?cursor=string&limit=number`
  - Returns: `{ messages: Message[], nextCursor: string | null }`
  - Note: Returns replies to the parent message

## Channel Endpoints

### `/api/channels`
- **GET**: List accessible channels
  - Returns: Array of channels with membership info
  - Query: `?type=all|dm|public|private`
- **POST**: Create a new channel
  - Body:
    ```typescript
    {
      name: string;
      isPrivate: boolean;
      isDM: boolean;
      userIds?: string[];
    }
    ```
  - Returns: Created channel object

### `/api/channels/[channelId]`
- **GET**: Get channel details
  - Returns: Channel with members and recent messages
- **PATCH**: Update channel
  - Body: `{ name?: string, isPrivate?: boolean }`
  - Returns: Updated channel
- **DELETE**: Delete channel
  - Note: Only channel admin can delete

### `/api/channels/join`
- **POST**: Join a channel
  - Body: `{ channelId: string }`
  - Returns: Updated channel membership
  - Note: Public channels only

### `/api/channels/leave`
- **POST**: Leave a channel
  - Body: `{ channelId: string }`
  - Returns: `{ success: true }`
  - Note: Cannot leave DM channels

## User Endpoints

### `/api/users/profile`
- **GET**: Get current user profile
  - Returns: User profile with online status
- **PATCH**: Update user profile
  - Body: `{ name?: string, avatar?: string, status?: string }`
  - Returns: Updated user profile

### `/api/users/profile/create`
- **POST**: Create initial user profile
  - Body: Optional profile data
  - Returns: Created user profile
  - Note: Creates default channels

### `/api/users/status`
- **PATCH**: Update user status
  - Body: `{ status: string }`
  - Returns: Updated user object

### `/api/users/online`
- **PATCH**: Update online status
  - Body: `{ isOnline: boolean }`
  - Returns: Updated user object
  - Note: Broadcasts to all connected clients

### `/api/users/search`
- **GET**: Search users
  - Query: `?q=string`
  - Returns: Array of matching users
  - Note: Excludes current user

## Reaction Endpoints

### `/api/reactions`
- **POST**: Add a reaction
  - Body: `{ messageId: string, emoji: string }`
  - Returns: Created reaction
  - Note: One emoji per user per message

- **DELETE**: Remove a reaction
  - Query: `?messageId=string&emoji=string`
  - Returns: `{ success: true }`
  - Note: Can only remove own reactions

## Search Endpoints

### `/api/search`
- **GET**: Global search
  - Query: `?q=string&type=messages|files|all`
  - Returns: 
    ```typescript
    {
      messages: {
        items: Message[];
        total: number;
      };
      files: {
        items: Attachment[];
        total: number;
      };
    }
    ```
  - Note: Searches message content and file names

## File Endpoints

### `/api/upload`
- **POST**: Upload file attachment
  - Body: FormData with file
  - Returns: 
    ```typescript
    {
      id: string;
      filename: string;
      fileUrl: string;
      contentType: string;
    }
    ```
  - Limits: Max 10MB per file
  - Supported types: Images, PDFs, text files

## Real-time Endpoints

### `/api/socket`
- **GET**: Socket.IO connection endpoint
  - Establishes WebSocket connection
  - Authentication: JWT token required
  - Events:
    - `message:new`: New message created
    - `message:update`: Message edited
    - `message:delete`: Message deleted
    - `reaction:new`: Reaction added
    - `reaction:delete`: Reaction removed
    - `user:online`: User status change
    - `channel:update`: Channel updated

### `/api/getData`
- **GET**: Initial data load
  - Returns: 
    ```typescript
    {
      channels: Channel[];
      messages: Message[];
      users: User[];
      reactions: Reaction[];
    }
    ```
  - Note: Used for app initialization

## Response Formats

### Success Response
```typescript
{
  success: true;
  data: T; // Generic type based on endpoint
}
```

### Error Response
```typescript
{
  error: string;
  details?: any;
  code?: string;
}
```

## Status Codes

- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 409: Conflict
- 413: Payload Too Large
- 429: Too Many Requests
- 500: Internal Server Error

## Rate Limiting

- Socket connections: 60 per minute
- API requests: 100 per minute per user
- File uploads: 10 per minute per user
- Search queries: 30 per minute per user

## WebSocket Events

### Server → Client
- `message:new`: New message in subscribed channel
- `message:update`: Message edited
- `message:delete`: Message deleted
- `reaction:new`: New reaction added
- `reaction:delete`: Reaction removed
- `user:online`: User status changed
- `channel:update`: Channel details updated
- `typing:start`: User started typing
- `typing:stop`: User stopped typing

### Client → Server
- `message:send`: Send new message
- `reaction:add`: Add reaction
- `reaction:remove`: Remove reaction
- `typing:start`: Start typing indicator
- `typing:stop`: Stop typing indicator
- `channel:join`: Join channel room
- `channel:leave`: Leave channel room

## Authentication

- Uses Clerk for authentication
- JWT tokens required in Authorization header
- WebSocket connections authenticated via session
- File uploads require authenticated session 