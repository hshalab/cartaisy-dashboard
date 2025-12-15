# API Structure - Phase 5

## Overview

This document describes the API structure, route patterns, authentication, and response formats for the Cartaisy Dashboard.

## Project Structure

```
app/api/
├── auth/
│   └── [...]nextauth]/route.ts      # NextAuth authentication handler
├── config/
│   └── route.ts                      # App configuration endpoints
└── shopify/
    └── collections/
        └── route.ts                  # Shopify collections endpoints

lib/
├── api.ts                            # API utilities and helpers
├── auth.ts                           # NextAuth configuration
└── db.ts                             # Database connection management

models/
├── AppConfig.ts                      # AppConfig Mongoose schema
└── User.ts                           # User Mongoose schema

types/
└── index.ts                          # TypeScript type definitions
```

## Type Definitions

Located in `/types/index.ts`:

### User Type
```typescript
interface User {
  id: string;
  email: string;
  storeId: string;
  storeName?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
```

### Component Type
```typescript
interface Component {
  id: string;
  type: string;
  title: string;
  position: number;
  isActive: boolean;
}
```

### AppConfig Type
```typescript
interface AppConfig {
  _id?: string;
  storeId: string;
  components: Component[];
  updatedAt?: Date;
  createdAt?: Date;
}
```

### API Response Types
```typescript
interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

interface ApiErrorResponse {
  error: string;
  message?: string;
}

type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
```

## Models

### AppConfig Model (`/models/AppConfig.ts`)

Stores mobile app configuration for each store.

**Schema:**
- `storeId` (String, required, unique, indexed): Store identifier
- `components` (Array of objects): Array of component configurations
- `updatedAt` (Date, automatic): Last update timestamp
- `createdAt` (Date, automatic): Creation timestamp

**Features:**
- Automatic timestamp management
- Indexed `storeId` for fast lookups
- Flexible component schema for future extensibility

### User Model (`/models/User.ts`)

Stores user authentication and store information.

**Schema:**
- `email` (String, required, unique, lowercase, trimmed)
- `password` (String, required, bcrypt hashed)
- `storeId` (String, required, unique)
- `storeName` (String, optional)
- `createdAt` (Date, automatic)
- `updatedAt` (Date, automatic)

**Features:**
- Password hashing via bcrypt (pre-save hook)
- `comparePassword()` method for authentication

## API Utilities (`/lib/api.ts`)

### Functions

#### `getCurrentUserStoreId()`
Gets the current user's storeId from the session.

```typescript
const storeId = await getCurrentUserStoreId();
// Returns: string | null
```

#### `successResponse<T>(data, message?, status?)`
Creates a standardized success response.

```typescript
return successResponse({ data: config }, 'Config loaded', 200);
// Returns: { success: true, data: { ... }, message: '...' }
```

#### `errorResponse(error, message?, status?)`
Creates a standardized error response.

```typescript
return errorResponse('Unauthorized', 'Authentication required', 401);
// Returns: { error: 'Unauthorized', message: '...' }
```

#### `withAuth(request, handler)`
Middleware wrapper for protected routes. Automatically:
- Checks authentication
- Extracts storeId
- Returns 401 if unauthenticated
- Wraps errors in try-catch

```typescript
export const GET = (request) =>
  withAuth(request, async (request, storeId) => {
    // storeId is guaranteed to be valid here
    return successResponse({ storeId });
  });
```

## API Routes

### GET `/api/config`

**Authentication:** Required (401 if not authenticated)

**Description:** Fetch app configuration for the authenticated user's store.

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "storeId": "store-123",
    "components": [
      {
        "id": "comp-1",
        "type": "carousel",
        "title": "Featured Products",
        "position": 0,
        "isActive": true
      }
    ],
    "createdAt": "2024-11-24T...",
    "updatedAt": "2024-11-24T..."
  }
}
```

**Error Response (401):**
```json
{
  "error": "Unauthorized"
}
```

### POST `/api/config`

**Authentication:** Required (401 if not authenticated)

**Description:** Create or update app configuration for the authenticated user's store.

**Request Body:**
```json
{
  "components": [
    {
      "id": "comp-1",
      "type": "carousel",
      "title": "Featured Products",
      "position": 0,
      "isActive": true
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "storeId": "store-123",
    "components": [...],
    "createdAt": "2024-11-24T...",
    "updatedAt": "2024-11-24T..."
  }
}
```

**Error Response (401):**
```json
{
  "error": "Unauthorized"
}
```

### GET `/api/shopify/collections`

**Authentication:** Required (401 if not authenticated)

**Description:** Fetch Shopify collections for the authenticated user's store.

**Query Parameters:**
- None (placeholder route)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "title": "New Arrivals",
      "handle": "new-arrivals",
      "productsCount": 24
    },
    {
      "id": "2",
      "title": "Best Sellers",
      "handle": "best-sellers",
      "productsCount": 18
    }
  ]
}
```

**Note:** Currently returns mock data. Will be implemented with real Shopify API integration in future phases.

**Error Response (401):**
```json
{
  "error": "Unauthorized"
}
```

## Authentication

### How It Works

1. **NextAuth Setup** (`/lib/auth.ts`)
   - Uses Credentials Provider
   - Stores user ID and storeId in JWT token
   - Session includes user.storeId

2. **API Route Protection**
   - Each route calls `getServerSession(authConfig)`
   - Returns 401 if session is missing or invalid
   - Automatically filters data by user's storeId

3. **Session Data**
   ```typescript
   {
     user: {
       id: string;      // MongoDB user ID
       email: string;
       storeId: string; // Store identifier
     }
   }
   ```

## Data Isolation

**Important:** All API routes automatically filter by the authenticated user's storeId:

```typescript
// User can only access their own store's config
const config = await AppConfig.findOne({
  storeId: session.user.storeId
});
```

This ensures users can only access data for their own store.

## Error Handling

### Standard Error Responses

- **401 Unauthorized** - Authentication failed or missing
- **400 Bad Request** - Invalid request data
- **500 Internal Server Error** - Server-side error

All error responses follow the `ApiErrorResponse` format:
```json
{
  "error": "Error type",
  "message": "Detailed error message"
}
```

## Testing

Run the API test suite:

```bash
npm run test:api
```

This tests:
- Unauthenticated requests return 401
- Proper error response formats
- Route protection mechanisms

## Future Phases

- [ ] Real Shopify API integration
- [ ] More granular API permissions
- [ ] Rate limiting
- [ ] API key authentication option
- [ ] Additional configuration endpoints
