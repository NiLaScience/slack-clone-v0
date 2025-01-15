# Socket Implementation Plan

## Current Implementation
- Using Pusher for WebSocket functionality
- Currently sending all data on every update via getData endpoint
- Running into payload size limits

## Transition to Granular Events

### 1. Server-Side Changes ✅

#### Update Socket Types (lib/socket.ts) ✅
```typescript
type UpdateType = 
  | { type: 'message-created'; data: any; channelId: string }
  | { type: 'message-updated'; data: any; channelId: string }
  | { type: 'message-deleted'; data: any; channelId: string }
  | { type: 'reaction-toggled'; data: any; channelId: string }
  | { type: 'user-status-changed'; data: any }
  | { type: 'channel-created'; data: any }
  | { type: 'channel-deleted'; data: any }
  | { type: 'user-updated'; data: any };
```

#### Update API Routes ✅
1. Messages Routes:
   - ✅ POST /api/messages -> message-created
   - ✅ PATCH /api/messages/[id] -> message-updated
   - ✅ DELETE /api/messages/[id] -> message-deleted

2. Reactions Route:
   - ✅ POST /api/reactions -> reaction-toggled
   - ✅ DELETE /api/reactions -> reaction-toggled

3. Users Routes:
   - ✅ PATCH /api/users/status -> user-status-changed
   - ✅ PATCH /api/users/avatar -> user-updated
   - ✅ PATCH /api/users/name -> user-updated

4. Channels Routes:
   - ✅ POST /api/channels -> channel-created
   - ✅ DELETE /api/channels/[id] -> channel-deleted

### 2. Client-Side Changes ✅

#### Update Socket Subscription (app/page.tsx) ✅
```typescript
// Global events
globalChannel.bind('user-status-changed', (data) => {
  // Update user status in state ✅
});

globalChannel.bind('user-updated', (data) => {
  // Update user data in state ✅
});

globalChannel.bind('channel-created', (data) => {
  // Add new channel to state ✅
});

globalChannel.bind('channel-deleted', (data) => {
  // Remove channel from state ✅
});

// Channel-specific events
channel.bind('message-created', (data) => {
  // Add new message to state ✅
});

channel.bind('message-updated', (data) => {
  // Update message in state ✅
});

channel.bind('message-deleted', (data) => {
  // Remove message from state ✅
});

channel.bind('reaction-toggled', (data) => {
  // Update message reactions in state ✅
});
```

### Implementation Steps

1. Server Changes:
   - [x] Define UpdateType in socket.ts
   - [x] Update messages routes
   - [x] Update reactions route
   - [x] Update users routes
   - [x] Update channels routes

2. Client Changes:
   - [x] Update socket subscription setup
   - [x] Implement specific event handlers
   - [x] Update state management for each event type
   - [ ] Test real-time updates for each event type

### Benefits
- Smaller payloads (only sending changed data)
- More precise updates
- Better debugging (clear event types)
- Improved scalability
- Channel-specific updates stay in their channels

### Testing
1. Test each event type individually:
   - [ ] Test message creation
   - [ ] Test message editing
   - [ ] Test message deletion
   - [ ] Test reaction adding/removing
   - [ ] Test user status changes
   - [ ] Test user profile updates
   - [ ] Test channel creation
   - [ ] Test channel deletion
2. [ ] Verify state updates correctly
3. [ ] Check payload sizes
4. [ ] Test concurrent updates
5. [ ] Verify channel isolation 