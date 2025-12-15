/**
 * Cartaisy Backend API Client
 *
 * Auto-generated types and functions for calling the Railway backend.
 * Use these in API routes (server-side) for type-safe backend calls.
 *
 * Usage in API routes:
 * ```typescript
 * import { getProfile } from '@/lib/api';
 * import type { GetProfileResponse } from '@/lib/api';
 *
 * export async function GET() {
 *   const session = await getServerSession(authConfig);
 *   const response = await getProfile({
 *     token: session?.user?.accessToken,
 *     storeId: session?.user?.storeId,
 *   });
 *
 *   if (response.status === 200) {
 *     return NextResponse.json({ success: true, data: response.data });
 *   }
 *   return NextResponse.json({ error: 'Failed' }, { status: response.status });
 * }
 * ```
 */

// Re-export all schemas/types
export * from './generated/cartaisyAPI.schemas';

// Re-export API functions by domain
export * from './generated/addresses/addresses';
export * from './generated/authentication/authentication';
export * from './generated/cart/cart';
export * from './generated/checkout/checkout';
export * from './generated/collections/collections';
export * from './generated/favorites/favorites';
export * from './generated/payment-methods/payment-methods';
export * from './generated/products/products';
export * from './generated/recommendations/recommendations';
export * from './generated/search/search';

// Re-export custom fetch options type and token storage
export type { CustomFetchOptions } from './mutator/custom-instance';
export { tokenStorage, customInstance } from './mutator/custom-instance';
