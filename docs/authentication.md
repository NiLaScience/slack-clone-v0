# Authentication Documentation

## Overview

The application uses Clerk for authentication, providing a secure and scalable authentication system that integrates with Next.js and our real-time features.

## Authentication Flow

### Sign In Process
1. User redirected to `/sign-in`
2. Clerk handles authentication
3. On success:
   - User redirected to main app
   - Profile created/fetched via `/api/users/profile/create`
   - Socket connection established
   - Initial data loaded

### Session Management
- JWT-based authentication
- Automatic token refresh
- Secure session persistence
- Cross-tab session sync

## Integration Points

### API Routes
```typescript
// Middleware protection
import { auth } from '@clerk/nextjs/server'

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  // Protected route logic
}
```

### React Components
```typescript
// Client-side auth hooks
import { useAuth } from '@clerk/nextjs'

export function Component() {
  const { userId } = useAuth()
  // Component logic
}
```

### WebSocket Authentication
```typescript
// Socket.IO auth integration
const socket = io({
  path: '/api/socketio',
  auth: (cb) => {
    cb({ token: getAuthToken() })
  }
})
```

## Protected Resources

### Components
- `Sidebar`: Requires auth for user profile
- `MessageList`: Requires auth for sending/editing
- `ThreadView`: Requires auth for interactions
- `SearchBar`: Requires auth for searches

### API Endpoints
- All `/api/*` routes protected by middleware
- WebSocket connections authenticated
- File uploads require auth
- Search queries authenticated

### Database Operations
- User ID from auth used for:
  - Message ownership
  - Channel membership
  - Reaction tracking
  - Profile management

## User Management

### Profile Creation
```typescript
// Automatic profile creation on first auth
async function createProfile(userId: string) {
  const profile = await prisma.user.create({
    data: {
      id: userId,
      name: generateName(),
      avatar: generateAvatar(),
      // ...
    }
  })
  return profile
}
```

### Profile Updates
- Status changes require auth
- Avatar updates verified
- Username changes tracked
- Online status managed

## Security Features

### CORS & CSP
```typescript
// Security headers
{
  'Content-Security-Policy': "default-src 'self'",
  'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_APP_URL,
  // ...
}
```

### Rate Limiting
- Auth-based rate limits
- IP-based fallback
- Graduated restrictions
- Abuse prevention

### Token Management
- Secure token storage
- Automatic rotation
- Expiry handling
- Refresh logic

## Error Handling

### Authentication Errors
```typescript
try {
  const { userId } = await auth()
  // ...
} catch (error) {
  if (error.type === 'auth/invalid-token') {
    // Handle invalid token
  }
  // Handle other errors
}
```

### Session Recovery
- Automatic reconnection
- State preservation
- Error notifications
- Graceful degradation

## Development Setup

### Environment Variables
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

### Testing
```typescript
// Auth mocking
jest.mock('@clerk/nextjs', () => ({
  auth: () => ({ userId: 'test_user' }),
  // ...
}))
```

## Production Considerations

### Security Checklist
- [ ] SSL/TLS enabled
- [ ] CSRF protection
- [ ] XSS prevention
- [ ] Rate limiting
- [ ] Secure headers
- [ ] Auth logging
- [ ] Error handling
- [ ] Token rotation

### Monitoring
- Auth success/failure rates
- Session durations
- Token usage patterns
- Error frequencies

### Compliance
- GDPR compliance
- Data retention
- Privacy policy
- Terms of service

## Integration Examples

### Protected Route
```typescript
// pages/protected.tsx
import { useAuth } from '@clerk/nextjs'
import { redirect } from 'next/navigation'

export default function ProtectedPage() {
  const { userId } = useAuth()
  
  if (!userId) {
    redirect('/sign-in')
    return null
  }

  return <ProtectedContent />
}
```

### API Authentication
```typescript
// app/api/protected/route.ts
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Protected logic here
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Authentication error' },
      { status: 500 }
    )
  }
}
```

### WebSocket Auth
```typescript
// lib/socket.ts
io.use((socket, next) => {
  const token = socket.handshake.auth.token
  try {
    const decoded = verifyToken(token)
    socket.userId = decoded.sub
    next()
  } catch (err) {
    next(new Error('Authentication error'))
  }
})
``` 