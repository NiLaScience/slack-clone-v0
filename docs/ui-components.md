# UI Components Documentation

## Core Components

### Sidebar (`components/Sidebar.tsx`)
- Main navigation component
- Displays channels list and direct messages
- Shows user status and profile settings
- Features:
  - Channel list with public/private indicators
  - DM list with online status indicators
  - User profile status with emoji avatar
  - Sign out button
  - Responsive design (mobile/desktop)

### MessageList (`components/MessageList.tsx`)
- Main chat interface
- Displays messages in a channel
- Features:
  - Message threading
  - Reactions
  - File attachments
  - Message editing/deletion
  - Real-time updates
  - Infinite scroll

### ThreadView (`components/ThreadView.tsx`)
- Thread discussion interface
- Shows parent message and replies
- Features:
  - Reply composition
  - Reaction support
  - File attachments
  - Real-time updates

### SearchBar (`components/SearchBar.tsx`)
- Global search interface
- Features:
  - Full-text search across messages
  - File search
  - Thread context
  - Jump to message/thread
  - Real-time results

## UI Elements (shadcn/ui)

### Buttons
- Primary actions
- Ghost variants for navigation
- Icon buttons for compact actions

### Input Fields
- Text input for messages
- Search input
- Status updates

### Dialogs
- Channel creation
- User profile editing
- Confirmation modals

### Sheets
- Mobile sidebar
- Thread view on mobile

### ScrollArea
- Virtualized scrolling for messages
- Smooth scrolling for sidebar

## Status Indicators

### CircleStatus
- Online/offline indicator
- Used in DM list and user profiles

### UserProfileStatus
- User status management
- Emoji avatar selection
- Status message setting

## Interactive Elements

### ReactionPicker
- Emoji reaction selector
- Used in messages and threads

### EmojiPicker
- Full emoji selector
- Used in status and reactions

### CreateChannelDialog
- Channel creation interface
- Public/private toggle
- Name input

## Layout Components

### Main Layout
- Responsive grid system
- Sidebar/main content/thread layout
- Mobile-first design

## Styling

- Tailwind CSS for utility-first styling
- Dark theme by default
- Responsive breakpoints
- Custom animations for interactions 