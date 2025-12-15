# Quick Reference - Phase 5

## Available Commands

```bash
# Development
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Build for production
npm run start        # Start production server
npm run test:api     # Test API route protection
```

## API Helpers (from `/lib/api.ts`)

### Import
```typescript
import {
  withAuth,
  successResponse,
  errorResponse,
  getCurrentUserStoreId
} from '@/lib/api';
```

### Protected Route Pattern
```typescript
export const GET = (request) =>
  withAuth(request, async (request, storeId) => {
    // storeId is guaranteed valid
    return successResponse(data);
  });
```

### Response Patterns
```typescript
// Success
successResponse({ id: '1', name: 'Item' }, 'Success message', 200)

// Error
errorResponse('Not found', 'Item not found', 404)
```

## Database Models

### AppConfig
```typescript
import { AppConfig } from '@/models/AppConfig';

// Create/update
let config = await AppConfig.findOne({ storeId: 'store-id' });
if (!config) {
  config = new AppConfig({ storeId: 'store-id', components: [] });
}
config.components = [{ id: 'c1', type: 'carousel', ... }];
await config.save();

// Read
const config = await AppConfig.findOne({ storeId: 'store-id' });

// Delete
await AppConfig.deleteOne({ storeId: 'store-id' });
```

### User
```typescript
import { User } from '@/models/User';

// Create
const user = new User({
  email: 'user@example.com',
  password: 'plaintext', // Hashed automatically
  storeId: 'store-id',
});
await user.save();

// Find
const user = await User.findOne({ email: 'user@example.com' });

// Verify password
const isValid = await user.comparePassword('password');
```

## Session/Auth

### Get Session
```typescript
import { getServerSession } from 'next-auth/next';
import { authConfig } from '@/lib/auth';

const session = await getServerSession(authConfig);
const { id, email, storeId } = session?.user || {};
```

### Get StoreId Only
```typescript
import { getCurrentUserStoreId } from '@/lib/api';

const storeId = await getCurrentUserStoreId();
```

## Type Definitions

```typescript
import type {
  User,
  Component,
  AppConfig,
  ShopifyCollection,
  ApiSuccessResponse,
  ApiErrorResponse,
  ApiResponse
} from '@/types';
```

## Common Routes

```
GET  /api/config              → Fetch user's config
POST /api/config              → Create/update user's config
GET  /api/shopify/collections → Fetch collections (mock)
```

## Environment Variables (`.env.local`)

```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
NEXTAUTH_SECRET=<random-string>
NEXTAUTH_URL=http://localhost:3000
```

## Testing API

```bash
# All unauthenticated requests should return 401
curl http://localhost:3000/api/config
# { "error": "Unauthorized" }

# With valid session cookie
curl -H "Cookie: next-auth.session-token=..." http://localhost:3000/api/config
# { "success": true, "data": {...} }

# Run test suite
npm run test:api
```

## Response Format Reference

### Success (200)
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

### Error (4xx/5xx)
```json
{
  "error": "Error type",
  "message": "Optional detailed message"
}
```

### Unauthenticated (401)
```json
{
  "error": "Unauthorized"
}
```

## TypeScript Type Safety

```typescript
// API responses
type GetConfigResponse = ApiSuccessResponse<AppConfig>;
type ErrorResponse = ApiErrorResponse;
type ConfigResponse = ApiResponse<AppConfig>;

// Function return types
async function fetchConfig(storeId: string): Promise<AppConfig | null> {
  const response = await fetch(`/api/config`);
  const data: ApiSuccessResponse<AppConfig> = await response.json();
  return data.data;
}
```

## Development Workflow

1. **Create new API route**
   ```
   /app/api/feature/route.ts
   ```

2. **Use withAuth middleware**
   ```typescript
   export const GET = (request) =>
     withAuth(request, async (request, storeId) => {
       // Your logic here
     });
   ```

3. **Use response helpers**
   ```typescript
   return successResponse(data);
   return errorResponse('error');
   ```

4. **Test with npm run test:api**
   ```bash
   npm run test:api
   ```

5. **Check build compiles**
   ```bash
   npm run build
   ```

## Documentation Files

- **API_STRUCTURE.md** - Complete API specs
- **DEVELOPER_GUIDE.md** - Detailed examples and patterns
- **PHASE_5_SUMMARY.md** - What was implemented
- **PHASE_5_CHECKLIST.md** - Verification checklist
- **QUICK_REFERENCE.md** - This file (quick lookup)

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| TypeScript error about storeId | Make sure `/types/next-auth.d.ts` exists |
| 401 on authenticated route | Check session: `getServerSession(authConfig)` |
| MongoDB connection fails | Verify `MONGODB_URI` in `.env.local` |
| Build fails | Run `npm run build` to see TypeScript errors |
| Session not persisting | Check `NEXTAUTH_SECRET` is set |

## Next Steps

Ready for **Phase 6: Component Management API**

The foundation is set. Next phase will:
- Add component CRUD endpoints
- Implement component validation
- Build component service layer
- Add more API tests
