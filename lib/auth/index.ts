/**
 * Auth module exports - CLIENT-SIDE ONLY
 *
 * Usage:
 *   // Client-side (React components)
 *   import { useAuth, useSession, AuthProvider, signOut } from '@/lib/auth';
 *   import type { AuthUser, LoginCredentials } from '@/lib/auth';
 *
 *   // Server-side (API routes) - use separate import:
 *   import { getServerSession, authConfig } from '@/lib/auth/server';
 */

// Export types
export * from './types';

// Export context and hooks (client-side only)
export { AuthProvider, useAuth, useSession, signOut } from './auth-context';

// Re-export token storage for advanced use cases
export { tokenStorage } from '@/lib/api/mutator/custom-instance';
