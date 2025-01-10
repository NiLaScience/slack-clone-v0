# API Endpoints Documentation

## Authentication Endpoints

All endpoints are protected by Clerk authentication middleware unless specified.

## Message Endpoints

### `/api/messages`
- **POST**: Create a new message
  - Body: `{ content: string, channelId: string, parentMessageId?: string, attachments?: Array }`
  - Returns: Created message object

### `/api/messages/[messageId]`
- **GET**: Fetch a specific message
  - Returns: Message with attachments, sender, and channel info
- **PATCH**: Edit a message
  - Body: `{ content: string }`
  - Returns: Updated message
- **DELETE**: Soft delete a message
  - Returns: Success status

## Channel Endpoints

### `/api/channels`
- **GET**: List all accessible channels
  - Returns: Array of channels with membership info
- **POST**: Create a new channel
  - Body: `{ name: string, isPrivate: boolean, isDM: boolean, userIds?: string[] }`
  - Returns: Created channel object

### `/api/channels/join`
- **POST**: Join a channel
  - Body: `{ channelId: string, userId: string }`
  - Returns: Channel object with updated memberships

## User Endpoints

### `/api/users/profile/create`
- **GET**: Check if user profile exists
  - Returns: User profile or 404
- **POST**: Create/update user profile
  - Creates random name and avatar
  - Creates self-note channel
  - Joins general channel
  - Returns: User profile

### `/api/users/status`
- **PATCH**: Update user status
  - Body: `{ status: string }`
  - Returns: Updated user object

### `/api/users/online`
- **PATCH**: Update online status
  - Body: `{ isOnline: boolean }`
  - Returns: Updated user object

## Reaction Endpoints

### `/api/reactions`
- **POST**: Add a reaction
  - Body: `{ messageId: string, emoji: string }`
  - Returns: Created reaction
- **DELETE**: Remove a reaction
  - Body: `{ id: string }`
  - Returns: Success status

## Search Endpoints

### `/api/search`
- **GET**: Search messages and files
  - Query: `?q=search_term`
  - Returns: `{ messages: Array, files: Array }`

## File Endpoints

### `/api/upload`
- **POST**: Upload file attachment
  - Body: FormData with file
  - Returns: File metadata

## Real-time Endpoints

### `/api/socketio`
- **GET**: Socket.IO connection endpoint
  - Establishes WebSocket connection
  - Handles real-time updates

### `/api/getData`
- **GET**: Fetch all updated data
  - Returns: `{ messages, channels, users, reactions }`
  - Used for polling and initial data load

## Response Formats

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "error": "Error message",
  "details": "Detailed error information"
}
```

## Status Codes

- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## Rate Limiting

- Socket connections: 60 per minute
- API requests: 100 per minute per user
- File uploads: 10 per minute per user

## Authentication

- Uses Clerk for authentication
- JWT tokens required in headers
- WebSocket connections authenticated via session
- File uploads require authenticated session 