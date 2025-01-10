# Actions Documentation

## Message Actions

### Send Message
- Function: `handleSendMessage`
- Supports text content and file attachments
- Creates message in database
- Triggers real-time update via Socket.IO
- Handles thread context if replying

### Edit Message
- Function: `handleEditMessage`
- Only available to message author
- Updates message content
- Preserves thread context
- Marks message as edited

### Delete Message
- Function: `handleDeleteMessage`
- Soft delete (preserves thread structure)
- Only available to message author
- Clears message content
- Maintains reactions and attachments

### React to Message
- Function: `handleReact`
- Toggles emoji reaction
- Updates reaction count
- Real-time update to all users
- Supports multiple reactions per user

## Channel Actions

### Create Channel
- Function: `handleCreateChannel`
- Creates public or private channels
- Automatically joins creator
- Supports DM channels
- Real-time update to sidebar

### Join Channel
- Function: `handleSelectChannel`
- Automatic join on channel selection
- Updates channel membership
- Loads channel messages
- Real-time member list update

### Create DM Channel
- Function: `handleSelectUser`
- Creates or retrieves DM channel
- Supports multi-user DMs
- Handles self-notes
- Real-time status updates

## User Actions

### Update Status
- Function: `handleSetUserStatus`
- Updates user status message
- Real-time status broadcast
- Persists across sessions

### Set Avatar
- Function: `handleSetUserAvatar`
- Updates user emoji avatar
- Real-time update to all views
- Persists across sessions

### Update Username
- Function: `handleSetUserName`
- Updates display name
- Real-time update in all views
- Persists across sessions

### Online Status
- Automatic online/offline tracking
- Updates on page load/unload
- Uses `beforeunload` event
- Real-time status broadcast

## Search Actions

### Global Search
- Full-text message search
- File attachment search
- Jump to message context
- Preserves thread context

## Real-time Updates

### Socket.IO Events
- `data-update`: General state update
- `join-channel`: Channel subscription
- `disconnect`: Cleanup handlers
- Error handling and reconnection

### Data Polling
- Fallback for Socket.IO
- 3-second interval
- Optimized for changes only
- Handles connection issues

## State Management

### Local State
- React useState for UI state
- Cached message data
- Current channel/thread
- Search results

### Server State
- Prisma database state
- User sessions (Clerk)
- File storage
- Channel memberships

### Real-time State
- Socket.IO for live updates
- Online status tracking
- Message delivery status
- Typing indicators 