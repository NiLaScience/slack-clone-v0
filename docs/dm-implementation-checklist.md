# DM and Self-Note Implementation Checklist

## 1. Database Schema Updates
- [x] Add unique constraint for self-note channels in schema.prisma
  ```prisma
  @@unique([isSelfNote, name], name: "unique_self_note")
  ```
- [x] Channel model has proper flags (isDM, isSelfNote)
- [x] Proper relationships between User, Channel, and ChannelMembership

## 2. Self-Note Channel Constraints
- [x] Create validation middleware for channel operations
  - [x] Verify only one member for self-note channels
  - [x] Prevent adding members to self-note channels
  - [x] Ensure self-note channel name follows format `dm_${userId}`
- [x] Add cleanup function to remove extra members from self-note channels
- [x] Add validation to channel creation endpoint

## 3. Automatic DM Creation
- [x] Update user creation flow in `/api/users/profile/create`
  - [x] Create self-note channel if doesn't exist
  - [x] Fetch all existing users
  - [x] Create DM channels with each existing user
  - [x] Set proper channel flags (isDM: true)
  - [x] Create memberships for both users
- [ ] Add error handling for failed DM creation (needs improvement)
- [ ] Add background job to clean up any duplicate DMs

## 4. UI Updates
- [x] Update Sidebar.tsx
  - [x] Separate DMs and channels in the UI
  - [x] Show "Note to Self" for self-note channels
  - [x] Display other user's name/icon/status for DMs
  - [x] Add proper sorting (self-note first, then alphabetical)
- [x] Update channel header display
  - [x] Show correct user info based on viewer
  - [x] Handle self-note special case
- [x] Add proper status indicators
  - [x] Online/offline status
  - [x] Custom status messages
  - [x] Activity status

## 5. Channel Membership Filtering
- [x] Add membership checks to channel queries
- [x] Update sidebar to only show member channels
- [x] Add proper error handling for non-member access
- [x] Implement channel join/leave logic
  - [x] Prevent leaving self-note channels
  - [x] Handle DM channel special cases

## 6. Display Logic Implementation
- [x] Update getChannelDisplayName utility
  - [x] Handle self-note case
  - [x] Handle DM case with proper user lookup
  - [x] Add fallback for missing users
- [x] Implement proper avatar display logic
- [x] Add status indicator logic
- [x] Handle edge cases (deleted users, etc.)

## 7. Testing Plan
- [ ] User Creation Tests
  - [ ] Verify self-note channel creation
  - [ ] Verify DM channel creation with existing users
  - [ ] Test duplicate prevention
- [ ] Channel Operation Tests
  - [ ] Test self-note constraints
  - [ ] Test DM channel operations
  - [ ] Test membership operations
- [ ] UI Tests
  - [ ] Verify correct name display
  - [ ] Verify correct avatar display
  - [ ] Verify status indicators
  - [ ] Test sorting and filtering
- [ ] Integration Tests
  - [ ] Test full user creation flow
  - [ ] Test DM interaction flow
  - [ ] Test edge cases and error conditions

## 8. Performance Considerations
- [ ] Add proper indexes for common queries
- [ ] Implement caching for frequent lookups
- [ ] Optimize membership checks
- [ ] Add pagination for large channel lists

## 9. Documentation
- [ ] Update API documentation
- [ ] Add schema documentation
- [ ] Document UI components
- [ ] Add testing documentation
- [ ] Document deployment considerations
