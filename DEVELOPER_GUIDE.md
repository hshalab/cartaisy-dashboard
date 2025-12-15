# Developer Guide - API Structure

Quick reference for working with the API structure in Cartaisy Dashboard.

## Quick Start

### Running the Project

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm run test:api

# Build for production
npm run build
```

## Working with Protected API Routes

### Creating a New Protected Route

Use the `withAuth` middleware for simple protection:

```typescript
// /app/api/myroute/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withAuth, successResponse, errorResponse } from '@/lib/api';

export const GET = (request: NextRequest) =>
  withAuth(request, async (request, storeId) => {
    // storeId is guaranteed to be valid here
    // Access authenticated user's data using storeId
    return successResponse({ storeId, message: 'Success' });
  });
```

### Manual Protection (if needed)

```typescript
import { getCurrentUserStoreId } from '@/lib/api';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const storeId = await getCurrentUserStoreId();

  if (!storeId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Use storeId here
  return NextResponse.json({ success: true, data: { storeId } });
}
```

## Working with Models

### AppConfig Model

```typescript
import { AppConfig } from '@/models/AppConfig';
import { connectToDatabase } from '@/lib/db';

// Get config for a store
await connectToDatabase();
const config = await AppConfig.findOne({ storeId: 'store-123' });

// Create or update config
let config = await AppConfig.findOne({ storeId: 'store-123' });
if (!config) {
  config = new AppConfig({
    storeId: 'store-123',
    components: [],
  });
}
config.components = [{ id: '1', type: 'carousel', ... }];
await config.save();
```

### User Model

```typescript
import { User } from '@/models/User';
import { connectToDatabase } from '@/lib/db';

await connectToDatabase();

// Create user
const user = new User({
  email: 'user@example.com',
  password: 'plain-text-password', // Hashed automatically
  storeId: 'store-123',
});
await user.save();

// Find user
const user = await User.findOne({ email: 'user@example.com' });

// Verify password
const isValid = await user.comparePassword('password');
```

## API Response Format

### Success Response

```typescript
import { successResponse } from '@/lib/api';

return successResponse(
  { id: '1', name: 'Item' },
  'Operation completed',
  200
);

// Returns:
// {
//   success: true,
//   data: { id: '1', name: 'Item' },
//   message: 'Operation completed'
// }
```

### Error Response

```typescript
import { errorResponse } from '@/lib/api';

return errorResponse('Not found', 'Item not found', 404);

// Returns:
// {
//   error: 'Not found',
//   message: 'Item not found'
// }
```

## Session and Authentication

### Getting Current User Info

```typescript
import { getCurrentUserStoreId } from '@/lib/api';
import { getServerSession } from 'next-auth/next';
import { authConfig } from '@/lib/auth';

// Quick method - just storeId
const storeId = await getCurrentUserStoreId();

// Full method - entire session
const session = await getServerSession(authConfig);
const userId = session?.user?.id;
const email = session?.user?.email;
const storeId = session?.user?.storeId;
```

## Type Safety

### Using Types in API Handlers

```typescript
import { AppConfig, Component } from '@/types';

export async function GET(request: NextRequest) {
  // Type-safe config
  const config: AppConfig = {
    storeId: 'store-123',
    components: [
      {
        id: 'c1',
        type: 'carousel',
        title: 'Featured',
        position: 0,
        isActive: true,
      },
    ],
  };

  return successResponse(config);
}
```

## Debugging

### Enable Debug Logging

Add to environment or code:

```typescript
// In route handlers
console.log('Debug info:', { storeId, config });
```

### Check Session

```typescript
import { getServerSession } from 'next-auth/next';
import { authConfig } from '@/lib/auth';

const session = await getServerSession(authConfig);
console.log('Session:', session);
// Check if session.user.storeId exists
```

### Test with curl

```bash
# Without authentication (should return 401)
curl http://localhost:3000/api/config

# With session cookie (if you have a session)
curl -H "Cookie: next-auth.session-token=..." http://localhost:3000/api/config
```

## Common Patterns

### 1. Get User's Data with Protection

```typescript
export const GET = (request: NextRequest) =>
  withAuth(request, async (request, storeId) => {
    await connectToDatabase();
    const config = await AppConfig.findOne({ storeId });
    return successResponse(config);
  });
```

### 2. Create or Update User's Data

```typescript
export const POST = (request: NextRequest) =>
  withAuth(request, async (request, storeId) => {
    const body = await request.json();
    await connectToDatabase();

    let doc = await AppConfig.findOne({ storeId });
    if (!doc) {
      doc = new AppConfig({ storeId });
    }
    Object.assign(doc, body);
    await doc.save();

    return successResponse(doc, 'Updated successfully');
  });
```

### 3. Delete User's Data

```typescript
export const DELETE = (request: NextRequest) =>
  withAuth(request, async (request, storeId) => {
    await connectToDatabase();
    await AppConfig.deleteOne({ storeId });
    return successResponse(null, 'Deleted successfully');
  });
```

## Environment Variables

Required in `.env.local`:

```env
# MongoDB connection
MONGODB_URI=mongodb://...

# NextAuth secret (generate with: openssl rand -base64 32)
NEXTAUTH_SECRET=...

# NextAuth URL
NEXTAUTH_URL=http://localhost:3000
```

## Testing the API

### Manual Testing

1. Start server: `npm run dev`
2. Create account at `http://localhost:3000/signup`
3. Login at `http://localhost:3000/login`
4. Test routes with curl or Postman

### Automated Testing

```bash
npm run test:api
```

This tests:
- Unauthenticated requests (should return 401)
- Response format validation
- Route protection

## Common Issues

### "storeId does not exist on type"

**Solution:** Make sure `/types/next-auth.d.ts` exists and extends NextAuth types properly.

### "401 Unauthorized" on authenticated route

**Possible causes:**
- Session cookie missing
- Logged out session
- Cookie domain/path mismatch
- NEXTAUTH_SECRET not set

**Debug:**
```typescript
const session = await getServerSession(authConfig);
console.log('Session:', session); // Should show user info
```

### Database connection timeout

**Solution:** Check `MONGODB_URI` in `.env.local` is correct and MongoDB is running.

### Session not persisting

**Possible causes:**
- Missing `NEXTAUTH_SECRET`
- Cookie settings incorrect
- Browser privacy settings blocking cookies

## Next Steps

- See `API_STRUCTURE.md` for detailed API documentation
- See `PHASE_5_SUMMARY.md` for implementation details
- Check individual route files in `/app/api/`
